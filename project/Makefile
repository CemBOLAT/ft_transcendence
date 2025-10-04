all: db daphne

db: 
	python manage.py makemigrations
	python manage.py migrate

runserver: db
	python manage.py runserver

daphne:
	daphne -b 0.0.0.0 -p 8000 transendenceapi.asgi:application

# New target to generate SSL certificates