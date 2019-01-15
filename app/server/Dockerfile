FROM node:10.9.0-alpine

# Set working directory
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

# Install packages
COPY ./package.json /usr/src/server
ARG install_args
RUN npm install --$install_args
#RUN npm install -g mocha

COPY . /usr/src/server

COPY --chown=node:node . /usr/src/server

# Add bash for wait-for-it script written in bash
RUN apk add --no-cache bash

# Create a new user to run the container for security
#RUN groupadd -r node && useradd -m -r -g -s /bin/bash/nodejs node

USER node