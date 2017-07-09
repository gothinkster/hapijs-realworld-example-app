# ![Node/Hapi.JS/Mongoose Example App](.github/project-logo.png)

[![Build Status](https://img.shields.io/travis/guillaumemaka/realworld-starter-kit-hapijs.svg?branch=master&style=flat-square)](https://travis-ci.org/guillaumemaka/realworld-starter-kit-hapijs)
[![Code Climate](https://img.shields.io/codeclimate/github/guillaumemaka/realworld-starter-kit-hapijs.svg?style=flat-square)](https://codeclimate.com/github/guillaumemaka/realworld-starter-kit-hapijs)
[![Code Climate Coverage](https://img.shields.io/codeclimate/coverage/github/guillaumemaka/realworld-starter-kit-hapijs.svg?style=flat-square)](https://codeclimate.com/github/guillaumemaka/realworld-starter-kit-hapijs/coverage)
[![Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com/)
[![Hapi.JS](https://img.shields.io/npm/v/hapi.svg?label=hapi&style=flat-square)](https://hapijs.com)
[![Mongoose](https://img.shields.io/npm/v/mongoose.svg?label=mongoose&style=flat-square)](http://mongoosejs.com/)

> ### Example Hapi.JS (Hapi.JS + Mongoose) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) API spec.

# Getting started

## Install Node

Install [Node.JS LTS version](https://nodejs.org/en/download/) 

## To get the Node server running locally

- Clone this repo
- `cd /path/where/your/cloned/the/repo`
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod -d /path/where/you/want/to/store/the/data`
- Run `./generate_secret_key --encoding base64`
- `npm start` to start the local server
- The API is available at `http://localhost:8080/api`

## To get the Node server running locally with Docker

- Install [Docker](https://docs.docker.com/engine/installation/)
- Clone this repo
- `cd /path/where/your/cloned/the/repo`
- Run `./generate_secret_key --encoding base64`
- `docker-compose up`
- The API is available at `http://localhost:8080/api`

# Code Overview

## Dependencies

- [hapijs](https://github.com/hapijs/hapi) - The server for handling and routing HTTP requests
- [hapi-auth-jwt2](https://github.com/dwyl/hapi-auth-jwt2) - Plugin for validating JWTs for authentication
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript 
- [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator) - For handling unique validation errors in Mongoose. Mongoose only handles validation at the document level, so a unique index across a collection will throw an exception at the driver level. The `mongoose-unique-validator` plugin helps us by formatting the error like a normal mongoose `ValidationError`.
- [slug](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format

## Application Structure

- `lib/index.js` - The entry point to our application. This file bootstrap our HapiJS server. It also requires the routes and models we'll be using in the application.
- `lib/config/` - This folder contains plugins configuration as well as a central location for configuration/environment variables.
- `lib/modules/api/*` - This folder contains the routes definitions for our API.

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We use one hapijs pluggin in `lib/modules/auth/index.js` that can be used to authenticate requests. The `hapi-auth-jwt2` plugin using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `request.auth.credentials.user` in the endpoint. 

HapiJS auth mecanism provide 3 [Authentications mode](https://hapijs.com/api#route-options):

- The `{ auth: 'jwt' }` set authentication to required.
- The `{ auth: { mode: 'optional', strategy: 'jwt' } }` config options in the same way as `{ auth: 'jwt' }`, but will *not* return a 401 status code if the request cannot be authenticated (JWT must be valid).
- The `{ auth: 'try', strategy: 'jwt' }` similar to `optional` but invalid JWT will pass with `request.auth.isAuthenticated` set to `false` and `request.auth.credentials` set to `null`.

# Error Handling

 HapiJS use [Boom](https://github.com/hapijs/boom) for errors response that use a particular format response, so we need to reformat it, to meet the Backend API specs errors handling section. So we added a `preResponse` server extension, to reformat it in `lib/modules/api/index.js`. 

# Validations

We use [Joi](https://github.com/hapijs/joi) for validating request params/payload and response payload.

# Documentation

We use [hapi-swagger](https://github.com/glennjones/hapi-swagger) for the API endpoints documentation. Documentation available at `http://localhost:8080/docs`.

# Contributing 

**PRs and issues are welcome!**

- Comment one which issue you'd like to do
- Fork the project then get the project: [Getting the project](#getting-started)
- Now you have your own project URL (from your fork)

```
git remote rename origin upstream
git remote add origin {YOUR_URL}
```

- After your first change make a PR with `[WIP]` (work in progress) added to the title. 
- When your ready for review assign one of us

# Credits

The mongoose models come from the [node-express-realworld-example-app](https://github.com/gothinkster/node-express-realworld-example-app) codebase.
