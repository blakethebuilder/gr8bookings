#!/bin/sh

# Wait for PocketBase to be ready
echo "⏳ Waiting for PocketBase..."
until wget -q -O /dev/null http://localhost:8090/api/health 2>/dev/null; do
  sleep 1
done
echo "✅ PocketBase is ready"

# Run seed if this is a fresh install (no rooms exist)
ROOMS_COUNT=$(wget -q -O - "http://localhost:8090/api/collections/rooms/records?perPage=1" 2>/dev/null | grep -o '"totalItems":[0-9]*' | cut -d: -f2)

if [ "$ROOMS_COUNT" = "0" ] || [ -z "$ROOMS_COUNT" ]; then
  echo "🌱 Fresh install detected — running seed..."
  cd /app/backend && node seed.js http://localhost:8090
else
  echo "✓ Database already seeded (${ROOMS_COUNT} rooms)"
fi
