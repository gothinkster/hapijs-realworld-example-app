const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

function getCommentById (commentId, callback) {
  Comment.findById(commentId)
  .populate('author')
  .exec()
  .then(comment => callback(null, comment))
  .catch(err => callback(err, null))
}

function getCommentsForArticle (article, callback) {
  Comment.find({article: article._id})
  .populate('author')
  .exec()
  .then(comments => callback(null, comments))
  .catch(err => callback(err, null))
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
