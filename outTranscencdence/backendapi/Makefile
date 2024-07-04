

all:
	python3 manage.py makemigrations
	python3 manage.py migrate


build:
	docker-compose up --build

http:
	python3 manage.py runserver

clear:
	python3 manage.py flush

https:
	daphne baseProject.asgi:application --bind 0.0.0.0 --port 8000

create:
	python3 manage.py createsuperuser