#!/bin/sh

python3 manage.py collectstatic --noinput
python3 manage.py makemigrations
python3 manage.py migrate
daphne project.asgi:application --bind 0.0.0.0 --port 8080
