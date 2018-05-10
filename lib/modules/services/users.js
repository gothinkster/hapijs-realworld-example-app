'user strict'

const mongoose = require('mongoose')
const User = mongoose.model('User')

async function getUserByEmail (email) {
  const user = await User.findOne({ email })
  return user
}

async function getUserById (id) {
  const user = await User.findById(id)
  return user
}

async function getUserByUsername (username) {
  const user = await User.findOne({ username })
  return user
}

async function createUser (payload) {
  let user = new User()

  user.email = payload.user.email
  user.username = payload.user.username
  user.setPassword(payload.user.password)

  const newUser = await user.save()
  return newUser
}

async function updateUser (user, payload) {
  if (user.username !== payload.user.username) {
    user.username = payload.user.username
  }

  if (user.email !== payload.user.email) {
    user.email = payload.user.email
  }

  user.bio = payload.user.bio
  user.image = payload.user.image

  if (payload.user.password !== '') {
    user.setPassword(payload.user.password)
  }

  const updatedUser = await user.save()
  return updatedUser
}

function favoriteArticle (user, article, callback) {
  Promise.resolve(
    user.favorite(article._id)
  ).then(() => {
    return article.updateFavoriteCount().then(favoritedArticle => {
      return callback(null, favoritedArticle)
    })
  }).catch(callback)
}

function unfavoriteArticle (user, article, callback) {
  Promise.resolve(
    user.unfavorite(article._id)
  ).then(() => {
    return article.updateFavoriteCount().then(favoritedArticle => {
      return callback(null, favoritedArticle)
    })
  }).catch(callback)
}

async function followUser (user, userId) {
  const userFollowed = await user.follow(userId)
  return userFollowed
}

async function unfollowUser (user, userId, callback) {
  const userUnfollowed = await user.unfollow(userId)
  return userUnfollowed
}

module.exports = [
  {
    name: 'services.users.getByEmail',
    method: getUserByEmail
  },
  {
    name: 'services.users.getById',
    method: getUserById
  },
  {
    name: 'services.users.getByUsername',
    method: getUserByUsername
  },
  {
    name: 'services.users.create',
    method: createUser
  },
  {
    name: 'services.users.update',
    method: updateUser
  },
  {
    name: 'services.users.favoriteArticle',
    method: favoriteArticle
  },
  {
    name: 'services.users.unfavoriteArticle',
    method: unfavoriteArticle
  },
  {
    name: 'services.users.follow',
    method: followUser
  },
  {
    name: 'services.users.unfollow',
    method: unfollowUser
  }
]
