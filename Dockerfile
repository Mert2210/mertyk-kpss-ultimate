# --- 1. Aşama: İstemciyi (React) İnşa Et ---
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- 2. Aşama: Sunucuyu (Node.js) Hazırla ve Çalıştır ---
FROM node:20-alpine
WORKDIR /app
# Sunucu kodlarını kopyala
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production
COPY server/ ./
# React derlemesini sunucuya aktar (Express statik olarak sunacak)
COPY --from=build-client /app/client/dist /app/client/dist

# Google Cloud Run için port ayarı
ENV PORT=8080
EXPOSE 8080

# Sunucuyu başlat
CMD ["node", "server.js"]
