# Base image
FROM debian:oldstable-slim

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary packages
RUN apt-get update && \
    apt-get install -y nginx openssl nodejs npm && \
    apt-get clean

# Create nginx user and group
RUN adduser --system --no-create-home --disabled-login --group nginx

# Create a self-signed SSL certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"

# Copy nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Change ownership of the web directory
RUN chown -R nginx:nginx /var/www/html

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
