# Learning Platform Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed (for local development)
- Git (optional, for version control)

## Environment Setup

1. Clone the repository (if using Git):
   ```
   git clone <repository-url>
   cd learning-platform
   ```

2. Configure environment variables:
   - Copy the `.env.example` file to `.env` (if not already present)
   - Update the environment variables as needed:
     - `NODE_ENV`: Set to `production` for deployment
     - `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`: MongoDB credentials
     - `JWT_SECRET`: Secret key for JWT authentication
     - `SONAR_API_KEY`: API key for Perplexity Sonar (if using)

## Deployment Options

### Option 1: Using the Deployment Script

1. Make the deployment script executable (if needed):
   ```
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```
   ./deploy.sh
   ```

   This script will:
   - Pull the latest changes (if using Git)
   - Build and start the Docker containers
   - Wait for the services to start
   - Display the status of the containers

### Option 2: Using Docker Compose Directly

1. Build and start the containers:
   ```
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

2. Check the status of the containers:
   ```
   docker-compose ps
   ```

## Accessing the Application

- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 80 or 5000 are already in use, update the port mappings in `docker-compose.yml`.

2. **MongoDB connection issues**: Verify the MongoDB credentials in the `.env` file and ensure the MongoDB container is running.

3. **Container build failures**: Check the Docker build logs for errors:
   ```
   docker-compose logs --follow
   ```

### Restarting Services

To restart all services:
```
docker-compose restart
```

To restart a specific service:
```
docker-compose restart <service-name>
```

## Monitoring

- View container logs:
  ```
  docker-compose logs --follow
  ```

- View logs for a specific service:
  ```
  docker-compose logs --follow <service-name>
  ```

## Updating the Application

1. Pull the latest changes (if using Git):
   ```
   git pull
   ```

2. Rebuild and restart the containers:
   ```
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Backup and Restore

### Backup MongoDB Data

```
docker exec -it learnsphere-mongo mongodump --out /data/backup
docker cp learnsphere-mongo:/data/backup ./backup
```

### Restore MongoDB Data

```
docker cp ./backup learnsphere-mongo:/data/backup
docker exec -it learnsphere-mongo mongorestore /data/backup
```
