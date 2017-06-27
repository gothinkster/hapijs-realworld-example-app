const mongoose = require('mongoose')
const Article = mongoose.model('Article')

function getAllTags (callback) {
  Article.find().distinct('tagList')
  .then(tags => {
    return callback(null, tags)
  })
  .catch((err) => callback(err, null))
}

module.exports = [
  {
    name: 'services.tags.getAll',
    method: getAllTags
  }
]
