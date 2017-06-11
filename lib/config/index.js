const conf = {}

conf.auth = {
  secret: process.env.SECRET_KEY || 'itsasecret',
  tokenType: 'Token',
  algorithm: 'HS256',
  verifyOptions: { algorithms: [ 'HS256' ] }
}

conf.database = {
  uri: process.env.MONGO_DB_URI || 'mongodb://localhost:27017/conduit_' + process.env.NODE_ENV
}

module.exports = conf
