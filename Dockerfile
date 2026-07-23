# --- Stage 1: Build frontend ---
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Stage 2: Final image ---
FROM alpine:latest

ARG PB_VERSION=0.25.8

# Install deps
RUN apk add --no-cache \
    unzip \
    ca-certificates \
    nodejs \
    nginx \
    wget

# Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip && chmod +x /pb/pocketbase

# Copy frontend build to nginx
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Copy migrations + seed
COPY backend/pb_migrations /pb/pb_migrations
COPY backend/seed.js /app/backend/seed.js
COPY backend/seed.sh /app/backend/seed.sh
RUN chmod +x /app/backend/seed.sh

# Startup script
RUN printf '#!/bin/sh\n\
nginx &\n\
cd /pb\n\
./pocketbase serve --http=0.0.0.0:8090 &\n\
sleep 2\n\
/app/backend/seed.sh &\n\
wait\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]
