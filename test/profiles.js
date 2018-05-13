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
const factory = require('./factories')
const DatabaseCleaner = require('database-cleaner')
const databaseCleaner = new DatabaseCleaner('mongodb')
const join = require('bluebird').join

describe('profiles endpoint', () => {
  let server
  let jakeProfile
  let stanProfile
  let emillyProfile

  before(async () => {
    server = await Server.deployment()

    var p1 = factory.create('jake_profile')
    var p2 = factory.create('stan_profile')
    var p3 = factory.create('emilly_profile')

    await join(p1, p2, p3, async (jake, stan, emilly) => {
      jake.following = [stan._id, emilly._id]
      jakeProfile = await jake.save()

      stan.following = [jake._id, emilly._id]
      stanProfile = await stan.save()

      emilly.following = [jake._id, stan._id]
      emillyProfile = await emilly.save()
      // console.log('\n-----\n', jake, '\n-----\n', stan, '\n-----\n', emilly)
    })
  })

  describe('GET /api/profiles/{username}', () => {
    it('should return the profile for the given username (No Auth)', async () => {
      const attrs = await factory.attrs('jake_profile')
      const res = await server.inject(`/api/profiles/${jakeProfile.username}`)

      expect(res.statusCode).to.be.equal(200)
      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.user).to.part.include(attrs)
    })

    it('should return the profile for the given username and following flagged to true (with Auth)', async () => {
      const attrs = await factory.attrs('emilly_profile', { following: true })
      const res = await server.inject({
        method: 'GET',
        url: `/api/profiles/${emillyProfile.username}`,
        headers: {
          'Authorization': jakeProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(200)

      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.user).to.part.include(attrs)
    })

    it('should return the profile for the given username and following flagged to true (with Auth)', async () => {
      const attrs = await factory.attrs('stan_profile', { following: true })
      const res = await server.inject({
        method: 'GET',
        url: `/api/profiles/${stanProfile.username}`,
        headers: {
          'Authorization': jakeProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(200)

      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.user).to.part.include(attrs)
    })
  })

  describe('POST /api/profiles/{username}/follow', () => {
    it('user can follow another user', async () => {
      const newuser = await factory.create('user')
      const res = await server.inject({
        method: 'POST',
        url: `/api/profiles/${newuser.username}/follow`,
        headers: {
          'Authorization': jakeProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(200)

      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.user.following).to.be.true()
    })

    it('user cannot follow another user if not authenticated', async () => {
      const newuser = await factory.create('user')
      const res = await server.inject({
        method: 'POST',
        url: `/api/profiles/${newuser.username}/follow`
      })

      expect(res.statusCode).to.be.equal(401)
    })

    it('ghost user cannot follow another user', async () => {
      const ghost = await factory.create('ghost_profile')
      const res = await server.inject({
        method: 'POST',
        url: `/api/profiles/${stanProfile.username}/follow`,
        headers: {
          'Authorization': ghost.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(401)
    })

    it('a user cannot follow a ghost user', async () => {
      const ghost = await factory.create('ghost_profile')
      const res = await server.inject({
        method: 'POST',
        url: `/api/profiles/${ghost.username}/follow`,
        headers: {
          'Authorization': emillyProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(404)
    })
  })

  describe('DELETE /api/profiles/{username}/follow', () => {
    it('user can unfollow another user', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/profiles/${emillyProfile.username}/follow`,
        headers: {
          'Authorization': jakeProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(200)

      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.user.following).to.be.false()
    })

    it('user cannot unfollow another user if not authenticated', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/profiles/${jakeProfile.username}/follow`
      })

      expect(res.statusCode).to.be.equal(401)
    })

    it('ghost user cannot unfollow another user', async () => {
      const ghost = await factory.create('ghost_profile')
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/profiles/${stanProfile.username}/follow`,
        headers: {
          'Authorization': ghost.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(401)
    })

    it('a user cannot unfollow a ghost user', async () => {
      const ghost = await factory.create('ghost_profile')
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/profiles/${ghost.username}/follow`,
        headers: {
          'Authorization': emillyProfile.generateJWT()
        }
      })

      expect(res.statusCode).to.be.equal(404)
    })
  })

  after(async () => {
    await databaseCleaner.clean(server.app.db.link)
  })
})
