#!/bin/bash

# Deploy script for LearnSphere

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check if Docker is installed
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker and Docker Compose are required but not installed."
    exit 1
fi

# Create necessary directories
mkdir -p server/logs
mkdir -p nginx

# Pull latest changes if in a git repository
if [ -d .git ]; then
    echo "Pulling latest changes..."
    git pull
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "LearnSphere has been successfully deployed!"
    echo "Frontend available at: http://localhost:${CLIENT_PORT:-80}"
    echo "Backend API available at: http://localhost:${SERVER_PORT:-5000}"
else
    echo "Error: Deployment failed. Please check docker-compose logs for details."
    docker-compose logs
    exit 1
fi
