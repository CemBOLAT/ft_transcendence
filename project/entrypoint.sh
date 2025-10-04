#!/bin/sh

# Apply database migrations

echo "Veritabanı başlatıldı. Django migrasyonları uygulanıyor."

cd /project

python manage.py makemigrations management
python manage.py makemigrations

python manage.py migrate management --run-syncdb
python manage.py migrate --run-syncdb


# Start server
echo "Starting server"
daphne -b 0.0.0.0 -p 8000 transendenceapi.asgi:application


exec "$@"
