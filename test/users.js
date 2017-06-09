const Code = require('code')
const Lab = require('lab')
const LabbableServer = require('../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const after = lab.after
const it = lab.it
const expect = Code.expect

describe('users endpoint', () => {
  let server
  let user

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      user = new server.app.db.User({
        username: 'user1',
        email: 'user1@example.com'
      })

      user.setPassword('password')
      user.save()

      return done()
    })
  })

  describe('login', () => {
    it('return status 200 with valid credentials', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': 'user1@example.com',
            'password': 'password'
          }
        }
      }, (res) => {
        var payload = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(200)
        expect(payload).to.be.an.object()
        expect(payload.user.token).to.not.be.empty()
        expect(payload.user.username).to.be.equal('user1')
        expect(payload.user.email).to.be.equal('user1@example.com')
        done()
      })
    })

    it('return status 401 with invalid password', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          'user': {
            'email': 'user1@example.com',
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
        expect(res.statusCode).to.be.equal(422)
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
      server.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          user: {
            email: 'user2@example.com',
            username: 'user2',
            password: 'password'
          }
        }
      }, (res) => {
        var userResponse = JSON.parse(res.payload)
        expect(res.statusCode).to.be.equal(200)
        expect(userResponse.user.username).to.be.equal('user2')
        expect(userResponse.user.email).to.be.equal('user2@example.com')
        expect(userResponse.user.token).to.not.be.empty()
        done()
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

  after((done) => {
    user.remove()
    return done()
  })
})
