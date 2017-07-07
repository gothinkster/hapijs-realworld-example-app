'use strict'

const Code = require('code')
const Lab = require('lab')
const LabbableServer = require('../../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const after = lab.after
const it = lab.it
const expect = Code.expect
const DatabaseCleaner = require('database-cleaner')
const databaseCleaner = new DatabaseCleaner('mongodb') // type = 'mongodb|redis|couchdb'

describe('User', () => {
  let server
  let user

  before((done) => {
        // Callback fires once the server is initialized
        // or immediately if the server is already initialized
    LabbableServer.ready((err, srv) => {
      if (err) {
        return done(err)
      }

      server = srv

      return done()
    })
  })

    // server is now available to be tested
  it('can be save', (done) => {
    user = new server.app.db.User({
      username: 'francine',
      email: 'francine@example.com'
    })

    user.setPassword('password')

    user.save((err, u, numAffected) => {
      expect(err).to.be.null()
      expect(numAffected).to.be.equal(1)
      expect(u._id).to.not.be.empty()
      expect(u.username).to.be.equal('francine')
      expect(u.email).to.be.equal('francine@example.com')
      expect(u.validPassword('password')).to.be.true()
      done()
    })
  })

  it('can be find', (done) => {
    server.app.db.User.findOne({
      username: 'francine'
    }, (err, u) => {
      expect(err).to.be.null()
      expect(u._id).to.not.be.empty()
      expect(u.username).to.be.equal('francine')
      expect(u.email).to.be.equal('francine@example.com')
      done()
    })
  })

  after((done) => {
    databaseCleaner.clean(server.app.db.link, () => {
      return done()
    })
  })
})
