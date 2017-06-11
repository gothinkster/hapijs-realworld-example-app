'use strict'

const Code = require('code')
const Lab = require('lab')
const LabbableServer = require('../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const it = lab.it
const expect = Code.expect

describe('index', () => {
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
  it('initializes.', (done) => {
    expect(server).to.exist()

    // isInitialized() can be used to check the server's init state
    expect(LabbableServer.isInitialized()).to.equal(true)
    done()
  })

  describe('status endpoint', () => {
    it('return status 200', (done) => {
      server.inject('/api/status', (res) => {
        expect(res.statusCode).to.be.equal(200)
        let jsonResponse = JSON.parse(res.payload)
        expect(jsonResponse.status).to.equal('UP')
        done()
      })
    })
  })
})
