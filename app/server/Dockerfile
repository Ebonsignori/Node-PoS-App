FROM node:10.9.0-alpine

# Set working directory
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

# Install packages
COPY ./package.json /usr/src/server
RUN npm install --$install_args

COPY . /usr/src/server

COPY --chown=node:node . /usr/src/server


RUN pwd
RUN ls /usr/src/server

# Create a new user to run the container for security
#RUN groupadd -r node && useradd -m -r -g -s /bin/bash/nodejs node

USER node