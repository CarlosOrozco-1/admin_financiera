# Imagen ligera para servir frontend estatico.
FROM nginx:alpine

# Copia configuracion personalizada de nginx.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia archivos del frontend al directorio publico de nginx.
COPY . /usr/share/nginx/html