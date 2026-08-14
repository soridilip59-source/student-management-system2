# Multi-stage build for Student Management System

# Build stage for frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend runtime image
FROM node:18-alpine AS backend
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy built backend
COPY backend/ ./backend/

# Copy built frontend to backend public directory
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Expose port
EXPOSE 5000

# Start backend server
WORKDIR /app/backend
CMD ["npm", "start"]

FROM nginx:alpine AS nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
