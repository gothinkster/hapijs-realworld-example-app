const mongoose = require('mongoose')
const Article = mongoose.model('Article')

async function getAllTags () {
  const tags = await Article.find().distinct('tagList')
  return { tags }
}

module.exports = [
  {
    name: 'services.tags.getAll',
    method: getAllTags
  }
]
