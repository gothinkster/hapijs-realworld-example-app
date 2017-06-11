const User = require('../../lib/modules/models/User')
const Article = require('../../lib/modules/models/Article')
const Comment = require('../../lib/modules/models/Comment')
const faker = require('faker')

module.exports = (factory) => {
  factory.define('article', Article, {
    title: faker.lorem.words(),
    description: faker.lorem.sentences(),
    body: faker.lorem.paragraphs(20)

  })
}
