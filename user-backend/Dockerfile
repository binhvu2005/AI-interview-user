# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
# If you have other assets or public folders, copy them here
# COPY --from=build /app/public ./public

EXPOSE 5000
CMD ["npm", "start"]
