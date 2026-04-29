#!/bin/bash

# PromptHub Docker Build and Push Script
# This script uses the production keys provided to build and push the Docker image.

# Take Docker username as an environment variable or default to "local"
# Usage: DOCKER_USERNAME=myusername ./scripts/build.sh
DOCKER_USERNAME=${DOCKER_USERNAME:-"local"}

IMAGE_NAME="prompthub"
if [ "$DOCKER_USERNAME" != "local" ]; then
  IMAGE_TAG="$DOCKER_USERNAME/$IMAGE_NAME:latest"
else
  IMAGE_TAG="$IMAGE_NAME:latest"
fi

echo "--- Starting Docker build for $IMAGE_TAG ---"

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://slbywxgigzuodyrmhdsg.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_-mTGIQxaESrC94yQHTmgaA_0czKQo30" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYnl3eGdpZ3p1b2R5cm1oZHNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA5NzQ3MSwiZXhwIjoyMDkyNjczNDcxfQ.QrgqANXTZMhYCLttHREaLny_cKEMDSxgMbIIvAr8f-s" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="" \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com" \
  --build-arg INSTAGRAM_ACCESS_TOKEN="IGAAaNcwNKpMBBZAFpOOEd2Yk1PeVVpdzdXQWNnRnpyWHNTMlhBN1AzU3dEZAmZArS09SMDlNTTl1OTk2TXVpTXFHeWJqT1dadVo2cE9GOVJSdGNOUEdUMGgwNGV5TE9nUDFzOFhjS21ZALVlORGlIUmp3RGo5bEZArX2U1b29Ta3RBNAZDZD" \
  --build-arg NEXT_PUBLIC_BASE_DOMAIN="localhost:3000" \
  --build-arg CRON_SECRET="24f525879220359b23fe8b312a9a9fcf24ab0abc222342a2f93318c18ba2de68" \
  --build-arg INSTAGRAM_APP_ID="17841423213743046" \
  --build-arg INSTAGRAM_APP_SECRET="e3dc546a1370a20d2a3010fd02563acd" \
  --build-arg INSTAGRAM_REDIRECT_URI="https://zip.fotosfolio.com/api/auth/instagram/callback" \
  --build-arg TOKEN_ENCRYPTION_KEY="4d47a1eee73a4fc05718375fe118daa30d6d3cfd9615a6b300a1196d1674f129" \
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
