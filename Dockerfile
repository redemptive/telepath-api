FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

COPY ./app ./app

EXPOSE 3000

CMD [ "nodejs", "app/api/server.js" ]