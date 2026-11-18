#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  WhatsApp Night Watch — one-command installer for the Mac mini (Qoura AI)
#
#  From the repo folder on the Mac mini:
#      bash 05-Hermes-Agents/whatsapp-night-watch/macos/install.sh
#
#  Options:
#      --scan-time 02:30      nightly scan time (Asia/Dubai)
#      --brief-time 07:30     morning brief time
#      --scheduler auto|hermes|launchd   (auto = Hermes if installed)
#      --deliver telegram     Hermes delivery target (later: whatsapp)
#      --skip-selftest
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_HOME="${WA_WATCH_HOME:-$HOME/.qoura/wa-watch}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCAN_TIME="02:30"
BRIEF_TIME="07:30"
SCHEDULER="auto"
DELIVER="telegram"
SELFTEST=1

usage() { sed -n '2,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scan-time) SCAN_TIME="$2"; shift 2 ;;
    --brief-time) BRIEF_TIME="$2"; shift 2 ;;
    --scheduler) SCHEDULER="$2"; shift 2 ;;
    --deliver) DELIVER="$2"; shift 2 ;;
    --skip-selftest) SELFTEST=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

step() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m  %s\n' "$*"; }
die()  { printf '\033[1;31mxx\033[0m  %s\n' "$*"; exit 1; }

[[ "$(uname -s)" == "Darwin" ]] || die "This installer is for macOS (the Mac mini)."
[[ -d "/Applications/Google Chrome.app" ]] || die "Install Google Chrome first: https://www.google.com/chrome/"

step "1/6  uv (Python manager)"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
uv --version

step "2/6  Private data folder: $APP_HOME"
mkdir -p "$APP_HOME"/{bin,data,logs,reports,debug}
chmod 700 "$APP_HOME"

step "3/6  Python environment + wa-watch"
[[ -x "$APP_HOME/venv/bin/python" ]] || uv venv --python 3.12 "$APP_HOME/venv"
uv pip install --python "$APP_HOME/venv/bin/python" --upgrade "$SRC_DIR"
cat > "$APP_HOME/bin/wa-watch" <<EOF
#!/bin/bash
# wa-watch launcher (written by macos/install.sh)
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin:\$PATH"
exec "$APP_HOME/venv/bin/python" -m wa_watch "\$@"
EOF
chmod 755 "$APP_HOME/bin/wa-watch"
mkdir -p "$HOME/.local/bin"
ln -sf "$APP_HOME/bin/wa-watch" "$HOME/.local/bin/wa-watch"
WA="$APP_HOME/bin/wa-watch"

step "4/6  Config ($APP_HOME/config.yaml)"
"$WA" init

if [[ "$SELFTEST" == 1 ]]; then
  step "5/6  Offline self-test on a fake WhatsApp page (your account is not touched)"
  "$WA" selftest || warn "Self-test failed. Re-run with: wa-watch -v selftest"
else
  step "5/6  Self-test skipped"
fi

step "6/6  Scheduling"
if [[ "$SCHEDULER" == "auto" ]]; then
  if command -v hermes >/dev/null 2>&1 || [[ -d "$HOME/.hermes" ]]; then SCHEDULER="hermes"; else SCHEDULER="launchd"; fi
fi
if [[ "$SCHEDULER" == "hermes" ]]; then
  "$WA" hermes-install --scan-time "$SCAN_TIME" --brief-time "$BRIEF_TIME" --deliver "$DELIVER"
else
  warn "Hermes not found — using macOS launchd and sending the brief straight to Telegram."
  "$WA" launchd-install --scan-time "$SCAN_TIME" --brief-time "$BRIEF_TIME"
  "$WA" config-set delivery.mode direct
fi

cat <<EOF

────────────────────────────────────────────────────────────────────
 ✅ Installed. The rest takes ~5 minutes:

 1) Link WhatsApp once (you, at the Mac mini):
      wa-watch login            → scan the QR in the Chrome window
    Not at the Mac? From Telegram ask Hermes «اربط الواتساب», or run:
      wa-watch login --phone +9715XXXXXXXX   → an 8-character code arrives on Telegram

 2) Telegram: open your Hermes bot and send  /sethome  (once)

 3) Keep the Mac mini awake at night:
      sudo pmset -a sleep 0 disksleep 0 autorestart 1
    and in System Settings → Users & Groups → "Automatically log in as" (needs FileVault off)

 4) First real scan now, then read the result:
      wa-watch scan --no-jitter && wa-watch brief

 5) Health check any time:
      wa-watch doctor --online

 Phase 2 (local Qwen 3.5, private summaries):
      bash "$SRC_DIR/macos/setup-qwen.sh"
────────────────────────────────────────────────────────────────────
EOF
