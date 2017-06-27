# ![Node/Hapi.JS/Mongoose Example App](.github/project-logo.png)

[![Build Status](https://img.shields.io/travis/guillaumemaka/realworld-starter-kit-hapijs.svg?branch=master&style=flat-square)](https://travis-ci.org/guillaumemaka/realworld-starter-kit-hapijs)
[![Code Climate](https://img.shields.io/codeclimate/github/guillaumemaka/realworld-starter-kit-hapijs.svg?style=flat-square)](https://codeclimate.com/github/guillaumemaka/realworld-starter-kit-hapijs)
[![Code Climate Coverage](https://img.shields.io/codeclimate/coverage/github/guillaumemaka/realworld-starter-kit-hapijs.svg?style=flat-square)](https://codeclimate.com/github/guillaumemaka/realworld-starter-kit-hapijs/coverage)
[![Code Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com/)
[![Hapi.JS](https://img.shields.io/npm/v/hapi.svg?label=hapi&style=flat-square)](https://hapijs.com)
[![Mongoose](https://img.shields.io/npm/v/mongoose.svg?label=mongoose&style=flat-square)](http://mongoosejs.com/)

> ### Example Hapi.JS (Hapi.JS + Mongoose) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) API spec.


This repo is in Work In Progress — PRs and issues are welcome!

# Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm start` to start the local server

# Code Overview

## Dependencies

- [hapijs](https://github.com/hapijs/hapi) - The server for handling and routing HTTP requests
- [hapi-auth-jwt2](https://github.com/dwyl/hapi-auth-jwt2) - Plugin for validating JWTs for authentication
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript 
- [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator) - For handling unique validation errors in Mongoose. Mongoose only handles validation at the document level, so a unique index across a collection will throw an exception at the driver level. The `mongoose-unique-validator` plugin helps us by formatting the error like a normal mongoose `ValidationError`.
- [slug](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format

## Application Structure

- `lib/index.js` - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes and models we'll be using in the application.
- `lib/config/` - This folder contains configuration for passport as well as a central location for configuration/environment variables.
- `lib/modules/api/*` - This folder contains the routes definitions for our API.

## Error Handling

In `lib/index.js`, we define a error-handling middleware for handling Mongoose's `ValidationError`. This middleware will respond with a 422 status code and format the response to have [error messages the clients can understand](https://github.com/gothinkster/realworld/blob/master/API.md#errors-and-status-codes)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two hapijs pluggin in `lib/modules/auth.js` that can be used to authenticate requests. The `required` plugin configures the `hapi-auth-jwt2` plugin using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `request.auth.credentials` in the endpoint. The `{auth:"optional"}` config optione in the same way as `{auth: true}`, but will *not* return a 401 status code if the request cannot be authenticated.

# Contributing 

- Comment one which issue you'd like to do
- Fork the project then get the project: [Getting the project](#getting-the-project)
- Now you have your own project URL (from your fork)

```
git remote rename origin upstream
git remote add origin {YOUR_URL}
```

- After your first change make a PR with `[WIP]` (work in progress) added to the title. 
- When your ready for review assign one of us

# Credits

The mongoose models come from the [node-express-realworld-example-app](https://github.com/gothinkster/node-express-realworld-example-app) codebase.
