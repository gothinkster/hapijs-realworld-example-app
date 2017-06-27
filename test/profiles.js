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
const factory = require('./factories')
const DatabaseCleaner = require('database-cleaner')
const databaseCleaner = new DatabaseCleaner('mongodb')
const join = require('bluebird').join

describe('profiles endpoint', () => {
  let server
  let jakeProfile
  let stanProfile
  let emillyProfile

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      var p1 = factory.create('jake_profile')
      var p2 = factory.create('stan_profile')
      var p3 = factory.create('emilly_profile')

      return join(p1, p2, p3, (jake, stan, emilly) => {
        jake.following = [stan._id, emilly._id]
        jake.save().then(u => { jakeProfile = u })

        stan.following = [jake._id, emilly._id]
        stan.save().then(u => { stanProfile = u })

        emilly.following = [jake._id, stan._id]
        emilly.save().then(u => { emillyProfile = u }).then(done)
        // console.log('\n-----\n', jake, '\n-----\n', stan, '\n-----\n', emilly)
      })
    })
  })

  describe('GET /api/profiles/{username}', () => {
    it('should return the profile for the given username (No Auth)', (done) => {
      factory.attrs('jake_profile').then(attrs => {
        server.inject(`/api/profiles/${jakeProfile.username}`, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.user).to.part.includes(attrs)
          done()
        })
      })
    })

    it('should return the profile for the given username and following flagged to true (with Auth)', (done) => {
      factory.attrs('emilly_profile', {following: true}).then(attrs => {
        server.inject({
          method: 'GET',
          url: `/api/profiles/${emillyProfile.username}`,
          headers: {
            'Authorization': 'Token ' + jakeProfile.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.user).to.part.includes(attrs)
          done()
        })
      })
    })

    it('should return the profile for the given username and following flagged to true (with Auth)', (done) => {
      factory.attrs('stan_profile', { following: true }).then(attrs => {
        server.inject({
          method: 'GET',
          url: `/api/profiles/${stanProfile.username}`,
          headers: {
            'Authorization': 'Token ' + jakeProfile.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.user).to.part.includes(attrs)
          done()
        })
      })
    })
  })

  describe('POST /api/profiles/{username}/follow', () => {
    it('user can follow another user', (done) => {
      factory.create('user').then(newuser => {
        server.inject({
          method: 'POST',
          url: `/api/profiles/${newuser.username}/follow`,
          headers: {
            'Authorization': 'Token ' + jakeProfile.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.user.following).to.be.true()
          done()
        })
      })
    })

    it('user cannot follow another user if not authenticated', (done) => {
      factory.create('user').then(newuser => {
        server.inject({
          method: 'POST',
          url: `/api/profiles/${newuser.username}/follow`
        }, (res) => {
          expect(res.statusCode).to.be.equal(401)
          done()
        })
      })
    })

    it('ghost user cannot follow another user', (done) => {
      factory.create('ghost_profile').then(ghost => {
        server.inject({
          method: 'POST',
          url: `/api/profiles/${stanProfile.username}/follow`,
          headers: {
            'Authorization': 'Token ' + ghost.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(401)
          done()
        })
      })
    })

    it('a user cannot follow a ghost user', (done) => {
      factory.create('ghost_profile').then(ghost => {
        server.inject({
          method: 'POST',
          url: `/api/profiles/${ghost.username}/follow`,
          headers: {
            'Authorization': 'Token ' + emillyProfile.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(404)
          done()
        })
      })
    })
  })

  describe('DELETE /api/profiles/{username}/follow', () => {
    it('user can unfollow another user', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/profiles/${emillyProfile.username}/follow`,
        headers: {
          'Authorization': 'Token ' + jakeProfile.generateJWT()
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.user.following).to.be.false()
        done()
      })
    })

    it('user cannot unfollow another user if not authenticated', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/profiles/${jakeProfile.username}/follow`
      }, (res) => {
        expect(res.statusCode).to.be.equal(401)
        done()
      })
    })

    it('ghost user cannot unfollow another user', (done) => {
      factory.create('ghost_profile').then(ghost => {
        server.inject({
          method: 'DELETE',
          url: `/api/profiles/${stanProfile.username}/follow`,
          headers: {
            'Authorization': 'Token ' + ghost.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(401)
          done()
        })
      })
    })

    it('a user cannot unfollow a ghost user', (done) => {
      factory.create('ghost_profile').then(ghost => {
        server.inject({
          method: 'DELETE',
          url: `/api/profiles/${ghost.username}/follow`,
          headers: {
            'Authorization': 'Token ' + emillyProfile.generateJWT()
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(404)
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
