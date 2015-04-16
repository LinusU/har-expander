/* global describe, it */

'use strict'

var expand = require('..')
var fixture = require('./fixtures/har')

var should = require('should')

describe('HAR', function () {
  it('should fail validation', function (done) {
    var result;

    /*eslint-disable no-wrap-func */
    (function () {
      result = expand({yolo: 'foo'})
    }).should.throw(Error)

    should.not.exist(result)

    done()
  })

  it('should run on all entries', function (done) {
    var result = expand(fixture)

    result.log.entries.should.be.an.Object
    result.log.entries[0].request.should.not.eql(fixture.log.entries[0].request)

    done()
  })
})
