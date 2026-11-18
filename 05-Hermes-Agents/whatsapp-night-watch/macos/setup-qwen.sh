#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  Phase 2 — local AI on the Mac mini: Qwen 3.5 (Alibaba, open weights) via Ollama
#  The WhatsApp text is summarised ON the Mac mini; it never goes to a cloud model.
#
#      bash 05-Hermes-Agents/whatsapp-night-watch/macos/setup-qwen.sh [model]
#
#  Without [model] the size is picked from the Mac's memory:
#      ≥48 GB → qwen3.5:35b   ≥32 GB → qwen3.5:27b   ≥16 GB → qwen3.5:9b   else qwen3.5:4b
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_HOME="${WA_WATCH_HOME:-$HOME/.qoura/wa-watch}"
WA="$APP_HOME/bin/wa-watch"
[[ "$(uname -s)" == "Darwin" ]] || { echo "macOS only"; exit 1; }
[[ -x "$WA" ]] || { echo "Install wa-watch first (macos/install.sh)"; exit 1; }

MEM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
if [[ -n "${1:-}" ]]; then MODEL="$1"
elif (( MEM_GB >= 48 )); then MODEL="qwen3.5:35b"
elif (( MEM_GB >= 32 )); then MODEL="qwen3.5:27b"
elif (( MEM_GB >= 16 )); then MODEL="qwen3.5:9b"
else MODEL="qwen3.5:4b"; fi
echo "==> Mac memory: ${MEM_GB} GB → model: ${MODEL}"

if ! command -v ollama >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "==> Installing Ollama with Homebrew"
    brew install ollama
  else
    echo "Install the Ollama app from https://ollama.com/download , open it once, then run this script again."
    exit 1
  fi
fi

if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "==> Starting Ollama"
  if command -v brew >/dev/null 2>&1 && brew services start ollama >/dev/null 2>&1; then :; else
    nohup ollama serve >"$APP_HOME/logs/ollama.log" 2>&1 &
  fi
  for _ in $(seq 1 20); do curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break; sleep 1; done
fi

echo "==> Downloading ${MODEL} (one time, several GB)"
ollama pull "$MODEL"

"$WA" config-set llm.model "$MODEL"
"$WA" config-set llm.enabled true
echo "==> Test summary:"
"$WA" llm-check --test

cat <<EOF

✅ Local AI is on. From tonight the brief gets a «🧠 ملخص ذكي» section written on this Mac.
   Turn it off any time:   wa-watch config-set llm.enabled false

Optional — make Hermes itself think locally too (needs ≥32 GB for good tool use):
   OLLAMA_CONTEXT_LENGTH=64000 must be set for the Ollama server, then
   hermes model  → "Custom endpoint" → http://localhost:11434/v1 → ${MODEL}
EOF
