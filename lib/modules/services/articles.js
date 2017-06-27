'use strict'

const mongoose = require('mongoose')
const Promise = require('bluebird')
const Article = mongoose.model('Article')
const Comment = mongoose.model('Comment')
const User = mongoose.model('User')
const CommentReferenceError = require('../api/helpers').CommentReferenceError

function getArticles (user, query, callback) {
  let mQuery = {}

  if (query.tag) {
    mQuery.tagList = { $in: [ query.tag ] }
  }

  Promise.join(
    query.author ? User.findOne({ username: query.author }) : null,
    query.favorited ? User.findOne({ username: query.favorited }) : null,
    (author, favoriter) => {
      if (author) {
        mQuery.author = author._id
      }

      if (favoriter) {
        mQuery._id = { $in: favoriter.favorites }
      } else if (query.favorited) {
        mQuery._id = { $in: [] }
      }

      return Promise.join(
      Article.find(mQuery)
      .limit(Number(query.limit))
      .skip(Number(query.offset))
      .sort({createdAt: 'desc'})
      .populate('author')
      .exec(),
      Article.count(mQuery).exec(), (articles, articlesCount) => {
        let results = {
          articles: articles.map(article => article.toJSONFor(user)),
          articlesCount: articlesCount
        }
        return callback(null, results)
      }).catch(err => callback(err, null))
    })
}

function getArticlesFeedFor (user, query, callback) {
  let mQuery = {
    author: { $in: user.following }
  }

  return Promise.join(
    Article.find(mQuery)
      .limit(Number(query.limit))
      .skip(Number(query.offset))
      .sort({ createdAt: 'desc' })
      .populate('author')
      .exec(),
    Article.count(mQuery).exec(), (articles, articlesCount) => {
      let results = {
        articles: articles.map(article => article.toJSONFor(user)),
        articlesCount: articlesCount
      }
      return callback(null, results)
    }).catch(err => callback(err, null))
}

function getArticleBySlug (slug, callback) {
  Article.findOne({slug})
    .populate('author')
    .exec()
    .then(article => callback(null, article))
    .catch(err => callback(err, null))
}

function createArticle (author, payload, callback) {
  let article = new Article(Object.assign(payload, {author}))
  article.save((err, savedArticle) => {
    if (err) return callback(err, null)
    return callback(null, savedArticle)
  })
}

function updateArticle (article, payload, callback) {
  article = Object.assign(article, payload)
  article.save((err, savedArticle) => {
    if (err) return callback(err, null)
    return callback(null, savedArticle)
  })
}

function deleteArticle (article, callback) {
  article.remove().then(removedArticle => {
    return callback(null, removedArticle)
  }).catch(err => callback(err, article))
}

function addComment (article, author, commentPayload, callback) {
  let comment = new Comment(Object.assign({ author, article }, commentPayload))
  comment.save().then(savedComment => {
    article.comments.push(savedComment._id)
    return article.save().then((_) => {
      return callback(null, savedComment)
    })
  }).catch(err => callback(err, null))
}

function deleteComment (article, commentId, callback) {
  Comment.findById(commentId).then(comment => {
    if (!comment) {
      return callback(new Error('Comment not found'), article)
    }

    let index = article.comments.indexOf(commentId)

    if (index !== -1) {
      article.comments.remove(comment._id)
    } else {
      return callback(new CommentReferenceError(), null)
    }

    return comment.remove().then(comment => {
      article.save()
        .then(savedArticle => {
          return callback(null, savedArticle)
        })
    })
  }).catch(err => callback(err, article))
}

module.exports = [
  {
    name: 'services.articles.list',
    method: getArticles
  },
  {
    name: 'services.articles.feedFor',
    method: getArticlesFeedFor
  },
  {
    name: 'services.articles.getBySlug',
    method: getArticleBySlug
  },
  {
    name: 'services.articles.create',
    method: createArticle
  },
  {
    name: 'services.articles.update',
    method: updateArticle
  },
  {
    name: 'services.articles.delete',
    method: deleteArticle
  },
  {
    name: 'services.articles.addComment',
    method: addComment
  },
  {
    name: 'services.articles.deleteComment',
    method: deleteComment
  }
]
