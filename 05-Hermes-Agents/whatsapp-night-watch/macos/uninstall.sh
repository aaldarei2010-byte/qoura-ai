#!/usr/bin/env bash
# Remove WhatsApp Night Watch from the Mac mini.
#   bash macos/uninstall.sh            → stop schedules, keep data
#   bash macos/uninstall.sh --purge    → also delete the WhatsApp profile and all stored data
set -euo pipefail
APP_HOME="${WA_WATCH_HOME:-$HOME/.qoura/wa-watch}"

if command -v hermes >/dev/null 2>&1; then
  for job in whatsapp-night-scan whatsapp-morning-brief; do hermes cron remove "$job" >/dev/null 2>&1 || true; done
fi
rm -f "$HOME/.hermes/scripts/wa_watch_scan.sh" "$HOME/.hermes/scripts/wa_watch_brief.sh"
rm -rf "$HOME/.hermes/skills/productivity/whatsapp-night-watch"
for label in com.qoura.wa-watch.scan com.qoura.wa-watch.brief; do
  plist="$HOME/Library/LaunchAgents/$label.plist"
  if [[ -f "$plist" ]]; then
    launchctl bootout "gui/$(id -u)" "$plist" 2>/dev/null || true
    rm -f "$plist"
  fi
done
rm -f "$HOME/.local/bin/wa-watch"

if [[ "${1:-}" == "--purge" ]]; then
  rm -rf "$APP_HOME"
  echo "Removed everything, including the linked WhatsApp profile. Also unlink 'Chrome (Mac)' on your phone: WhatsApp → Linked devices."
else
  echo "Schedules removed. Data kept in $APP_HOME (use --purge to delete it)."
fi
