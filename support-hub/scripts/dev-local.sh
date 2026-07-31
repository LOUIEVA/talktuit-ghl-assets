#!/usr/bin/env bash
set -euo pipefail
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:/mingw64/bin:$PATH"
export npm_config_script_shell="C:\\Program Files\\Git\\bin\\bash.exe"
exec npm run dev
