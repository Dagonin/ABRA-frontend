# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności
RUN npm ci

# Kopiuj źródło aplikacji
COPY . .

# Buduj aplikację
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instaluj serwer HTTP do obsługi SPA
RUN npm install -g serve

# Kopiuj zbudowaną aplikację z etapu build
COPY --from=builder /app/dist ./dist

# Eksponuj port
EXPOSE 3000

# Uruchom serwer
CMD ["serve", "-s", "dist", "-l", "3000"]
