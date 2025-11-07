# Use an official Node image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of the project
COPY . .

# Build production files
RUN npm run build

# --- Serve build with a lightweight web server ---
FROM nginx:alpine AS runner

# Copy build output to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
