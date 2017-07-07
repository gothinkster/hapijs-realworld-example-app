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
const Promise = require('bluebird')

describe('tags endpoint', () => {
  let server

  before((done) => {
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise.all([
        factory.create('article', { tagList: ['tag1', 'tag2', 'tag3'] }),
        factory.create('article', { tagList: ['tag4', 'tag5', 'tag6'] }),
        factory.create('article', { tagList: ['tag7', 'tag8', 'tag9', 'tag10'] })
      ]).then(_ => {
        return done()
      }).catch(done)
    })
  })

  describe('GET /tags', () => {
    it('return all available tags', (done) => {
      server.inject('/api/tags')
      .then(res => {
        expect(res.statusCode).to.equal(200)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.tags.length).to.equal(10)
        expect(jsonResponse.tags).to.to.contains(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'])
        done()
      })
      .catch(done)
    })
  })

  after((done) => {
    databaseCleaner.clean(server.app.db.link, () => {
      return done()
    })
  })
})
