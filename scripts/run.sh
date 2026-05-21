#!/bin/bash

# PromptHub Docker Run Script
# This script loads local environment variables, pulls the image, and runs it.

# Load environment variables from .env.local first, then .env as a fallback.
if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

# Take Docker username as an environment variable or default to "blueneontech"
DOCKER_USERNAME=${DOCKER_USERNAME:-"blueneontech"}
IMAGE_NAME="prompthub"
IMAGE_TAG="$DOCKER_USERNAME/$IMAGE_NAME:latest"

echo "--- Pulling latest image: $IMAGE_TAG ---"
docker pull "$IMAGE_TAG"

echo "--- Stopping and removing existing container (if any) ---"
docker stop prompthub 2>/dev/null
docker rm prompthub 2>/dev/null

echo "--- Starting PromptHub container with actual secrets ---"

# Running without exposing ports (-p) as requested, using restart policy and 'fotosfolio-zip' network.
docker run -d \
  --name prompthub \
  --restart always \
  --network web \
  -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-"https://dtnsrezhudhqpwvqbcfa.supabase.co"}" \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-"sb_publishable_ZH9EP_9TrqC7zLXy-dGVjg_vSfGbAPL"}" \
  -e SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bnNyZXpodWRocXB3dnFiY2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI1NzM1OSwiZXhwIjoyMDk0ODMzMzU5fQ.5_dBk4YZ1wG3HI9B3SXjEq9-ujUW3Q_6Jy3VlNDWvoA"}" \
  -e NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY:-""}" \
  -e NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST:-"https://app.posthog.com"}" \
  -e INSTAGRAM_ACCESS_TOKEN="${INSTAGRAM_ACCESS_TOKEN:-"IGAAaNcwNKpMBBZAFpOOEd2Yk1PeVVpdzdXQWNnRnpyWHNTMlhBN1AzU3dEZAmZArS09SMDlNTTl1OTk2TXVpTXFHeWJqT1dadVo2cE9GOVJSdGNOUEdUMGgwNGV5TE9nUDFzOFhjS21ZALVlORGlIUmp3RGo5bEZArX2U1b29Ta3RBNAZDZD"}" \
  -e NEXT_PUBLIC_BASE_DOMAIN="${NEXT_PUBLIC_BASE_DOMAIN:-"localhost:3000"}" \
  -e CRON_SECRET="${CRON_SECRET:-"24f525879220359b23fe8b312a9a9fcf24ab0abc222342a2f93318c18ba2de68"}" \
  -e INSTAGRAM_APP_ID="${INSTAGRAM_APP_ID:-"1949346015949599"}" \
  -e INSTAGRAM_APP_SECRET="${INSTAGRAM_APP_SECRET:-"3b9da31ebec993c75529931d56a965d6"}" \
  -e INSTAGRAM_CLIENT_ID="${INSTAGRAM_CLIENT_ID:-"1844374976242880"}" \
  -e INSTAGRAM_CLIENT_SECRET="${INSTAGRAM_CLIENT_SECRET:-"e3dc546a1370a20d2a3010fd02563acd"}" \
  -e INSTAGRAM_REDIRECT_URI="${INSTAGRAM_REDIRECT_URI:-"https://creatopedia.tech/api/auth/instagram/callback"}" \
  -e TOKEN_ENCRYPTION_KEY="${TOKEN_ENCRYPTION_KEY:-"4d47a1eee73a4fc05718375fe118daa30d6d3cfd9615a6b300a1196d1674f129"}" \
  "$IMAGE_TAG"

# Wait a few seconds and check if container is still running
sleep 3
if [ "$(docker inspect -f '{{.State.Running}}' prompthub 2>/dev/null)" = "true" ]; then
  echo "✅ PromptHub is running successfully!"
  echo "Container ID: $(docker ps -qf name=prompthub)"
else
  echo "❌ Failed to start PromptHub container or it crashed immediately."
  echo "Check logs with: docker logs prompthub"
  exit 1
fi


