all :
	@docker-compose -f docker-compose.yml up --build

up :
	docker-compose up

clean :
	docker system prune -af