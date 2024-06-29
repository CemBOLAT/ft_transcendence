#!/bin/sh

# Collect static files
python3 manage.py collectstatic --noinput

# Make database migrations
python3 manage.py makemigrations

# Apply database migrations
python3 manage.py migrate

# Run Daphne ASGI server
daphne project.asgi:application --bind 0.0.0.0 --port 8080
