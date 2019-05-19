1) Setup Auth0 and get the API keys
2) Edit the Docker Compose file to set the credentials and environment variables
3) Edit the .env.dev and .env.prod files to contain API keys and environment variables
4) Edit services/auth/.env to contain API keys and environment variables
5) Install the hasura command line
6) docker-compose up -d
7) cd services/hasura && hasura migrate apply
8) configure/test SSL 
