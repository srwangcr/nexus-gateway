# --- Etapa de Build ---
FROM node:18 AS builder

WORKDIR /usr/src/app

# Instalar dependencias
COPY package.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar el proyecto TypeScript
RUN npm run build

# --- Etapa de Producción ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar solo las dependencias de producción
COPY package.json ./
RUN npm install --omit=dev

# Copiar los archivos compilados desde la etapa de build
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto del gateway
EXPOSE 3000

# Variables de entorno (pueden ser sobreescritas en docker-compose)
ENV NODE_ENV=production
ENV GATEWAY_PORT=3000
ENV REDIS_HOST=redis

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]