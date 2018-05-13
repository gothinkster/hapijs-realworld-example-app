
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
const Promise = require('bluebird')

describe('articles endpoint', () => {
  const articlesCount = 40
  let server
  let articles = []
  let jake, stan, emilly, mike

  before(async () => {
    server = await Server.deployment()

    const usersResults = await Promise
      .all([
        factory.create('jake_profile'),
        factory.create('stan_profile'),
        factory.create('emilly_profile'),
        factory.create('mike_profile')
      ])

    jake = usersResults[0]
    stan = usersResults[1]
    emilly = usersResults[2]
    mike = usersResults[3]

    const articlesResults = await Promise.all([
      factory.buildMany('article_without_assoc', 10, { author: jake._id, tagList: ['tag1'] }),
      factory.buildMany('article_without_assoc', 10, { author: stan._id, tagList: ['tag2'] }),
      factory.buildMany('article_without_assoc', 10, { author: emilly._id, tagList: ['tag3'] }),
      factory.buildMany('article_without_assoc', 10, { author: mike._id, tagList: ['tag4'] })
    ])

    articles = [].concat(
      articlesResults[0],
      articlesResults[1],
      articlesResults[2],
      articlesResults[3]
    )

    const docs = await server.app.db.Article.insertMany(articles, { j: false })
    articles = docs

    const userDocs = await Promise.all(
      docs.slice(-20).map(a => jake.favorite(a._id))
    )

    jake = userDocs.pop()
  })

  describe('initialize', () => {
    it(`have ${articlesCount} articles`, async () => {
      expect(articles).length(articlesCount)
    })
  })

  describe('GET /api/articles', () => {
    describe('/', () => {
      it('return a list of the most 20 recent articles by default', async () => {
        const res = await server.inject('/api/articles')
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).to.be.an.array()
        expect(jsonResponse.articles).length(20)
      })

      it('"?limit=10" return the 10 most recent article', async () => {
        const res = await server.inject('/api/articles?limit=10')
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).to.be.an.array()
        expect(jsonResponse.articles).length(10)
        expect(jsonResponse.articlesCount).to.equal(40)
      })

      it('"?limit=10&offset=10" return the next 10 recents articles', async () => {
        const res = await server.inject('/api/articles?limit=10&offset=10')
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).to.be.an.array()
        expect(jsonResponse.articles).length(10)
        expect(jsonResponse.articlesCount).to.equal(40)
      })

      it('"?author=<user>" return all article authored by <user>', async () => {
        const res = await server.inject(`/api/articles?author=jake`)
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).length(10)
        expect(jsonResponse.articlesCount).to.equal(10)
      })

      it('"?favorited=<user>" return all article favorited by <user>', async () => {
        const res = await server.inject(`/api/articles?favorited=${jake.username}`)
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).to.be.an.array()
        expect(jsonResponse.articles).length(20)
        expect(jsonResponse.articlesCount).to.equal(20)
      })

      it('"?tag=<tagname>" return all article tagged with <tagname>', async () => {
        const res = await server.inject('/api/articles?tag=tag1')
        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles).length(10)
      })
    })

    describe('/feed', () => {
      before(async () => {
        const results = await Promise.all([
          jake.follow(stan._id),
          jake.follow(emilly._id),
          jake.follow(mike._id)
        ])

        jake = results.pop()
      })

      it('return followed user 20 most recent articles', async () => {
        const res = await server.inject({
          method: 'GET',
          url: '/api/articles/feed',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles.length).to.equal(20)
        expect(jsonResponse.articlesCount).to.equal(30)
      })

      it('?limit=10 return followed user 10 most recent articles', async () => {
        const res = await server.inject({
          method: 'GET',
          url: '/api/articles/feed',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles.length).to.equal(20)
        expect(jsonResponse.articlesCount).to.equal(30)
      })

      it('"?offset=20" return followed user 10 next most recent articles', async () => {
        const res = await server.inject({
          method: 'GET',
          url: '/api/articles/feed?offset=20',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(200)
        var jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.articles.length).to.equal(10)
        expect(jsonResponse.articlesCount).to.equal(30)
      })

      it('return 401 Unauthorized without JWT', async () => {
        await server.inject({
          method: 'GET',
          url: '/api/articles/feed'
        })
      })
    })
  })

  describe('GET /api/articles/{slug}', () => {
    it('return the article corresponding to the slug', async () => {
      const res = await server.inject(`/api/articles/${articles[0].slug}`)
      expect(res.statusCode).to.be.equal(200)
      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.article.slug).to.equal(articles[0].slug)
      expect(jsonResponse.article.title).to.equal(articles[0].title)
    })

    it('return the article corresponding to the slug (Authenticated)', async () => {
      const res = await server.inject({
        method: 'GET',
        url: `/api/articles/${articles[39].slug}`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })

      expect(res.statusCode).to.be.equal(200)
      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.article.slug).to.equal(articles[39].slug)
      expect(jsonResponse.article.title).to.equal(articles[39].title)
      expect(jsonResponse.article.favorited).to.be.true()
    })

    it('return 404 Status code for an invalid article  slug', async () => {
      const res = await server.inject('/api/articles/unknownslug')
      expect(res.statusCode).to.be.equal(404)
    })
  })

  describe('DELETE /api/articles/{slug}', () => {
    it('should delete the article with authentication', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[0].slug}`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })
      expect(res.statusCode).to.equal(204)
    })

    it('only the author can delete his article', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[1].slug}`,
        headers: {
          'Authorization': `Token ${stan.generateJWT()}`
        }
      })
      expect(res.statusCode).to.equal(403)
    })

    it('non existing article should return 404 Not Found with authentication', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/articles/unknownslug`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })

      expect(res.statusCode).to.equal(404)
    })
  })

  describe('DELETE /api/articles/{slug}/favorite', () => {
    it('should unfavorite the article with authentication', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[39].slug}/favorite`,
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })

      expect(res.statusCode).to.equal(200)
      var jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.article.favorited).to.be.false()
    })

    it('should not unfavorite the article without authentication', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: `/api/articles/${articles[39].slug}/favorite`
      })

      expect(res.statusCode).to.equal(401)
    })
  })

  describe('POST /api/articles', () => {
    it('should create an article with authentication', async () => {
      const payload = {
        title: 'Sample Title',
        description: 'Sample Description',
        body: 'Sample Body',
        tagList: ['sample', 'tag', 'list']
      }

      const res = await server.inject({
        method: 'POST',
        payload: { article: payload },
        url: '/api/articles',
        headers: {
          'Authorization': `Token ${jake.generateJWT()}`
        }
      })

      expect(res.statusCode).to.equal(201)
      const jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.article.slug).to.be.equal('sample-title')
      expect(jsonResponse.article.title).to.be.equal(payload.title)
      expect(jsonResponse.article.description).to.be.equal(payload.description)
      expect(jsonResponse.article.body).to.be.equal(payload.body)
      expect(jsonResponse.article.tagList).to.be.equal(payload.tagList)
    })

    it('should not create an article without authentication', async () => {
      const payload = {
        title: 'Sample Title',
        description: 'Sample Description',
        body: 'Sample Body',
        tagList: ['sample', 'tag', 'list']
      }

      const res = await server.inject({
        method: 'POST',
        payload: { article: payload },
        url: '/api/articles'
      })

      expect(res.statusCode).to.equal(401)
    })

    describe('validations', () => {
      it('empty "title" should return an error ', async () => {
        const payload = {
          title: '',
          description: 'Sample Description',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        const res = await server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(422)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.includes(['title'])
      })

      it('empty "description" should return an error', async () => {
        const payload = {
          title: 'Sample Title',
          description: '',
          body: 'Sample Body',
          tagList: ['sample', 'tag', 'list']
        }

        const res = await server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(422)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.includes(['description'])
      })

      it('empty "body" should return an error', async () => {
        const payload = {
          title: 'Sample Title',
          description: 'Sample Description',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        const res = await server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(422)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.includes(['body'])
      })

      it('empty "title", "description", "body" should return errors', async () => {
        const payload = {
          title: '',
          description: '',
          body: '',
          tagList: ['sample', 'tag', 'list']
        }

        const res = await server.inject({
          method: 'POST',
          payload: { article: payload },
          url: '/api/articles',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(422)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.includes(['title', 'description', 'body'])
      })
    })

    describe('POST /api/articles/{slug}/favorite', () => {
      it('should be favorited when authenticated', async () => {
        const res = await server.inject({
          method: 'POST',
          url: `/api/articles/${articles[2].slug}/favorite`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(200)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.article.favorited).to.be.true()
      })

      it('should not be favorited when not authenticated', async () => {
        const res = await server.inject({
          method: 'POST',
          url: `/api/articles/${articles[2].slug}/favorite`
        })

        expect(res.statusCode).to.equal(401)
      })
    })

    describe('PUT /api/articles/{slug}', () => {
      describe('should update an article with field', () => {
        it('"title" field should update the article "title"', async () => {
          const payload = {
            title: `${articles[2].title} Updated`
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(200)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.article.title).to.equal(payload.title)
          expect(jsonResponse.article.slug).to.equal(articles[2].slug + '-updated')
        })

        it('"description" field should update the article "description"', async () => {
          const payload = {
            description: `${articles[2].description} Updated`
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}-updated`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(200)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.article.description).to.equal(payload.description)
        })

        it('"body" field should update the article "body"', async () => {
          const payload = {
            body: `${articles[2].body} Updated`
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}-updated`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(200)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.article.body).to.equal(payload.body)
        })
      })

      it('should not update an article without authorization and return 403 status code', async () => {
        const payload = {
          title: `${articles[2].title} Updated`
        }

        const res = await server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`,
          headers: {
            'Authorization': `Token ${stan.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(403)
      })

      it('should not update an article without authentication and return 401 status code', async () => {
        const payload = {
          title: `${articles[2].title} Updated`
        }

        const res = await server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: `/api/articles/${articles[2].slug}`
        })

        expect(res.statusCode).to.equal(401)
      })

      it('non existing article should return 404 status code with JWT', async () => {
        const payload = {
          title: `${articles[2].title} Updated`
        }

        const res = await server.inject({
          method: 'PUT',
          payload: { article: payload },
          url: '/api/articles/unknownslug',
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.equal(404)
      })

      describe('validations', () => {
        it('empty "title" should return an error ', async () => {
          const payload = {
            title: '',
            description: 'Sample Description',
            body: 'Sample Body',
            tagList: ['sample', 'tag', 'list']
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['title'])
        })

        it('empty "description" should return an error', async () => {
          const payload = {
            title: 'Sample Title',
            description: '',
            body: 'Sample Body',
            tagList: ['sample', 'tag', 'list']
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['description'])
        })

        it('empty "body" should return an error', async () => {
          const payload = {
            title: 'Sample Title',
            description: 'Sample Description',
            body: '',
            tagList: ['sample', 'tag', 'list']
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[2].slug}`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['body'])
        })

        it('empty "title", "description", "body" should return errors', async () => {
          const payload = {
            title: '',
            description: '',
            body: '',
            tagList: ['sample', 'tag', 'list']
          }

          const res = await server.inject({
            method: 'PUT',
            payload: { article: payload },
            url: `/api/articles/${articles[0].slug}`,
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['title', 'description', 'body'])
        })
      })
    })

    describe('GET /api/articles/{slug}/comments', () => {
      let article

      before(async () => {
        const results = await Promise.all([
          factory.create('article'),
          factory.createMany('comment', 5)
        ])

        article = results[0]

        await Promise.all(
          results[1].map(c => {
            c.article = article._id
            return c.save()
          })
        )

        it('return all comment for an article', async () => {
          const res = await server.inject(`/api/articles/${article.slug}/comments`)

          expect(res.statusCode).to.be.equal(200)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.comments).to.be.an.array()
          expect(jsonResponse.comments.length).to.be.equal(5)
        })
      })
    })

    describe('POST /api/articles/{slug}/comments', () => {
      it('create a comment with JWT', async () => {
        const payload = {
          body: 'Comment Body'
        }

        const res = await server.inject({
          method: 'POST',
          url: `/api/articles/${articles[3].slug}/comments`,
          payload: { comment: payload },
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(201)
        const jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.comment.body).to.be.equal(payload.body)
        expect(jsonResponse.comment.author).to.equal(jake.toProfileJSONFor(jake))
        articles[3].comments.push(jsonResponse.comment.id)
      })

      it('attempt to create a comment without JWT return a 401', async () => {
        const payload = {
          body: 'Comment Body'
        }

        const res = await server.inject({
          method: 'POST',
          url: `/api/articles/${articles[3].slug}/comments`,
          payload: { comment: payload }
        })

        expect(res.statusCode).to.be.equal(401)
      })

      describe('validations', () => {
        it('empty "body" should return an error', async () => {
          const payload = {
            body: ''
          }

          const res = await server.inject({
            method: 'POST',
            url: `/api/articles/${articles[3].slug}/comments`,
            payload: { comment: payload },
            headers: {
              'Authorization': `Token ${jake.generateJWT()}`
            }
          })

          expect(res.statusCode).to.be.equal(422)
          const jsonResponse = JSON.parse(res.payload)
          expect(jsonResponse.errors).to.includes(['body'])
        })
      })
    })

    describe('DELETE /api/articles/{slug}/comments/{id}', () => {
      let articlesWithComent

      before(async () => {
        articlesWithComent = await Promise.resolve(factory.createMany('article_with_comments', 2))
      })

      it('delete a comment with JWT', async () => {
        const article = articlesWithComent[0]
        const comment = article.comments[0]
        const commentId = comment._id.toString()

        const res = await server.inject({
          method: 'DELETE',
          url: `/api/articles/${article.slug}/comments/${commentId}`,
          headers: {
            'Authorization': `Token ${comment.author.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(204)
      })

      it('attempt to delete a comment without JWT return a 401', async () => {
        const article = articlesWithComent[0]
        const commentId = article.comments[1]._id.toString()

        const res = await server.inject({
          method: 'DELETE',
          url: `/api/articles/${article.slug}/comments/${commentId}`
        })

        expect(res.statusCode).to.be.equal(401)
      })

      it('attempt to delete a comment without authorization return a 403 status code', async () => {
        const article = articlesWithComent[0]
        const commentId = article.comments[1]._id.toString()

        const res = await server.inject({
          method: 'DELETE',
          url: `/api/articles/${article.slug}/comments/${commentId}`,
          headers: {
            'Authorization': `Token ${jake.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(403)
      })

      it('attempt to delete a non existing comment return 404 status code', async () => {
        const article = articlesWithComent[0]
        const comment = article.comments[0]

        const res = await server.inject({
          method: 'DELETE',
          url: `/api/articles/${article.slug}/comments/${comment._id}`,
          headers: {
            'Authorization': `Token ${comment.author.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(404)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.include(['404'])
      })

      it('attempt to delete a comment no belonging to the given article should return an error', async () => {
        const articleA = articlesWithComent[0]
        const articleB = articlesWithComent[1]
        const comment = articleA.comments[1]
        const commentArticleAId = comment._id.toString()

        const res = await server.inject({
          method: 'DELETE',
          url: `/api/articles/${articleB.slug}/comments/${commentArticleAId}`,
          headers: {
            'Authorization': `Token ${comment.author.generateJWT()}`
          }
        })

        expect(res.statusCode).to.be.equal(422)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.errors).to.include(['CommentReferenceError'])
      })
    })

    after(async () => {
      await databaseCleaner.clean(server.app.db.link)
    })
  })
})
