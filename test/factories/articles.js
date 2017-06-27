const Article = require('../../lib/modules/models/Article')
const Comment = require('../../lib/modules/models/Comment')
const faker = require('faker')

module.exports = (factory) => {
  factory.define('comment', Comment, {
    body: () => faker.lorem.paragraphs(1),
    author: factory.assoc('user')
  })

  factory.define('article', Article, {
    title: () => faker.lorem.words(3),
    description: () => faker.lorem.sentences(),
    body: () => faker.lorem.paragraphs(1),
    tagList: () => faker.lorem.words().split(' '),
    // comments: factory.assocMany('comment', 3, '_id'),
    author: factory.assoc('user')
  })

  factory.define('article_without_assoc', Article, {
    title: () => `${faker.lorem.words(3)}`,
    description: () => faker.lorem.sentences(),
    body: () => faker.lorem.paragraphs(1),
    tagList: () => faker.lorem.words().split(' ')
  })

  factory.define('article_with_comments', Article, {
    title: () => faker.lorem.words(3),
    description: () => faker.lorem.sentences(),
    body: () => faker.lorem.paragraphs(1),
    tagList: () => faker.lorem.words().split(' '),
    comments: factory.assocMany('comment', 2),
    author: factory.assoc('user')
  })

  factory.define('article_with_comments_as_id', Article, {
    title: () => faker.lorem.words(3),
    description: () => faker.lorem.sentences(),
    body: () => faker.lorem.paragraphs(1),
    tagList: () => faker.lorem.words().split(' '),
    comments: factory.assocMany('comment', 2, '_id'),
    author: factory.assoc('user')
  })
}
