'use strict'

const Code = require('code')
const Lab = require('lab')
const LabbableServer = require('../../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const after = lab.after
const it = lab.it
const expect = Code.expect
const factory = require('../factories')
const DatabaseCleaner = require('database-cleaner')
const databaseCleaner = new DatabaseCleaner('mongodb')
const Promise = require('bluebird')

describe('Services', () => {
  let server, user2, user3
  var user1, article

  before((done) => {
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise.all([
        factory.create('user'),
        factory.create('user'),
        factory.create('user'),
        factory.create('article')
      ]).then(results => {
        user1 = results[0]
        user2 = results[1]
        user3 = results[2]
        article = results[3]
      }).then(done).catch(done)
    })
  })

  describe('server initialization', () => {
    it('users service is define', (done) => {
      expect(server.methods.services.users).to.be.an.object()
      expect(server.methods.services.users.getByEmail).to.be.a.function()
      expect(server.methods.services.users.getById).to.be.a.function()
      expect(server.methods.services.users.getByUsername).to.be.a.function()
      expect(server.methods.services.users.create).to.be.a.function()
      expect(server.methods.services.users.update).to.be.a.function()
      expect(server.methods.services.users.favoriteArticle).to.be.a.function()
      expect(server.methods.services.users.unfavoriteArticle).to.be.a.function()
      expect(server.methods.services.users.follow).to.be.a.function()
      expect(server.methods.services.users.unfollow).to.be.a.function()
      done()
    })
  })

  describe('users', () => {
    it('getByEmail', (done) => {
      server.methods.services.users.getByEmail(user1.email, (err, user) => {
        expect(err).to.be.null()
        expect(user.email).to.equal(user1.email)
        done()
      })
    })

    it('getByUsername', (done) => {
      server.methods.services.users.getByUsername(user2.username, (err, user) => {
        expect(err).to.be.null()
        expect(user.username).to.equal(user2.username)
        done()
      })
    })

    it('getById', (done) => {
      server.methods.services.users.getById(user3._id, (err, user) => {
        expect(err).to.be.null()
        expect(user._id).to.equal(user3._id)
        done()
      })
    })

    it('create', (done) => {
      factory.attrs('user', {password: 'password'}).then(attrs => {
        server.methods.services.users.create({ user: attrs }, (err, user) => {
          expect(err).to.be.null()
          expect(user._id).to.not.be.undefined().and.not.empty()
          expect(user.username).to.equal(attrs.username)
          expect(user.email).to.equal(attrs.email)
          expect(user.bio).to.equal(attrs.bio)
          expect(user.image).to.equal(attrs.image)
          done()
        })
      }).catch(done)
    })

    it('update', (done) => {
      let payload = {
        username: `${user1.username}updated`,
        email: `updated${user1.email}`,
        password: 'p4ss2@rd'
      }

      server.methods.services.users.update(user1, {user: payload}, (err, user) => {
        expect(err).to.be.null()
        expect(user.username).to.equal(payload.username)
        expect(user.email).to.equal(payload.email)
        expect(user.validPassword(payload.password)).to.be.true()
        expect(user.bio).to.equal(user1.bio)
        expect(user.image).to.equal(user1.image)
        done()
      })
    })

    it('favorite', (done) => {
      server.methods.services.users.favoriteArticle(user1, article, (err, a) => {
        expect(err).to.be.null()
        expect(user1.favorites).to.contain(a._id)
        expect(a.favoritesCount).to.equal(1)
        done()
      })
    })

    it('unfavorite', (done) => {
      server.methods.services.users.unfavoriteArticle(user1, article, (err, a) => {
        expect(err).to.be.null()
        expect(user1.favorites).to.equal([])
        expect(a.favoritesCount).to.equal(0)
        done()
      })
    })

    it('follow', (done) => {
      server.methods.services.users.follow(user1, user2._id, (err, user) => {
        expect(err).to.be.null()
        expect(user.following).to.contain(user2._id)
        expect(user2.toProfileJSONFor(user).following).to.be.true()
        done()
      })
    })

    it('unfollow', (done) => {
      server.methods.services.users.unfollow(user1, user2._id, (err, user) => {
        expect(err).to.be.null()
        expect(user.following).to.equal([])
        expect(user2.toProfileJSONFor(user).following).to.be.false()
        done()
      })
    })
  })

  after((done) => {
    databaseCleaner.clean(server.app.db.link, () => {
      return done()
    })
  })
})
