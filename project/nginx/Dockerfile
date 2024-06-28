FROM debian:oldstable-slim

EXPOSE 443

RUN apt-get update && apt-get install -y procps && \
	mkdir -p /home/app/static_files && \
	apt install -y nginx openssl nginx-extras

RUN mkdir /etc/nginx/ssl

COPY ./tools/nginx.sh /var/www

RUN chmod +x /var/www/nginx.sh

ENTRYPOINT ["/var/www/nginx.sh"]

CMD ["nginx", "-g", "daemon off;" ]

