use std::{
    fs,
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

#[tauri::command]
async fn transcribe_audio(audio_path: String, model_path: String) -> Result<String, String> {
    let command = if cfg!(windows) {
        "whisper-cli.exe".to_string()
    } else {
        "whisper-cli".to_string()
    };
    tauri::async_runtime::spawn_blocking(move || {
        transcribe_with_command(audio_path, model_path, &command)
    })
    .await
    .map_err(|error| format!("Local transcription stopped: {error}"))?
}

fn transcribe_with_command(
    audio_path: String,
    model_path: String,
    command: &str,
) -> Result<String, String> {
    if !audio_path.to_ascii_lowercase().ends_with(".wav") {
        return Err("Choose a WAV audio file.".into());
    }
    if !std::path::Path::new(&audio_path).is_file() {
        return Err("The audio file could not be opened.".into());
    }
    if !std::path::Path::new(&model_path).is_file() {
        return Err("The Whisper model file could not be opened.".into());
    }
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    let output_base = std::env::temp_dir().join(format!(
        "private-caption-export-{}-{}",
        std::process::id(),
        stamp
    ));
    let status = Command::new(command)
        .args(["-m", &model_path, "-f", &audio_path, "-osrt", "-of"])
        .arg(&output_base)
        .status()
        .map_err(|_| {
            "whisper-cli was not found. Install whisper.cpp and add whisper-cli to PATH."
                .to_string()
        })?;
    let output_path = output_base.with_extension("srt");
    if !status.success() {
        let _ = fs::remove_file(output_path);
        return Err(
            "whisper-cli could not transcribe this audio. Check the model and WAV format.".into(),
        );
    }
    let transcript = fs::read_to_string(&output_path);
    let _ = fs::remove_file(output_path);
    transcript.map_err(|_| "The local transcript file was not created.".to_string())
}

#[cfg(all(test, unix))]
mod tests {
    use super::transcribe_with_command;
    use std::{
        fs,
        os::unix::fs::PermissionsExt,
        time::{SystemTime, UNIX_EPOCH},
    };

    #[test]
    fn local_transcription_runs_installed_command_without_network() {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("pce-test-{stamp}"));
        fs::create_dir(&dir).unwrap();
        let audio = dir.join("meeting.wav");
        let model = dir.join("model.bin");
        let command = dir.join("fake-whisper");
        fs::write(&audio, b"RIFF test fixture").unwrap();
        fs::write(&model, b"model fixture").unwrap();
        fs::write(&command, b"#!/bin/sh\nfor arg in \"$@\"; do last=\"$arg\"; done\nprintf '1\\n00:00:00,000 --> 00:00:02,000\\nLocal result\\n' > \"$last.srt\"\n").unwrap();
        let mut permissions = fs::metadata(&command).unwrap().permissions();
        permissions.set_mode(0o700);
        fs::set_permissions(&command, permissions).unwrap();

        let result = transcribe_with_command(
            audio.to_string_lossy().into_owned(),
            model.to_string_lossy().into_owned(),
            command.to_string_lossy().as_ref(),
        )
        .unwrap();

        assert!(result.contains("Local result"));
        fs::remove_dir_all(dir).unwrap();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![transcribe_audio])
        .run(tauri::generate_context!())
        .expect("error while running Private Caption Export");
}
