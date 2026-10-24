# Container fuer das Bewertungs-Backend, gebaut fuer Cloud Run.
#
# Cloud Run erwartet einen Prozess, der auf Port 8080 hoert und auf
# 0.0.0.0 gebunden ist. Der Schluessel kommt zur Laufzeit als
# Umgebungsvariable — nicht in dieses Bild.

FROM node:22-alpine

# Als nicht-root laufen: Cloud Run erzwingt das ohnehin, aber das Bild
# soll es auch vorher schon sein.
RUN addgroup -S bewertung && adduser -S bewertung -G bewertung

WORKDIR /app

# Zuerst nur die Paketdateien kopieren, damit der Cache greift, wenn sich
# nur der Code aendert.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY backend ./backend

USER bewertung

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run setzt PORT. Der Server hoert auf 0.0.0.0.
CMD ["node", "backend/src/server.js"]
