# Webapp

Demo web application that makes use of the webservice.

Note that this is a very good example of how not to write an interactive web
application. This is just cobbled together to prove that the concept works. By
no means should any part of this be reused if this were ever to be implemented
as a production service.

## Usage

The root of this repository contains a [Docker
Compose](https://docs.docker.com/compose/) configuration to run both the
webservice/API and the web application. The only dependencies are Docker and
Docker Compose.

Run the following to compile JS:
```sh
npm install
babel src -d js
```

Run `docker-compose up` from the root of the repository to start the demo. The
web applications will then be available from `http://localhost:8080`.
