FROM node:10.9.0-alpine

# Set working directory
RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

# Install packages
COPY ./package.json /usr/src/client
RUN npm install --$install_args

COPY . /usr/src/client

RUN pwd
RUN ls /usr/src/client

COPY --chown=node:node . /usr/src/client

# Create a new user to run the container for security 
#RUN groupadd -r node && useradd -m -r -g -s /bin/bash/nodejs node

USER node

EXPOSE 8080