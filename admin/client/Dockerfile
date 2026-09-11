# Stage 1: Build Admin frontend
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve using node runner with preview or static server
FROM node:24-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./vite.config.js

ENV PORT=3001
EXPOSE 3001
CMD ["npm", "run", "preview", "--", "--port", "3001", "--host"]
