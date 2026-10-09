FROM node:20-alpine
WORKDIR /app
# copiar package.json y package-lock.json
COPY app/package*.json ./
# instalar dependencias
RUN npm install
# copia resto de archivos
COPY app/ ./

EXPOSE 3050
CMD ["npm", "start"]

# # build la aplicación para producción
# RUN npm run build

# # servidor de producción
# FROM node:20-alpine
# WORKDIR /app
# # Instalar serve para servir archivos estáticos
# RUN npm install -g serve
# # Copiar los archivos construidos desde la etapa builder
# COPY --from=builder /app/build ./build
# # puerto
# EXPOSE 3050
# # ejectur server
# CMD ["serve", "-s", "build", "-l", "3050"]
