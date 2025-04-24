# ---------- Stage 1: Build the Vite app ----------
    FROM node:18-slim AS builder

    # Use IPv4 for better compatibility with npm registry
    ENV NODE_OPTIONS="--dns-result-order=ipv4first"
    
    # Ensure compatible and stable version of npm
    RUN npm install -g npm@11.3.0
    
    WORKDIR /app
    
    # Inject Vite environment variables
    ARG VITE_MS_URL
    ENV VITE_MS_URL=$VITE_MS_URL

    ARG VITE_MS_SOCKETIO_URL
    ENV VITE_MS_SOCKETIO_URL=$VITE_MS_SOCKETIO_URL
    
    # Copy and install dependencies
    COPY package.json package-lock.json ./
    RUN npm install --no-audit
    
    # Copy source and build the app
    COPY . .
    RUN npm run build
    
    # ---------- Stage 2: Serve with Nginx ----------
    FROM nginx:alpine
    
    # Use custom Nginx config (React routing + WebSocket support)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy built frontend
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]