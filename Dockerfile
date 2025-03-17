# Base Node Stage for Both Dev and Build
FROM node:18 AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Development Stage
FROM base AS development
CMD ["npm", "run", "dev"]

# Production Build Stage
FROM base AS build
ARG NODE_ENV=production
RUN npm run build

# Production Serve Stage with Nginx
FROM nginx:alpine AS production

# Copy the build output to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5173
EXPOSE 5173

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
