FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV ADMIN_SERVER_PORT=4000

COPY package*.json ./
RUN npm ci --only=production

COPY . .

USER node
EXPOSE 4000
CMD ["node", "server.js"]
