FROM nginx:1.25

EXPOSE 80

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

RUN mkdir -p /cache/nginx 