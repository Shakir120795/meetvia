@echo off
echo 🚀 Setting up Meetvia development environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create .env files if they don't exist
echo 📝 Setting up environment variables...

if not exist backend\.env (
    echo Creating backend\.env from .env.example...
    copy backend\.env.example backend\.env
    echo ⚠️  Please update backend\.env with your actual values before running the services.
)

if not exist frontend\.env.local (
    echo Creating frontend\.env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1> frontend\.env.local
    echo NODE_ENV=development>> frontend\.env.local
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend && npm install && cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend && npm install && cd ..

REM Start services
echo 🐳 Starting Docker services...
docker-compose up --build -d postgres redis

REM Wait for database to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
timeout /t 10

REM Run database migrations
echo 🗄️  Running database migrations...
cd backend && npx prisma migrate dev --name init && cd ..

REM Generate Prisma client
echo 🔧 Generating Prisma client...
cd backend && npx prisma generate && cd ..

REM Seed database
echo 🌱 Seeding database with default data...
cd backend && npm run seed && cd ..

echo ✅ Development environment setup complete!
echo.
echo 🎯 Next steps:
echo 1. Update backend\.env with your actual database credentials
echo 2. Run 'docker-compose up' to start all services
echo 3. Frontend will be available at http://localhost:3000
echo 4. Backend API will be available at http://localhost:5000
echo 5. PostgreSQL will be available at localhost:5432
echo 6. Redis will be available at localhost:6379

pause