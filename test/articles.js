
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

describe('articles endpoint', () => {
  const articlesCount = 40
  let server
  let articles = []
  let jake, stan, emilly, mike

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return Promise
      .all([
        factory.create('jake_profile'),
        factory.create('stan_profile'),
        factory.create('emilly_profile'),
        factory.create('mike_profile')
      ])
      .then(usersResults => {
        jake = usersResults[0]
        stan = usersResults[1]
        emilly = usersResults[2]
        mike = usersResults[3]

        return Promise.all([
          factory.buildMany('article_without_assoc', 10, {author: jake._id, tagList: ['tag1']}),
          factory.buildMany('article_without_assoc', 10, {author: stan._id, tagList: ['tag2']}),
          factory.buildMany('article_without_assoc', 10, {author: emilly._id, tagList: ['tag3']}),
          factory.buildMany('article_without_assoc', 10, {author: mike._id, tagList: ['tag4']})
        ]).then(articlesResults => {
          articles = [].concat(
            articlesResults[0],
            articlesResults[1],
            articlesResults[2],
            articlesResults[3]
          )

          return server.app.db.Article
            .insertMany(articles, {j: false})
            .then(docs => {
              articles = docs
              return Promise.all(
                docs.slice(-20).map(a => jake.favorite(a._id))
              ).then((userDocs) => {
                jake = userDocs.pop()
                return done()
              })
            })
        })
      }).catch(done)
    })
  })

  describe('initialize', () => {
    it(`have ${articlesCount} articles`, (done) => {
      expect(articles).length(articlesCount)
      done()
    })
  })

  describe('GET /api/articles', () => {
    describe('/', () => {
      it('return a list of the most 20 recent articles by default', (done) => {
        server.inject('/api/articles').then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).to.be.an.array()
          expect(jsonResponse.articles).length(20)
          return done()
        }).catch(done)
      })

      it('"?limit=10" return the 10 most recent article', (done) => {
        server.inject('/api/articles?limit=10').then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).to.be.an.array()
          expect(jsonResponse.articles).length(10)
          expect(jsonResponse.articlesCount).to.equal(40)
          done()
        }).catch(done)
      })

      it('"?limit=10&offset=10" return the next 10 recents articles', (done) => {
        server.inject('/api/articles?limit=10&offset=10').then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).to.be.an.array()
          expect(jsonResponse.articles).length(10)
          expect(jsonResponse.articlesCount).to.equal(40)
          done()
        }).catch(done)
      })

      it('"?author=<user>" return all article authored by <user>', (done) => {
        server.inject(`/api/articles?author=jake`).then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).length(10)
          expect(jsonResponse.articlesCount).to.equal(10)
          done()
        }).catch(done)
      })

      it('"?favorited=<user>" return all article favorited by <user>', (done) => {
        server.inject(`/api/articles?favorited=${jake.username}`).then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).to.be.an.array()
          expect(jsonResponse.articles).length(20)
          expect(jsonResponse.articlesCount).to.equal(20)
          done()
        }).catch(done)
      })

      it('"?tag=<tagname>" return all article tagged with <tagname>', (done) => {
        server.inject('/api/articles?tag=tag1').then((res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles).length(10)
          done()
        }).catch(done)
      })
    })

    describe('/feed', () => {
      before((done) => {
        return Promise.all([
          jake.follow(stan._id),
          jake.follow(emilly._id),
          jake.follow(mike._id)
        ])
        .then((results) => {
          jake = results.pop()
          return done
        })
        .catch(done)
      })

      it('return followed user 20 most recent articles', (done) => {
        server.inject({
          method: 'GET',
          url: '/api/articles/feed',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles.length).to.equal(20)
          expect(jsonResponse.articlesCount).to.equal(30)
          done()
        })
      })

      it('?limit=10 return followed user 10 most recent articles', (done) => {
        server.inject({
          method: 'GET',
          url: '/api/articles/feed',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles.length).to.equal(20)
          expect(jsonResponse.articlesCount).to.equal(30)
          done()
        })
      })

      it('"?offset=20" return followed user 10 next most recent articles', (done) => {
        server.inject({
          method: 'GET',
          url: '/api/articles/feed?offset=20',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        }, (res) => {
          expect(res.statusCode).to.be.equal(200)
          var jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.articles.length).to.equal(10)
          expect(jsonResponse.articlesCount).to.equal(30)
          done()
        })
      })

      it('return 401 Unauthorized without JWT', (done) => {
        server.inject({
          method: 'GET',
          url: '/api/articles/feed'
        }, (res) => {
          expect(res.statusCode).to.be.equal(401)
          done()
        })
      })
    })
  })

  describe('GET /api/articles/{slug}', () => {
    it('return the article corresponding to the slug', (done) => {
      server.inject(`/api/articles/${articles[0].slug}`, (res) => {
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.article.slug).to.equal(articles[0].slug)
        expect(jsonResponse.article.title).to.equal(articles[0].title)
        done()
      })
    })

    it('return the article corresponding to the slug (Authenticated)', (done) => {
      server.inject({
        method: 'GET',
        url: `/api/articles/${articles[39].slug}`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }, (res) => {
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.article.slug).to.equal(articles[39].slug)
        expect(jsonResponse.article.title).to.equal(articles[39].title)
        expect(jsonResponse.article.favorited).to.be.true()
        done()
      })
    })

    it('return 404 Status code for an invalid article  slug', (done) => {
      server.inject('/api/articles/unknownslug', (res) => {
        expect(res.statusCode).to.be.equal(404)
        done()
      })
    })
  })

  describe('DELETE /api/articles/{slug}', () => {
    it('should delete the article with authentication', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[0].slug}`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.equal(204)
        done()
      }).catch(done)
    })

    it('only the author can delete his article', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[1].slug}`,
        headers: {
          'Authorization': `Token ${stan.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.equal(403)
        done()
      }).catch(done)
    })

    it('non existing article should return 404 Not Found with authentication', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/articles/unknownslug`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.equal(404)
        done()
      }).catch(done)
    })
  })

  describe('DELETE /api/articles/{slug}/favorite', () => {
    it('should unfavorite the article with authentication', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[39].slug}/favorite`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.article.favorited).to.be.false()
        done()
      }).catch(done)
    })

    it('should not unfavorite the article without authentication', (done) => {
      server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[39].slug}/favorite`
      }).then(res => {
        expect(res.statusCode).to.equal(401)
        done()
      }).catch(done)
    })
  })

  describe('POST /api/articles', () => {
    it('should create an article with authentication', (done) => {
      const payload = {
        title: 'Sample Title',
        description: 'Sample Description',
        body: 'Sample Body',
        tagList: ['sample', 'tag', 'list']
      }

      server.inject({
        method: 'POST',
        payload: {article: payload},
        url: '/api/articles',
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })
      .then(res => {
        expect(res.statusCode).to.equal(201)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.article.slug).to.be.equal('sample-title')
        expect(jsonResponse.article.title).to.be.equal(payload.title)
        expect(jsonResponse.article.description).to.be.equal(payload.description)
        expect(jsonResponse.article.body).to.be.equal(payload.body)
        expect(jsonResponse.article.tagList).to.be.equal(payload.tagList)
        done()
      }).catch(done)
    })

    it('should not create an article without authentication', (done) => {
      const payload = {
        title: 'Sample Title',
        description: 'Sample Description',
        body: 'Sample Body',
        tagList: ['sample', 'tag', 'list']
      }

      server.inject({
        method: 'POST',
        payload: { article: payload },
        url: '/api/articles'
      })
        .then(res => {
          expect(res.statusCode).to.equal(401)
          done()
        }).catch(done)
    })

    describe('validations', () => {
      it('empty "title" should return an error ', (done) => {
        const payload = {
          title: '',
          description: 'Sample Description',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['title'])
            done()
          }).catch(done)
      })

      it('empty "description" should return an error', (done) => {
        const payload = {
          title: 'Sample Title',
          description: '',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['description'])
            done()
          }).catch(done)
      })

      it('empty "body" should return an error', (done) => {
        const payload = {
          title: 'Sample Title',
          description: 'Sample Description',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['body'])
            done()
          }).catch(done)
      })

      it('empty "title", "description", "body" should return errors', (done) => {
        const payload = {
          title: '',
          description: '',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['title', 'description', 'body'])
            done()
          }).catch(done)
      })
    })
  })

  describe('POST /api/articles/{slug}/favorite', (done) => {
    it('should be favorited when authenticated', (done) => {
      server.inject({
        method: 'POST',
        url: `/api/articles/${articles[2].slug}/favorite`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })
        .then(res => {
          expect(res.statusCode).to.equal(200)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.article.favorited).to.be.true()
          done()
        }).catch(done)
    })

    it('should not be favorited when not authenticated', (done) => {
      server.inject({
        method: 'POST',
        url: `/api/articles/${articles[2].slug}/favorite`
      })
        .then(res => {
          expect(res.statusCode).to.equal(401)
          done()
        }).catch(done)
    })
  })

  describe('PUT /api/articles/{slug}', () => {
    describe('should update an article with field', (done) => {
      it('"title" field should update the article "title"', (done) => {
        const payload = {
          title: `${articles[2].title} Updated`
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(200)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.article.title).to.equal(payload.title)
            expect(jsonResponse.article.slug).to.equal(articles[2].slug + '-updated')
            done()
          }).catch(done)
      })

      it('"description" field should update the article "description"', (done) => {
        const payload = {
          description: `${articles[2].description} Updated`
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}-updated`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(200)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.article.description).to.equal(payload.description)
            done()
          }).catch(done)
      })

      it('"body" field should update the article "body"', (done) => {
        const payload = {
          body: `${articles[2].body} Updated`
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}-updated`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(200)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.article.body).to.equal(payload.body)
            done()
          }).catch(done)
      })
    })

    it('should not update an article without authorization and return 403 status code', (done) => {
      const payload = {
        title: `${articles[2].title} Updated`
      }

      server.inject({
        method: 'PUT',
        payload: { article: payload },
        url: `/api/articles/${articles[2].slug}`,
        headers: {
          'Authorization': `Token ${stan.generateJWT()}`
        }
      })
        .then(res => {
          expect(res.statusCode).to.equal(403)
          done()
        }).catch(done)
    })

    it('should not update an article without authentication and return 401 status code', (done) => {
      const payload = {
        title: `${articles[2].title} Updated`
      }

      server.inject({
        method: 'PUT',
        payload: { article: payload },
        url: `/api/articles/${articles[2].slug}`
      })
        .then(res => {
          expect(res.statusCode).to.equal(401)
          done()
        }).catch(done)
    })

    it('non existing article should return 404 status code with JWT', (done) => {
      const payload = {
        title: `${articles[2].title} Updated`
      }

      server.inject({
        method: 'PUT',
        payload: { article: payload },
        url: '/api/articles/unknownslug',
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })
        .then(res => {
          expect(res.statusCode).to.equal(404)
          done()
        }).catch(done)
    })

    describe('validations', () => {
      it('empty "title" should return an error ', (done) => {
        const payload = {
          title: '',
          description: 'Sample Description',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['title'])
            done()
          }).catch(done)
      })

      it('empty "description" should return an error', (done) => {
        const payload = {
          title: 'Sample Title',
          description: '',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['description'])
            done()
          }).catch(done)
      })

      it('empty "body" should return an error', (done) => {
        const payload = {
          title: 'Sample Title',
          description: 'Sample Description',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['body'])
            done()
          }).catch(done)
      })

      it('empty "title", "description", "body" should return errors', (done) => {
        const payload = {
          title: '',
          description: '',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[0].slug}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })
          .then(res => {
            expect(res.statusCode).to.equal(422)
            const jsonResponse = JSON.parse(res.payload)
            expect(jsonResponse.errors).to.includes(['title', 'description', 'body'])
            done()
          }).catch(done)
      })
    })
  })

  describe('GET /api/articles/{slug}/comments', () => {
    let article

    before((done) => {
      return Promise.all([
        factory.create('article'),
        factory.createMany('comment', 5)
      ]).then(results => {
        article = results[0]
        return Promise.all(
          results[1].map(c => {
            c.article = article._id
            return c.save()
          })).then(() => {
            return done
          })
      })// .catch(done)
    })

    it('return all comment for an article', (done) => {
      server.inject(`/api/articles/${article.slug}/comments`)
      .then(res => {
        expect(res.statusCode).to.be.equal(200)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.comments).to.be.an.array()
        expect(jsonResponse.comments.length).to.be.equal(5)
        done()
      })
      .catch(done)
    })
  })

  describe('POST /api/articles/{slug}/comments', () => {
    it('create a comment with JWT', (done) => {
      const payload = {
        body: 'Comment Body'
      }

      server.inject({
        method: 'POST',
        url: `/api/articles/${articles[3].slug}/comments`,
        payload: { comment: payload },
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.be.equal(201)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.comment.body).to.be.equal(payload.body)
        expect(jsonResponse.comment.author).to.equal(jake.toProfileJSONFor(jake))
        articles[3].comments.push(jsonResponse.comment.id)
        done()
      }).catch(done)
    })

    it('attempt to create a comment without JWT return a 401', (done) => {
      const payload = {
        body: 'Comment Body'
      }

      server.inject({
        method: 'POST',
        url: `/api/articles/${articles[3].slug}/comments`,
        payload: { comment: payload }
      }).then(res => {
        expect(res.statusCode).to.be.equal(401)
        done()
      }).catch(done)
    })

    describe('validations', () => {
      it('empty "body" should return an error', (done) => {
        const payload = {
          body: ''
        }

        server.inject({
          method: 'POST',
          url: `/api/articles/${articles[3].slug}/comments`,
          payload: { comment: payload },
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        }).then(res => {
          expect(res.statusCode).to.be.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['body'])
          done()
        }).catch(done)
      })
    })
  })

  describe('DELETE /api/articles/{slug}/comments/{id}', () => {
    let articlesWithComent

    before((done) => {
      Promise.resolve(factory.createMany('article_with_comments', 2))
      .then(savedArticles => {
        articlesWithComent = savedArticles
        return done()
      }).catch(done)
    })

    it('delete a comment with JWT', (done) => {
      const article = articlesWithComent[0]
      const comment = article.comments[0]
      const commentId = comment._id.toString()

      server.inject({
        method: 'DELETE',
        url: `/api/articles/${article.slug}/comments/${commentId}`,
        headers: {
          'Authorization': `Token ${comment.author.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.be.equal(204)
        done()
      }).catch(done)
    })

    it('attempt to delete a comment without JWT return a 401', (done) => {
      const article = articlesWithComent[0]
      const commentId = article.comments[1]._id.toString()

      server.inject({
        method: 'DELETE',
        url: `/api/articles/${article.slug}/comments/${commentId}`
      }).then(res => {
        expect(res.statusCode).to.be.equal(401)
        done()
      }).catch(done)
    })

    it('attempt to delete a comment without authorization return a 403 status code', (done) => {
      const article = articlesWithComent[0]
      const commentId = article.comments[1]._id.toString()

      server.inject({
        method: 'DELETE',
        url: `/api/articles/${article.slug}/comments/${commentId}`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.be.equal(403)
        done()
      }).catch(done)
    })

    it('attempt to delete a non existing comment return 404 status code', (done) => {
      const article = articlesWithComent[0]
      const comment = article.comments[0]

      server.inject({
        method: 'DELETE',
        url: `/api/articles/${article.slug}/comments/${comment._id}`,
        headers: {
          'Authorization': `Token ${comment.author.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.be.equal(404)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.include(['404'])
        done()
      }).catch(done)
    })

    it('attempt to delete a comment no belonging to the given article should return an error', (done) => {
      const articleA = articlesWithComent[0]
      const articleB = articlesWithComent[1]
      const comment = articleA.comments[1]
      const commentArticleAId = comment._id.toString()

      server.inject({
        method: 'DELETE',
        url: `/api/articles/${articleB.slug}/comments/${commentArticleAId}`,
        headers: {
          'Authorization': `Token ${comment.author.generateJWT()}`
        }
      }).then(res => {
        expect(res.statusCode).to.be.equal(422)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.include(['CommentReferenceError'])
        done()
      }).catch(done)
    })
  })

  after((done) => {
    databaseCleaner.clean(server.app.db.link, () => {
      return done()
    })
  })
})
