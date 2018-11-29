FROM node:10.9.0-alpine

# Set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src

# Install packages
COPY ./package.json /usr/src
RUN npm install --quiet

COPY . /usr/src