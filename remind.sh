#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Life OS — Lern-Erinnerung für RPi5 (Desktop-Benachrichtigung + Terminal)
#
# EINRICHTUNG (einmalig ausführen):
#   chmod +x /home/mimi/my-app/remind.sh
#   crontab -e
#   Dann diese Zeilen hinzufügen (9:00, 14:00, 19:00 Uhr täglich):
#     0 9  * * * /home/mimi/my-app/remind.sh
#     0 14 * * * /home/mimi/my-app/remind.sh
#     0 19 * * * /home/mimi/my-app/remind.sh
# ─────────────────────────────────────────────────────────────────────────────

# Smart reminder vom Life OS API holen
RESPONSE=$(curl -sf http://localhost:3000/api/reminders 2>/dev/null)

if [ -z "$RESPONSE" ]; then
  TITLE="📚 Life OS — Lernzeit!"
  MSG="Öffne http://localhost:3000 für deinen Lernplan."
else
  TITLE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title','Life OS'))" 2>/dev/null || echo "📚 Life OS")
  MSG=$(echo "$RESPONSE"   | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','Zeit zum Lernen!'))" 2>/dev/null || echo "Zeit zum Lernen!")
fi

# ── Desktop-Benachrichtigung (Wayland / X11) ──────────────────────────────────
# Versuche notify-send (funktioniert mit GNOME, LXDE, dunst etc.)
export DISPLAY=:0
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

if command -v notify-send &>/dev/null; then
  notify-send "$TITLE" "$MSG" \
    --icon=dialog-information \
    --urgency=normal \
    --expire-time=10000
fi

# ── Fallback: Terminal-Bell + Log ─────────────────────────────────────────────
printf '\a'  # Terminal-Bell

LOG_FILE="$HOME/my-app/remind.log"
echo "[$(date '+%Y-%m-%d %H:%M')] $TITLE — $MSG" >> "$LOG_FILE"

# Letzte 20 Einträge im Log behalten
tail -20 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
