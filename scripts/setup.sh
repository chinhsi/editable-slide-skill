#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION=v24.22.0
case "$(uname -s)" in Darwin) PLATFORM=darwin;; Linux) PLATFORM=linux;; *) echo 'Use setup.ps1 on Windows'; exit 1;; esac
case "$(uname -m)" in arm64|aarch64) ARCH=arm64;; x86_64) ARCH=x64;; *) echo 'Unsupported architecture'; exit 1;; esac
mkdir -p "$ROOT/.runtime"
if [ ! -x "$ROOT/.runtime/node/bin/node" ]; then
  FILE="node-$VERSION-$PLATFORM-$ARCH.tar.gz"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  curl --fail --location --retry 2 "https://nodejs.org/dist/$VERSION/$FILE" -o "$TMP/$FILE"
  curl --fail --location "https://nodejs.org/dist/$VERSION/SHASUMS256.txt" -o "$TMP/sums"
  EXPECTED="$(awk -v file="$FILE" '$2 == file {print $1}' "$TMP/sums")"
  if command -v shasum >/dev/null; then ACTUAL="$(shasum -a 256 "$TMP/$FILE" | awk '{print $1}')"; else ACTUAL="$(sha256sum "$TMP/$FILE" | awk '{print $1}')"; fi
  [ -n "$EXPECTED" ] && [ "$ACTUAL" = "$EXPECTED" ] || { echo 'Checksum failed'; exit 1; }
  tar -xzf "$TMP/$FILE" -C "$TMP"
  mv "$TMP/node-$VERSION-$PLATFORM-$ARCH" "$ROOT/.runtime/node"
fi
export PATH="$ROOT/.runtime/node/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/.runtime/browsers"
cd "$ROOT"
npm ci --no-audit --no-fund
node node_modules/playwright/cli.js install chromium
node scripts/doctor.mjs
