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
  let server
  let articles

  before((done) => {
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise.all([
        factory.create('article', {tagList: ['tag1', 'tag2', 'tag3']}),
        factory.create('article', {tagList: ['tag4', 'tag5', 'tag6']}),
        factory.create('article', {tagList: ['tag7', 'tag8', 'tag9', 'tag10']})
      ]).then(results => {
        articles = [].concat(results[0], results[1], results[2])
        return done()
      }).catch(done)
    })
  })

  describe('server initialization', () => {
    it('tags service is define', (done) => {
      expect(articles).length(3)
      expect(server.methods.services.tags).to.be.an.object()
      expect(server.methods.services.tags.getAll).to.be.a.function()
      done()
    })
  })

  describe('getAll()', () => {
    it('get all tags', (done) => {
      server.methods.services.tags.getAll((err, tags) => {
        expect(err).to.be.null()
        expect(tags).to.contains(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'])
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
