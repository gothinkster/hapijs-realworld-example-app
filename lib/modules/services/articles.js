'use strict'

const mongoose = require('mongoose')
const Article = mongoose.model('Article')
const Comment = mongoose.model('Comment')
const User = mongoose.model('User')
const CommentReferenceError = require('../api/helpers').CommentReferenceError

async function getArticles (user, query) {
  let mQuery = {}

  if (query.tag) {
    mQuery.tagList = { $in: [query.tag] }
  }

  const author = query.author ? await User.findOne({ username: query.author }) : null
  const favoriter = query.favorited ? await User.findOne({ username: query.favorited }) : null

  if (author) {
    mQuery.author = author._id
  }

  if (favoriter) {
    mQuery._id = { $in: favoriter.favorites }
  } else if (query.favorited) {
    mQuery._id = { $in: [] }
  }

  const articles = await Article.find(mQuery)
    .limit(Number(query.limit))
    .skip(Number(query.offset))
    .sort({ createdAt: 'desc' })
    .populate('author')
    .exec()

  const articlesCount = await Article.count(mQuery).exec()

  return {
    articles: articles.map(article => article.toJSONFor(user)),
    articlesCount: articlesCount
  }
}

async function getArticlesFeedFor (user, query) {
  let mQuery = {
    author: { $in: user.following }
  }

  const articles = await Article.find(mQuery)
    .limit(Number(query.limit))
    .skip(Number(query.offset))
    .sort({ createdAt: 'desc' })
    .populate('author')
    .exec()

  const articlesCount = await Article.count(mQuery).exec()

  return {
    articles: articles.map(article => article.toJSONFor(user)),
    articlesCount: articlesCount
  }
}

async function getArticleBySlug (slug) {
  const article = await Article.findOne({ slug })
    .populate('author')
    .exec()

  return article
}

async function createArticle (author, payload, callback) {
  let article = new Article(Object.assign(payload, { author }))

  const savedArticle = await article.save()
  return savedArticle
}

async function updateArticle (article, payload) {
  article = Object.assign(article, payload)

  const savedArticle = await article.save()
  return savedArticle
}

async function deleteArticle (article) {
  const removedArticle = await article.remove()
  return removedArticle
}

async function addComment (article, author, commentPayload) {
  let comment = new Comment(Object.assign({ author, article }, commentPayload))

  const savedComment = await comment.save()

  article.comments.push(savedComment._id)
  await article.save()

  return savedComment
}

async function deleteComment (article, commentId) {
  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new Error('Comment not found')
  }

  const index = article.comments.indexOf(commentId)

  if (index !== -1) {
    article.comments.remove(comment._id)
  } else {
    throw new CommentReferenceError()
  }

  await comment.remove()
  const savedArticle = await article.save()

  return savedArticle
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
