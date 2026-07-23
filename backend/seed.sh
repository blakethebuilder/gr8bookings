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

# Check if already seeded
ROOMS_COUNT=$(wget -q -O - "http://localhost:8090/api/collections/rooms/records?perPage=1" 2>/dev/null | grep -o '"totalItems":[0-9]*' | cut -d: -f2)

if [ "$ROOMS_COUNT" = "0" ] || [ -z "$ROOMS_COUNT" ]; then
  echo "🌱 Fresh install — running seed..."
  cd /app/backend && node seed.js http://localhost:8090
else
  echo "✓ Already seeded (${ROOMS_COUNT} rooms)"
fi
