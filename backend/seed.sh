#!/bin/sh

# Wait for PocketBase to be ready
echo "⏳ Waiting for PocketBase..."
for i in $(seq 1 30); do
  if wget -q -O /dev/null http://localhost:8090/api/health 2>/dev/null; then
    echo "✅ PocketBase is ready"
    break
  fi
  sleep 1
done

# Auto-generate slots if fewer than 14 days ahead exist
echo "🔄 Checking slot availability..."
cd /app/backend && node auto-slots.js http://localhost:8090

# Start daily cron job for slot auto-generation
echo "⏰ Starting daily slot cron (every 24h)..."
while true; do
  sleep 86400
  echo "🔄 Daily slot check..."
  cd /app/backend && node auto-slots.js http://localhost:8090 2>/dev/null
done &
