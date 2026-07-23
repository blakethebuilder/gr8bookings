FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Final image ---
FROM ghcr.io/pocketbase/pocketbase:0.25.8

# Copy frontend build to PocketBase public dir
COPY --from=frontend-build /app/frontend/dist /pb/public

# Copy migrations + seed script
COPY backend/pb_migrations /pb/pb_migrations
COPY backend/seed.js /app/backend/seed.js
COPY backend/seed.sh /app/backend/seed.sh
RUN chmod +x /app/backend/seed.sh

# Install node + wget for seed script
RUN apk add --no-cache nodejs wget

# Startup script: seed + PocketBase + webhook
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /pb' >> /app/start.sh && \
    echo './pocketbase serve --http=0.0.0.0:8090 --publicDir=/pb/public &' >> /app/start.sh && \
    echo '/app/backend/seed.sh &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 8090

CMD ["/app/start.sh"]
