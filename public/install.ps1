$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-private-caption-export"
$release = Invoke-RestMethod -Headers @{ Accept = "application/vnd.github+json" } -Uri "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.msi$' } | Select-Object -First 1
if (-not $asset) { throw "A Windows MSI is not published yet." }

$work = Join-Path ([System.IO.Path]::GetTempPath()) ("private-caption-export-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $work | Out-Null
try {
  $msi = Join-Path $work $asset.name
  $checksums = Join-Path $work "SHA256SUMS"
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msi
  Invoke-WebRequest -Uri (($asset.browser_download_url -replace '/[^/]+$', '') + '/SHA256SUMS') -OutFile $checksums
  $line = Get-Content $checksums | Where-Object { $_ -match ([regex]::Escape($asset.name) + '$') } | Select-Object -First 1
  if (-not $line) { throw "The checksum list does not contain $($asset.name)." }
  $expected = ($line -split '\s+')[0].ToLowerInvariant()
  $actual = (Get-FileHash -Algorithm SHA256 $msi).Hash.ToLowerInvariant()
  if ($expected -ne $actual) { throw "Checksum verification failed." }
  Write-Output "Checksum verified. Starting the Private Caption Export installer."
  Start-Process msiexec.exe -ArgumentList "/i `"$msi`"" -Wait
  Write-Output "Private Caption Export installation finished."
} finally {
  Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}
