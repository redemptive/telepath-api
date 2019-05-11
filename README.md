## Title

# Telepath-api

## Description

This is the api for my workplace productivity project in nodejs 10.

TDD all the way with test cases for eventuality I can think of.

This is a nodejs project using express. Full test cases written with mocha and chai.

## Installation and Usage

You should:
- Clone the repository: `git clone https://github.com/redemptive/telepath-api.git`
- `cd telepath-api`

Please note that currently you can only run tests when you are running the server locally.

### Run With Docker Compose (best option!)
- run `docker-compose up`. That's it!

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