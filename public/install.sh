#!/bin/sh
set -eu

repo="B-Divyesh/sf-private-caption-export"
api="https://api.github.com/repos/$repo/releases/latest"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT HUP INT TERM

case "$(uname -s)" in
  Linux) suffix='\.AppImage' ;;
  Darwin) suffix='\.dmg' ;;
  *) echo "Use install.ps1 on Windows." >&2; exit 1 ;;
esac

release_json="$tmp_dir/release.json"
curl -fsSL -H "Accept: application/vnd.github+json" "$api" -o "$release_json"
asset_url="$(sed -n 's/.*"browser_download_url": "\([^"]*'"$suffix"'\)".*/\1/p' "$release_json" | head -n 1)"
[ -n "$asset_url" ] || { echo "A package for this system is not published yet." >&2; exit 1; }

asset_name="${asset_url##*/}"
release_base="${asset_url%/*}"
curl -fsSL "$asset_url" -o "$tmp_dir/$asset_name"
curl -fsSL "$release_base/SHA256SUMS" -o "$tmp_dir/SHA256SUMS"
expected="$(awk -v name="$asset_name" '$2 == name { print $1 }' "$tmp_dir/SHA256SUMS")"
[ -n "$expected" ] || { echo "The checksum list does not contain $asset_name." >&2; exit 1; }
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp_dir/$asset_name" | awk '{ print $1 }')"
else
  actual="$(shasum -a 256 "$tmp_dir/$asset_name" | awk '{ print $1 }')"
fi
[ "$expected" = "$actual" ] || { echo "Checksum verification failed." >&2; exit 1; }

if [ "$(uname -s)" = "Linux" ]; then
  install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "$install_dir"
  install -m 755 "$tmp_dir/$asset_name" "$install_dir/private-caption-export"
  echo "Installed Private Caption Export at $install_dir/private-caption-export."
else
  destination="$HOME/Downloads/$asset_name"
  cp "$tmp_dir/$asset_name" "$destination"
  echo "Verified and saved $destination. Open the DMG, then drag the app to Applications."
fi
