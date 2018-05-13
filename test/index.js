'use strict'

const Code = require('code')
const Lab = require('lab')
const Server = require('../lib')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const before = lab.before
const it = lab.it
const expect = Code.expect

describe('index', () => {
  let server

  before(async () => {
    server = await Server.deployment()
  })

  // server is now available to be tested
  it('initializes.', () => {
    expect(server).to.exist()
  })

  describe('status endpoint', () => {
    it('return status 200', async () => {
      const res = await server.inject('/api/status')
      expect(res.statusCode).to.be.equal(200)

      let jsonResponse = JSON.parse(res.payload)
      expect(jsonResponse.status).to.equal('UP')
    })
  })
})
