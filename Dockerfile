FROM nginx:alpine

COPY index.html styles.css app.js /usr/share/nginx/html/

RUN sed -i 's/listen       80;/listen       8744;/' /etc/nginx/conf.d/default.conf

EXPOSE 8744
