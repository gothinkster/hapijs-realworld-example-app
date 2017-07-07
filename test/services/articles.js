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
  let server, user
  let articles = []

  before((done) => {
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise.all([
        factory.createMany('article_with_comments_as_id', 2, { tagList: ['tag1'] }),
        factory.createMany('article', 4, { tagList: ['tag2'] }),
        factory.createMany('article', 6, { tagList: ['tag3'] }),
        factory.create('user', { username: 'mike' })
      ]).then(results => {
        articles = articles.concat(results[0], results[1], results[2])
        user = results[3]
        user.favorites = results[2].map(a => {
          a.author = user._id
          return a._id
        })
        return Promise.all([
          user.save(),
          ...results[2].map(a => a.updateFavoriteCount())])
      }).then(() => done()).catch(done)
    })
  })

  describe('server initialization', () => {
    it('articles service is define', (done) => {
      expect(articles).length(12)
      expect(server.methods.services.articles).to.be.an.object()
      expect(server.methods.services.articles.feedFor).to.be.a.function()
      expect(server.methods.services.articles.list).to.be.a.function()
      expect(server.methods.services.articles.getBySlug).to.be.a.function()
      expect(server.methods.services.articles.create).to.be.a.function()
      expect(server.methods.services.articles.update).to.be.a.function()
      expect(server.methods.services.articles.delete).to.be.a.function()
      expect(server.methods.services.articles.addComment).to.be.a.function()
      expect(server.methods.services.articles.deleteComment).to.be.a.function()
      done()
    })
  })

  describe('articles', () => {
    describe('list', () => {
      it('list(null, {limit:20,offset:0})', done => {
        server.methods.services.articles.list(null, { limit: 20, offset: 0 }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(12)
          expect(results.articlesCount).to.equal(12)
          done()
        })
      })

      it('list(null, {limit:6,offset:0})', done => {
        server.methods.services.articles.list(null, { limit: 6, offset: 0 }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(6)
          expect(results.articlesCount).to.equal(12)
          done()
        })
      })

      it('list(null, {limit:6,offset:6})', done => {
        server.methods.services.articles.list(null, { limit: 6, offset: 6 }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(6)
          expect(results.articlesCount).to.equal(12)
          done()
        })
      })

      it('list(null, {limit:20,tag:tag1})', done => {
        server.methods.services.articles.list(null, { limit: 20, tag: 'tag1' }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(2)
          expect(results.articlesCount).to.equal(2)
          done()
        })
      })

      it('list(null, {limit:20,tag:tag2})', done => {
        server.methods.services.articles.list(null, { limit: 20, tag: 'tag2' }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(4)
          expect(results.articlesCount).to.equal(4)
          done()
        })
      })

      it('list(null, {limit:20,tag:tag3})', done => {
        server.methods.services.articles.list(null, { limit: 20, tag: 'tag3' }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles).length(6)
          expect(results.articlesCount).to.equal(6)
          done()
        })
      })

      it('list(null, {author:mike})', done => {
        server.methods.services.articles.list(null, { limit: 20, offset: 0, author: 'mike' }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articlesCount).to.equal(6)
          expect(results.articles).length(6)
          done()
        })
      })

      it('list(null, {favorited:mike})', done => {
        server.methods.services.articles.list(null, {
          favorited: user.username
        }, (err, results) => {
          expect(err).to.be.null()
          expect(results.articles).to.be.an.array()
          expect(results.articles.length).to.equal(6)
          expect(results.articlesCount).to.equal(6)
          done()
        })
      })
    })

    describe('#getBySlug', () => {
      it('getBySlug(<slug>)', (done) => {
        server.methods.services.articles.getBySlug(articles[0].slug, (err, article) => {
          expect(err).to.be.null()
          expect(article._id).to.equal(articles[0]._id)
          expect(article.slug).to.equal(articles[0].slug)
          expect(article.desciption).to.equal(articles[0].desciption)
          expect(article.title).to.equal(articles[0].title)
          expect(article.body).to.equal(articles[0].body)
          expect(article.author.username).to.equal(articles[0].author.username)
          done()
        })
      })

      it('getBySlug(<slug>) unknown slug return null', (done) => {
        server.methods.services.articles.getBySlug('unlnownslug', (err, article) => {
          expect(err).to.be.null()
          expect(article).to.be.null()
          done()
        })
      })
    })

    describe('create', () => {
      it('create() with all field', (done) => {
        const payload = {
          title: 'Sample Title',
          description: 'Sample Description',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.methods.services.articles.create(user, payload, (err, article) => {
          expect(err).to.be.null()
          expect(article).to.not.be.null()
          expect(article.slug).to.equal('sample-title')
          expect(article.title).to.equal(payload.title)
          expect(article.description).to.equal(payload.description)
          expect(article.body).to.equal(payload.body)
          expect(article.tagList).to.equal(payload.tagList)
          expect(article.author).to.equal(user)
          done()
        })
      })

      it('create() with empty required field title return an error', (done) => {
        const payload = {
          title: '',
          description: 'Sample Description',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.methods.services.articles.create(user, payload, (err, article) => {
          expect(err).to.not.be.null()
          expect(article).to.be.null()
          done()
        })
      })
    })

    describe('update', () => {
      it('update() the given field to their new value', (done) => {
        const payload = {
          title: 'Sample Title Updated',
          description: 'Sample Description Updated',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list', 'updated']
        }

        server.methods.services.articles.update(articles[0], payload, (err, article) => {
          expect(err).to.be.null()
          expect(article).to.not.be.null()
          expect(article.slug).to.equal('sample-title-updated')
          expect(article.title).to.equal(payload.title)
          expect(article.description).to.equal(payload.description)
          expect(article.body).to.equal(payload.body)
          expect(article.tagList).to.equal(payload.tagList)
          expect(article.author).to.equal(articles[0].author)
          done()
        })
      })

      it('update() return an error on empty title', (done) => {
        const payload = {
          title: '',
          description: 'Sample Description Updated',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list', 'updated']
        }

        server.methods.services.articles.update(articles[1], payload, (err, article) => {
          expect(err).to.not.be.null()
          expect(article).to.be.null()
          done()
        })
      })
    })

    describe('delete', () => {
      it('delete() should succeed with an existing article', (done) => {
        server.methods.services.articles.delete(articles[5], (err, article) => {
          expect(err).to.be.null()
          expect(article).to.not.be.null()
          articles[5] = article
          done()
        })
      })

      it('delete() should fail with a non existing article', (done) => {
        server.methods.services.articles.delete(articles[5], (err, article) => {
          expect(err).to.not.be.null()
          expect(article).to.not.be.null()
          done()
        })
      })
    })

    describe('addComment', () => {
      it('addComment() should succeed on an exiting article', (done) => {
        const payload = {
          body: 'A comment body !'
        }

        server.methods.services.articles.addComment(articles[0], user, payload, (err, comment) => {
          expect(err).to.be.null()
          expect(comment.body).to.equal(payload.body)
          expect(comment.article._id).to.equal(articles[0]._id)
          expect(comment.author).to.equal(user)
          expect(comment.author.toProfileJSONFor).to.be.a.function()
          done()
        })
      })

      it('addComment() should fail on a non exiting article', (done) => {
        const payload = {
          body: 'A comment body !'
        }

        server.methods.services.articles.addComment(articles[5], user, payload, (err, comment) => {
          expect(err).to.not.be.null()
          expect(comment).to.be.null()
          done()
        })
      })
    })

    describe('deleteComment', () => {
      it('deleteComment() should delete an exiting comment', (done) => {
        const commentId = articles[0].comments[0]
        server.methods.services.articles.deleteComment(articles[0], commentId, (err, article) => {
          expect(err).to.be.null()
          expect(article).to.not.be.null()
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
