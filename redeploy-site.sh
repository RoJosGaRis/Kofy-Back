#!/bin/bash

# cd into projects folder
cd /root/Kofy/Kofy-Back

# git fetch
git pull

# Spin docker containers down to prevent errors
docker compose -f docker-compose.yml down

# Compose docker containers back up
docker compose -f docker-compose.yml up -d --build

echo "Website Re-deployed!"
