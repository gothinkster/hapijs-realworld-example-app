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

describe('User', () => {
  let server

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
    let user = new server.app.db.User({
      username: 'user1',
      email: 'user1@example.com'
    })

    user.setPassword('password')

    user.save((err, u, numAffected) => {
      expect(err).to.be.null()
      expect(numAffected).to.be.equal(1)
      expect(u._id).to.not.be.empty()
      expect(u.username).to.be.equal('user1')
      expect(u.email).to.be.equal('user1@example.com')
      expect(u.validPassword('password')).to.be.true()
      done()
    })
  })

  it('can be find', (done) => {
    server.app.db.User.findOne({
      username: 'user1'
    }, (err, u) => {
      expect(err).to.be.null()
      expect(u._id).to.not.be.empty()
      expect(u.username).to.be.equal('user1')
      expect(u.email).to.be.equal('user1@example.com')
      done()
    })
  })

  after(() => {
    return server.app.db.User.find({}).remove()
  })
})
