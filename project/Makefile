DEF_COLOR = \033[0;39m
GRAY = \033[0;90m
RED = \033[0;91m
GREEN = \033[0;92m
YELLOW = \033[0;93m
BLUE = \033[0;94m
MAGENTA = \033[0;95m
CYAN = \033[0;96m
WHITE = \033[0;97m
RESET = [0m
BOLD = [1m

all :
	@mkdir -p ./data/Postgres
	@mkdir -p ./data/Nginx
	@docker-compose -f ./docker-compose.yml up --build

start :
	@docker-compose -f ./docker-compose.yml start

stop :
	@docker-compose -f ./docker-compose.yml stop

clean :
	@docker-compose -f ./docker-compose.yml down --volumes

fclean : clean
	@rm -rf ./data

re : fclean all

.PHONY : all start stop clean fclean re
