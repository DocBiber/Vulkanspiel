# Container fuer das Bewertungs-Backend, gebaut fuer Cloud Run.
#
# Cloud Run erwartet einen Prozess, der auf Port 8080 hoert und auf
# 0.0.0.0 gebunden ist. Der Schluessel kommt zur Laufzeit als
# Umgebungsvariable oder Secret — nicht in dieses Bild.
#
# Der Build-Kontext ist die Projekt-Wurzel, weil `gcloud run deploy --source .`
# von dort arbeitet. Deshalb liegt package.json unter backend/ und muss
# mit angepassten Pfaden kopiert werden.
#
# Der Server liest den Spielinhalt aus assets/inhalte.js. Er rechnet den
# Pfad relativ zu seiner eigenen Stelle: WURZEL = /app. Die Datei muss also
# als /app/assets/inhalte.js liegen.

FROM node:22-alpine

# Als nicht-root laufen: Cloud Run erzwingt das ohnehin, aber das Bild
# soll es auch vorher schon sein.
RUN addgroup -S bewertung && adduser -S bewertung -G bewertung

WORKDIR /app

# Zuerst nur die Paketdateien kopieren, damit der Cache greift, wenn sich
# nur der Code aendert.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Der Code und der Spielinhalt.
COPY backend ./backend
COPY assets ./assets

USER bewertung

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run setzt PORT. Der Server hoert auf 0.0.0.0.
CMD ["node", "backend/src/server.js"]
