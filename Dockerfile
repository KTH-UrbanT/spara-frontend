# Stage 1: Build the Vite React app
FROM node:18 AS builder

WORKDIR /app

# Inject build-time environment variable for Socket.IO
ARG VITE_SOCKET_SERVER_URL
ENV VITE_SOCKET_SERVER_URL=$VITE_SOCKET_SERVER_URL

# Install and build
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built frontend to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (for client-side routing fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]