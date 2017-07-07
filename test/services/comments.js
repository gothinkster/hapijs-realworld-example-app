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
  let article
  let comments

  before((done) => {
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise.all([
        factory.createMany('comment', 5),
        factory.create('article')
      ]).then(results => {
        article = results[1]
        comments = results[0].map(c => {
          c.article = article._id
          return c.save()
        })

        return Promise.all([
          ...comments
        ]).then(results => {
          comments = results
          article.comments = comments
        }).then(() => done())
      }).catch(done)
    })
  })

  describe('server initialization', () => {
    it('comments service is define', (done) => {
      expect(comments).length(5)
      expect(article.comments).length(5)
      expect(server.methods.services.comments).to.be.an.object()
      expect(server.methods.services.comments.getById).to.be.a.function()
      expect(server.methods.services.comments.getCommentsFor).to.be.a.function()
      done()
    })
  })

  describe('comments', () => {
    it('getById() return the comment by its id', (done) => {
      const commentId = comments[0]._id
      server.methods.services.comments.getById(commentId, (err, comment) => {
        expect(err).to.be.null()
        expect(comment).to.not.be.null()
        expect(comment._id).to.equal(commentId)
        done()
      })
    })

    it('getCommentsFor() return all comments for an article', (done) => {
      server.methods.services.comments.getCommentsFor(article, (err, comments) => {
        expect(err).to.be.null()
        expect(comments).to.be.an.array()
        expect(comments.length).to.equal(5)
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
