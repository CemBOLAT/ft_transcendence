

all:
	python3 manage.py makemigrations
	python3 manage.py migrate
	daphne baseProject.asgi:application --bind 0.0.0.0 --port 8000
