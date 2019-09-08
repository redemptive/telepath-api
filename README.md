## Title

# Telepath-api

All the buzzwords! A test driven, RESTful, mongodb/mongoose backed, continuously integrated express nodejs api.

Documentation is important! Full api documentation below for all usable routes as well as various ways of running this project.

## Description

This is the RESTful api for my workplace productivity project in nodejs 10.

TDD all the way with test cases for eventuality I can think of. BDD technically as we are testing behaviour not implementation. Tests are defined at `/app/api/test/test.js`

This is a nodejs project using express. Full test cases written with mocha and chai. Uses a MongoDB database for backend.

This is part of my telepath project. A react frontend for this app is available at my telepath repository.

Please scroll to the bottom for full API documentation and a deeper dive into how this works.

I've also set up a jenkins server on an old raspberry pi. It polls dev branch for changes, lints with eslint (fixing any mistakes I make!) and pushes to master if all passes.

## Installation and Usage

You should:
- Clone the repository: `git clone https://github.com/redemptive/telepath-api.git`
- `cd telepath-api`

### Run With Docker Compose (best option!)
- Run `docker-compose up`
- You can now make requests to `localhost:80`. That's it!

This will create four containers:
- Nginx proxy listening on localhost port 80 forwarding to private port 3000 on the app container
- Test container running the mocha/chai functional tests
- App container listening on private port 3000
- Mongodb container listening on private port 27017

You will see the output of the test container in your terminal prompt.

### Run Locally

Dependancies:
- Mongodb instance

If you are running mongodb remotely on another host:
- Windows powershell:
  - run `$ENV:DB_HOST = 'mongodb://<remote host>/<db name>'`
- Bash/linux:
  - run `export DB_HOST='mongodb://<remote host>/<db name>'`

- Start mongod with `mongod`
- Test! `npm test`
- Run `nodejs ./app/api/server.js`

## API Documentation

### Configuration

These are the configuration environment variables you can set to change the behaviour:

`DB_HOST`
- Where the mongodb database is. In format `'mongodb://<remote host>/<db name>'`

`DB_RETRIES`
- How many times to try to connect to the above database before giving up and exiting

`NODE_JWT_SECRET`
- The secret to use for jwt token generation. Change in production!

`NODE_PORT`
- The port to listen on for the API server

### Using the API

All parameters should be passed in JSON format in the request body for POST requests.

When you first start the server, you will need to create a user with `/api/register`. The first user will be given admin permissions.

### Authentication:

`/api/register` POST:
- Sign up for the service
- `{"name": <string>, "email": <string>, "password": <string>}`

`/api/authenticate` POST:
- Log in and start a session
- `{"email": <string>, "password": <string>}`

You will be given a JWT token in response to POST `/api/authenticate` in `data.token`. 

For protected routes below you must be logged in. Send that token in an `x-access-token` header for all the below routes to access them.

### Admins:

`/api/admins` POST:
- Make the specified user an admin
- `{"user": <string>}`

### Users:

`/api/users` GET:
- Get all the current registered users

`/api/users/<name>` GET:
- Get a specific user by the name given in the url

`/api/users/<name>/messages` POST:
- Send a message to the user specified in the url
- User messages are private and can only be viewed by that user. Be nice! They will see the recipient.
- `{"content": <string>}`

### Posts:

Posts are public messages and can be viewed by all users.

`/api/posts` GET:
- Get all the current posts

`/api/posts` POST:
- Post a new post
- `{"content": <string>}`

### Teams

Teams can have a name and contain many users.

`/api/teams` GET:
- Get all of the current teams

`/api/teams` POST admin only:
- Add a new team with optional description
- `{"name": <string>, "description": <optional string>}`

`/api/teams/<name>` GET:
- Get a specific team with the name specified in the url

`/api/teams/<name>/users` POST admin only:
- Add a named user to a team specified in the url
- `{"name": <string>}`

### Messages

Messages are private and you will only be able to view the messages of the user you have a session open for.

`/api/messages` GET:
- Get the messages for the current user