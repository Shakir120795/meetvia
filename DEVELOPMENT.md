# Meetvia Development Setup

This document describes how to set up the Meetvia development environment.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (18+ recommended)
- [Git](https://git-scm.com/)

## Quick Setup

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup-dev.bat
```

**Mac/Linux:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### Option 2: Manual Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd meetvia
   ```

2. **Create environment files:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
   NODE_ENV=development
   ```

3. **Install dependencies:**
   ```bash
   # Backend
   cd backend && npm install && cd ..
   
   # Frontend  
   cd frontend && npm install && cd ..
   ```

4. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database setup:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed
   cd ..
   ```

6. **Start development servers:**
   ```bash
   # Start all services
   docker-compose up
   
   # OR start individually
   # Backend: cd backend && npm run dev
   # Frontend: cd frontend && npm run dev
   ```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5000 | Next.js application |
| Backend API | http://localhost:5001 | Express.js API |
| PostgreSQL | localhost:5433 | Database (user: postgres, db: meetvia) |
| Redis | localhost:6380 | Cache/Sessions |

## Project Structure

```
meetvia/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── config/    # Database, Redis, environment config
│   │   ├── controllers/ # API endpoint handlers
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── models/     # Prisma model exports
│   │   ├── routes/     # API route definitions
│   │   └── utils/      # Helper functions
│   ├── prisma/        # Database schema and migrations
│   └── uploads/       # File storage directory
├── frontend/          # Next.js application
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/ # React components
│       ├── lib/       # Utilities and API client
│       └── types/     # TypeScript definitions
└── docker-compose.yml # Infrastructure services
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/meetvia
REDIS_URL=redis://localhost:6380
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h
PORT=5000
NODE_ENV=development
MAX_IMAGE_SIZE=10
MAX_VIDEO_SIZE=100
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NODE_ENV=development
```

## Database Management

### Prisma Commands
```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Push schema changes without migration (development)
npx prisma db push

# Open Prisma Studio (database browser)
npx prisma studio

# Seed database with default data
npm run seed

# Reset database (careful!)
npx prisma migrate reset
```

### Database Access
- **Prisma Studio**: `cd backend && npx prisma studio`
- **Direct psql**: `docker exec -it meetvia-postgres-1 psql -U postgres -d meetvia`

## Development Workflow

1. **Start services:**
   ```bash
   docker-compose up
   ```

2. **Make changes to code** (hot reload is enabled)

3. **Database schema changes:**
   ```bash
   # Edit backend/prisma/schema.prisma
   cd backend
   npx prisma migrate dev --name describe_your_change
   npx prisma generate
   ```

4. **Run tests:**
   ```bash
   cd backend && npm test
   ```

5. **View logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

## Troubleshooting

### Port Conflicts
If you get port conflicts, update the port mappings in `docker-compose.yml`

### Database Connection Issues
1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check connection string in `.env`
3. Try restarting: `docker-compose restart postgres`

### Redis Connection Issues
1. Check if Redis is running: `docker-compose ps`
2. Try restarting: `docker-compose restart redis`

### Permission Issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

### Clean Restart
```bash
docker-compose down
docker volume rm meetvia_postgres_data meetvia_redis_data
docker-compose up --build
```

## Default Admin Account

After seeding, you can log in with:
- **Email:** admin@meetvia.com  
- **Password:** ChangeMe123!

⚠️ **Change this password immediately in production!**

## Architecture Notes

This project is in **Phase 0** of migration from v1 (MongoDB) to v2 (PostgreSQL + Redis).

- Backend: Already migrated to Prisma/PostgreSQL
- All existing CMS features are functional
- New v2 features (booking system, companion profiles, etc.) will be added in subsequent phases
- Docker setup enables consistent development environment