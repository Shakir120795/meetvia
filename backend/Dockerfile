FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images uploads/videos

# Expose port
EXPOSE 5000

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]