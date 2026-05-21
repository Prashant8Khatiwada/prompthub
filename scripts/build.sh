#!/bin/bash

# Creatopedia Docker Build and Push Script
# This script loads local environment variables and builds the Docker image.

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

# Take Docker username as an environment variable or default to "local"
DOCKER_USERNAME=${DOCKER_USERNAME:-"blueneontech"}

IMAGE_NAME="prompthub"
if [ "$DOCKER_USERNAME" != "local" ]; then
  IMAGE_TAG="$DOCKER_USERNAME/$IMAGE_NAME:latest"
else
  IMAGE_TAG="$IMAGE_NAME:latest"
fi

echo "--- Starting Docker build for $IMAGE_TAG (Platform: linux/amd64) ---"

# Disable Next.js cache for fresh builds
export NEXT_DISABLE_CACHE=1

# Disable Next.js cache for fresh builds
export NEXT_DISABLE_CACHE=1

# Use the loaded values or fall back to the current environment defaults.
# For NEXT_PUBLIC_BASE_DOMAIN, keep only the host part for the layout.tsx logic.
BASE_DOMAIN=${NEXT_PUBLIC_BASE_DOMAIN:-"localhost:3000"}
BASE_DOMAIN=${BASE_DOMAIN#https://}
BASE_DOMAIN=${BASE_DOMAIN#http://}
BASE_DOMAIN=${BASE_DOMAIN%/}

docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-"https://dtnsrezhudhqpwvqbcfa.supabase.co"}" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-"sb_publishable_ZH9EP_9TrqC7zLXy-dGVjg_vSfGbAPL"}" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bnNyZXpodWRocXB3dnFiY2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI1NzM1OSwiZXhwIjoyMDk0ODMzMzU5fQ.5_dBk4YZ1wG3HI9B3SXjEq9-ujUW3Q_6Jy3VlNDWvoA"}" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY:-""}" \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST:-"https://app.posthog.com"}" \
  --build-arg INSTAGRAM_ACCESS_TOKEN="${INSTAGRAM_ACCESS_TOKEN:-"IGAAaNcwNKpMBBZAFpOOEd2Yk1PeVVpdzdXQWNnRnpyWHNTMlhBN1AzU3dEZAmZArS09SMDlNTTl1OTk2TXVpTXFHeWJqT1dadVo2cE9GOVJSdGNOUEdUMGgwNGV5TE9nUDFzOFhjS21ZALVlORGlIUmp3RGo5bEZArX2U1b29Ta3RBNAZDZD"}" \
  --build-arg NEXT_PUBLIC_BASE_DOMAIN="$BASE_DOMAIN" \
  --build-arg CRON_SECRET="${CRON_SECRET:-"24f525879220359b23fe8b312a9a9fcf24ab0abc222342a2f93318c18ba2de68"}" \
  --build-arg INSTAGRAM_APP_ID="${INSTAGRAM_APP_ID:-"1949346015949599"}" \
  --build-arg INSTAGRAM_APP_SECRET="${INSTAGRAM_APP_SECRET:-"3b9da31ebec993c75529931d56a965d6"}" \
  --build-arg INSTAGRAM_CLIENT_ID="${INSTAGRAM_CLIENT_ID:-"1844374976242880"}" \
  --build-arg INSTAGRAM_CLIENT_SECRET="${INSTAGRAM_CLIENT_SECRET:-"e3dc546a1370a20d2a3010fd02563acd"}" \
  --build-arg INSTAGRAM_REDIRECT_URI="${INSTAGRAM_REDIRECT_URI:-"https://creatopedia.tech/api/auth/instagram/callback"}" \
  --build-arg TOKEN_ENCRYPTION_KEY="${TOKEN_ENCRYPTION_KEY:-"4d47a1eee73a4fc05718375fe118daa30d6d3cfd9615a6b300a1196d1674f129"}" \
  --build-arg NEXT_DISABLE_CACHE=1 \
  -t "$IMAGE_TAG" .

if [ $? -eq 0 ]; then
  echo "Build successful!"
  
  if [ "$DOCKER_USERNAME" != "local" ]; then
    echo "--- Pushing image to Docker Hub ---"
    docker push "$IMAGE_TAG"
    if [ $? -eq 0 ]; then
      echo "✅ Push successful!"
    else
      echo "❌ Push failed!"
      exit 1
    fi
  fi
  
  echo "You can run the container with:"
  echo "docker run -p 3000:3000 $IMAGE_TAG"
else
  echo "❌ Build failed. Please check the logs above."
  exit 1
fi
