# Stage 1: Base dependencies
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Stage 2: Development
FROM base AS dev
WORKDIR /usr/src/app

# Copy the source code for live development
COPY . .

# Expose the API port
EXPOSE 3000

# Command for development mode with hot-reloading
CMD ["npm", "run", "start:dev"]

# Stage 3: Production Build
FROM base AS build
WORKDIR /usr/src/app

# Copy the entire app for building
COPY . .

# Build the NestJS app for production
RUN npm run build

# Stage 4: Production
FROM node:18-alpine AS prod
WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm install --frozen-lockfile --production

# Expose the API port
EXPOSE 3000

# Command for running the app in production
CMD ["npm", "run", "start:prod"]