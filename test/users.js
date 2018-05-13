'use strict'

const Code = require('code')
const Lab = require('lab')
const Server = require('../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const after = lab.after
const it = lab.it
const expect = Code.expect
const JWT = require('jsonwebtoken')
const factory = require('./factories')
const config = require('../lib/config')
const DatabaseCleaner = require('database-cleaner')
const databaseCleaner = new DatabaseCleaner('mongodb')

describe('users endpoint', () => {
  let server
  let user
  let userAuth

  before(async () => {
    server = await Server.deployment()
    user = await factory.create('user')

    userAuth = user.toAuthJSON()
    userAuth.image = user.image || null
    userAuth.bio = user.bio || null
  })

  describe('login', () => {
    it('return status 200 with valid credentials', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': user.email,
            'password': 'password'
          }
        }
      })

      var payload = JSON.parse(res.payload)
      expect(res.statusCode).to.be.equal(200)
      expect(payload).to.be.an.object()
      expect(payload.user).to.not.be.undefined()
      expect(payload.user).to.include(['email', 'username', 'token', 'image', 'bio'])
      expect(payload.user.token).to.not.be.empty()
      expect(payload.user.username).to.be.equal(user.username)
      expect(payload.user.email).to.be.equal(user.email)
    })

    it('return status 401 with invalid password', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': user.email,
            'password': 'invalidpassword'
          }
        }
      })

      expect(res.statusCode).to.be.equal(401)
    })

    it('return status 422 with unknown credentials', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': 'unknownuser@example.com',
            'password': 'p@ssw@rd'
          }
        }
      })

      expect(res.statusCode).to.be.equal(404)
    })

    describe('validations', () => {
      it('empty email field should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': '',
              'password': 'p@ssw@rd'
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
      })

      it('empty password field should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': 'email@example.com',
              'password': ''
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
      })

      it('empty password and email field should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': '',
              'password': ''
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
        expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
      })
    })
  })

  describe('register', async () => {
    it('should register a user with valid information', async () => {
      const u = await factory.build('user', { username: 'stansmith', email: 'stansmith@example.com' })

      const res = await server.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          user: {
            email: u.email,
            username: u.username,
            password: 'password'
          }
        }
      })

      expect(res.statusCode).to.be.equal(200)
      var userResponse = JSON.parse(res.payload)
      expect(userResponse.user).to.include(['email', 'username', 'token', 'image', 'bio'])
      expect(userResponse.user.username).to.be.equal(u.username)
      expect(userResponse.user.email).to.be.equal(u.email)
      expect(userResponse.user.token).to.not.be.empty()
    })

    describe('validations', () => {
      it('on an empty email should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: '',
              username: 'user2',
              password: 'password'
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
      })

      it('on an empty username should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: 'user@exammple.com',
              username: '',
              password: 'password'
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.username[0]).to.contain('"username" is not allowed to be empty')
      })

      it('on an empty password should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: 'user@example.com',
              username: 'user2',
              password: ''
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
      })

      it('on an empty email, username and password should return an error', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: '',
              username: '',
              password: ''
            }
          }
        })

        var errorPayload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(422)
        expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
        expect(errorPayload.errors.username[0]).to.contain('"username" is not allowed to be empty')
        expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
      })
    })
  })

  describe('get current user', () => {
    it('should return the user mapped to the given valid JWT Tokem', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/user',
        headers: {
          'Authorization': userAuth.token
        }
      })

      expect(res.statusCode).to.be.equal(200)

      var userResponse = JSON.parse(res.payload)
      expect(userResponse).to.be.an.object()
      expect(userResponse.user).to.be.an.object()
      expect(userResponse.user).to.include(['email', 'username', 'token', 'image', 'bio'])
    })

    it('should return a 401 Unauthorized status code with no Authorization header', async () => {
      const res = await server.inject('/api/user')

      expect(res.statusCode).to.be.equal(401)
    })

    it('should return a 401 Unauthorized status code with a non existing user', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/user',
        headers: {
          'Authorization': generateJWTToken('unknownuser')
        }
      })

      expect(res.statusCode).to.be.equal(401)
    })
  })

  describe('update', () => {
    let userAttrs = {
      username: 'user1',
      email: 'new.emailaddress@conduit.com',
      password: '',
      bio: 'Sharing is carring',
      image: 'http://example.com/images/avatar.png'
    }

    it('should update when auhtorized', async () => {
      const res = await server.inject({
        method: 'PUT',
        url: '/api/user',
        payload: {
          user: userAttrs
        },
        headers: {
          'Authorization': userAuth.token
        }
      })

      expect(res.statusCode).to.be.equal(200)
      let userResponse = JSON.parse(res.payload)
      expect(userResponse.user).to.part.includes(userAttrs)
    })

    describe('validations', () => {
      it('empty username should return an error', async () => {
        userAttrs.username = ''

        const res = await server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': userAuth.token
          }
        })

        expect(res.statusCode).to.be.equal(422)
        let errorResponse = JSON.parse(res.payload)
        expect(errorResponse.errors).to.includes(['username'])
      })

      it('empty email should return an error', async () => {
        userAttrs.username = user.username
        userAttrs.email = ''

        const res = await server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': userAuth.token
          }
        })

        expect(res.statusCode).to.be.equal(422)
        let errorResponse = JSON.parse(res.payload)
        expect(errorResponse.errors).to.includes(['email'])
      })

      it('empty email and username should return an error', async () => {
        userAttrs.username = ''
        userAttrs.email = ''

        const res = await server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': userAuth.token
          }
        })

        expect(res.statusCode).to.be.equal(422)
        let errorResponse = JSON.parse(res.payload)
        expect(errorResponse.errors).to.includes(['email', 'username'])
      })
    })
  })

  after(async () => {
    await databaseCleaner.clean(server.app.db.link)
  })
})

function generateJWTToken (username) {
  var today = new Date()
  var exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return JWT.sign({
    id: '4edd40c86762e0fb12000003',
    username: username,
    exp: parseInt(exp.getTime() / 1000)
  }, config.auth.secret, { algorithm: config.auth.algorithm })
}
