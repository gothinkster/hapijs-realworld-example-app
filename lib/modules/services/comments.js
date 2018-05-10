const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

async function getCommentById (commentId) {
  const comment = await Comment.findById(commentId)
    .populate('author')
    .exec()

  return comment
}

async function getCommentsForArticle (article, callback) {
  const comments = await Comment.find({ article: article._id })
    .populate('author')
    .exec()

  return comments
}

module.exports = [
  {
    name: 'services.comments.getById',
    method: getCommentById
  },
  {
    name: 'services.comments.getCommentsFor',
    method: getCommentsForArticle
  }
]
