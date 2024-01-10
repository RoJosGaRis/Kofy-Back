#!/bin/bash

# cd into projects folder
cd ~/Kofy/Kofy-Back

# git stach
git stash

# git fetch
git pull

sudo chmod 700 redeploy-site.sh

# Spin docker containers down to prevent errors
docker compose -f docker-compose.yml down --remove-orphans

# Compose docker containers back up
docker compose -f docker-compose.yml up -d --build

echo "Website Re-deployed!"
