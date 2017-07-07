'use strict'

const Code = require('code')
const Lab = require('lab')
const LabbableServer = require('../lib')

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

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return factory.create('user').then((u) => {
        user = u
        userAuth = user.toAuthJSON()
        userAuth.image = user.image || null
        userAuth.bio = user.bio || null

        return done()
      })
    })
  })

  describe('login', () => {
    it('return status 200 with valid credentials', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': user.email,
            'password': 'password'
          }
        }
      }, (res) => {
        var payload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(200)
        expect(payload).to.be.an.object()
        expect(payload.user).to.not.be.undefined()
        expect(payload.user).to.include(['email', 'username', 'token', 'image', 'bio'])
        expect(payload.user.token).to.not.be.empty()
        expect(payload.user.username).to.be.equal(user.username)
        expect(payload.user.email).to.be.equal(user.email)
        done()
      })
    })

    it('return status 401 with invalid password', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': user.email,
            'password': 'invalidpassword'
          }
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(401)
        done()
      })
    })

    it('return status 422 with unknown credentials', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': 'unknownuser@example.com',
            'password': 'p@ssw@rd'
          }
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(404)
        done()
      })
    })

    describe('validations', () => {
      it('empty email field should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': '',
              'password': 'p@ssw@rd'
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
          done()
        })
      })

      it('empty password field should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': 'email@example.com',
              'password': ''
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
          done()
        })
      })

      it('empty password and email field should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users/login',
          payload: {
            'user': {
              'email': '',
              'password': ''
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
          expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
          done()
        })
      })
    })
  })

  describe('register', () => {
    it('should register a user with valid information', (done) => {
      factory.build('user', {username: 'stansmith', email: 'stansmith@example.com'}).then((u) => {
        server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: u.email,
              username: u.username,
              password: 'password'
            }
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var userResponse = JSON.parse(res.payload)
          expect(userResponse.user).to.include(['email', 'username', 'token', 'image', 'bio'])
          expect(userResponse.user.username).to.be.equal(u.username)
          expect(userResponse.user.email).to.be.equal(u.email)
          expect(userResponse.user.token).to.not.be.empty()
          done()
        })
      })
    })

    describe('validations', () => {
      it('on an empty email should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: '',
              username: 'user2',
              password: 'password'
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
          done()
        })
      })

      it('on an empty username should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: 'user@exammple.com',
              username: '',
              password: 'password'
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.username[0]).to.contain('"username" is not allowed to be empty')
          done()
        })
      })

      it('on an empty password should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: 'user@example.com',
              username: 'user2',
              password: ''
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
          done()
        })
      })

      it('on an empty email, username and password should return an error', (done) => {
        server.inject({
          method: 'POST',
          url: '/api/users',
          payload: {
            user: {
              email: '',
              username: '',
              password: ''
            }
          }
        }, (res) => {
          var errorPayload = JSON.parse(res.payload)
          expect(res.statusCode).to.be.equal(422)
          expect(errorPayload.errors.email[0]).to.contain('"email" must be a valid email')
          expect(errorPayload.errors.username[0]).to.contain('"username" is not allowed to be empty')
          expect(errorPayload.errors.password[0]).to.contain('"password" is not allowed to be empty')
          done()
        })
      })
    })
  })

  describe('get current user', () => {
    it('should return the user mapped to the given valid JWT Tokem', (done) => {
      server.inject({
        method: 'GET',
        url: '/api/user',
        headers: {
          'Authorization': 'Token ' + userAuth.token
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(200)

        var userResponse = JSON.parse(res.payload)
        expect(userResponse).to.be.an.object()
        expect(userResponse.user).to.be.an.object()
        expect(userResponse.user).to.include(['email', 'username', 'token', 'image', 'bio'])
        done()
      })
    })

    it('should return a 401 Unauthorized status code with no Authorization header', (done) => {
      server.inject('/api/user', (res) => {
        expect(res.statusCode).to.be.equal(401)
        done()
      })
    })

    it('should return a 401 Unauthorized status code with a non existing user', (done) => {
      server.inject({
        method: 'GET',
        url: '/api/user',
        headers: {
          'Authorization': 'Token ' + generateJWTToken('unknownuser')
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(401)
        done()
      })
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

    it('should update when auhtorized', (done) => {
      server.inject({
        method: 'PUT',
        url: '/api/user',
        payload: {
          user: userAttrs
        },
        headers: {
          'Authorization': 'Token ' + userAuth.token
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(200)
        let userResponse = JSON.parse(res.payload)
        expect(userResponse.user).to.part.includes(userAttrs)
        done()
      })
    })

    describe('validations', () => {
      it('empty username should return an error', (done) => {
        userAttrs.username = ''
        server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': 'Token ' + userAuth.token
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(422)
          let errorResponse = JSON.parse(res.payload)
          expect(errorResponse.errors).to.includes(['username'])
          done()
        })
      })

      it('empty email should return an error', (done) => {
        userAttrs.username = user.username
        userAttrs.email = ''
        server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': 'Token ' + userAuth.token
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(422)
          let errorResponse = JSON.parse(res.payload)
          expect(errorResponse.errors).to.includes(['email'])
          done()
        })
      })

      it('empty email and username should return an error', (done) => {
        userAttrs.username = ''
        userAttrs.email = ''

        server.inject({
          method: 'PUT',
          url: '/api/user',
          payload: {
            user: userAttrs
          },
          headers: {
            'Authorization': 'Token ' + userAuth.token
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(422)
          let errorResponse = JSON.parse(res.payload)
          expect(errorResponse.errors).to.includes(['email', 'username'])
          done()
        })
      })
    })
  })

  after((done) => {
    databaseCleaner.clean(server.app.db.link, () => {
      return done()
    })
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
