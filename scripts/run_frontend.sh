#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

exec python -m http.server 5500 --bind 127.0.0.1
