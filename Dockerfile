################################################
# Build image
FROM node:20 AS builder
WORKDIR /app
# Una vez estandarizado la carpeta del proyecto: COPY . .
COPY churchApp .
RUN npm --version && node --version
# RUN npm install --legacy-peer-deps
RUN npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build


################################################
# Runtime image
FROM nginx:alpine
#RUN chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx
RUN chmod -R 777 /var/cache/nginx /var/run /var/log/nginx
COPY devops/release/nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
COPY --from=builder /app/www /usr/share/nginx/html
EXPOSE 3000

