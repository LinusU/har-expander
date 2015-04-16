/* global describe, it */

'use strict'

var expand = require('..')
var fixture = require('./fixtures/har')

var should = require('should')

describe('Response', function () {
  it('should fail validation', function (done) {
    var result;

    /*eslint-disable no-wrap-func */
    (function () {
      result = expand.response({yolo: 'foo'})
    }).should.throw(Error)

    should.not.exist(result)

    done()
  })

  it('should pass object', function (done) {
    var result = expand.response(fixture.log.entries[0].response)

    result.should.be.an.Object

    done()
  })
})
