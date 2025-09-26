# Frontend treats-inventory-manager Dockerfile
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/treats-inventory-manager/package.json frontend/treats-inventory-manager/bun.lockb ./

# Install dependencies
RUN npm install

# Copy app files
COPY frontend/treats-inventory-manager/ ./

# Build the app
RUN npm run build

# Production environment
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
