## Title

# Telepath-api

## Description

This is the RESTful api for my workplace productivity project in nodejs 10.

TDD all the way with test cases for eventuality I can think of.

This is a nodejs project using express. Full test cases written with mocha and chai. Uses a MongoDB database for backend.

This is part of my telepath project. A react frontend for this app is available at my telepath repository.

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