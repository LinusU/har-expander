/* global describe, it, beforeEach */

'use strict'

var expand = require('..')
var clone = require('stringify-clone')
var fixtures = require('./fixtures/response')

var should = require('should')

describe('Response', function () {
  it('should fail validation', function (done) {
    var result

    /*eslint-disable no-wrap-func */
    (function () {
      result = expand.response({yolo: 'foo'})
    }).should.throw(Error)

    should.not.exist(result)

    done()
  })

  it('should add "headersObj" to source object', function (done) {
    var result = expand.response(fixtures.headers)

    result.headersObj.should.be.an.Object
    result.headersObj.should.eql({
      'accept': 'application/json',
      'x-foo': 'Bar'
    })

    done()
  })

  it('should add "cookiesObj" to source object', function (done) {
    var result = expand.response(fixtures.cookies)

    result.cookiesObj.should.be.an.Object
    result.cookiesObj.should.eql({
      foo: 'bar',
      bar: 'baz'
    })

    result.headersObj.should.be.an.Object
    result.headersObj.should.eql({
      'x-foo': 'Bar',
      cookie: 'foo=bar; bar=baz'
    })

    done()
  })

  describe('redirectURL', function () {
    it('should parse redirectURL', function (done) {
      fixtures.min.redirectURL = 'http://mockbin.org/request?foo=bar'

      var result = expand.response(fixtures.min)

      result.redirectURLObj.should.be.an.Object
      result.redirectURLObj.should.eql({
        auth: null,
        hash: null,
        host: 'mockbin.org',
        hostname: 'mockbin.org',
        href: 'http://mockbin.org/request?foo=bar',
        path: '/request?foo=bar',
        pathname: '/request',
        port: null,
        protocol: 'http:',
        query: {
          foo: 'bar'
        },
        search: '?foo=bar',
        slashes: true
      })

      done()
    })
  })

  describe('content', function () {
    beforeEach(function (done) {
      fixtures.blank = clone(fixtures.min)
      done()
    })

    describe('multipart', function () {
      it('should convert multipart/* to multipart/form-data', function (done) {
        ['multipart/mixed', 'multipart/related', 'multipart/related', 'multipart/alternative'].forEach(function (type) {
          fixtures.blank.content.mimeType = type
          expand.response(fixtures.blank).content.mimeType.should.eql('multipart/form-data')
        })

        done()
      })

      it.skip('should parse content.text of a detailed multipart/form-data body', function (done) {
        var result = expand.response(fixtures.multipart.text.data)

        result.content.boundary.should.be.a.String
        result.content.boundary.should.equal('---011000010111000001101001')

        result.headersObj['content-type'].should.be.a.String
        result.headersObj['content-type'].should.equal('multipart/form-data; boundary=---011000010111000001101001')

        result.content.params.should.be.an.Array
        result.content.params.should.eql([{
          name: 'foo',
          value: 'Hello World',
          fileName: 'hello.txt',
          contentType: 'text/plain'
        }])

        done()
      })

      it.skip('should parse content.text of a file upload multipart/form-data body', function (done) {
        var result = expand.response(fixtures.multipart.text.file)

        result.content.params.should.be.an.Array
        result.content.params.should.eql([{
          name: 'foo',
          fileName: 'test/fixtures/files/hello.txt',
          contentType: 'text/plain'
        }])

        done()
      })

      it.skip('should parse content.text of a form multipart/form-data body', function (done) {
        var result = expand.response(fixtures.multipart.text.form)

        result.content.params.should.be.an.Array
        result.content.params.should.eql([{
          'name': 'foo',
          'value': 'bar'
        }])

        done()
      })
    })

    describe('json', function () {
      it('should convert */json to application/json', function (done) {
        ['text/json', 'text/x-json', 'application/x-json'].forEach(function (type) {
          fixtures.blank.content.mimeType = type
          expand.response(fixtures.blank).content.mimeType.should.eql('application/json')
        })

        done()
      })

      it('should add "jsonObj" to source object', function (done) {
        var result = expand.response(fixtures.json)

        result.content.jsonObj.should.be.an.Object
        result.content.jsonObj.should.eql({ number: 1,
          string: 'f"oo',
          arr: [ 1, 2, 3 ],
          nested: { a: 'b' },
          arr_mix: [ 1, 'a', { arr_mix_nested: {} } ]
        })

        done()
      })

      it('should gracefully fallback if not able to parse JSON', function (done) {
        fixtures.blank.content.text = 'foo/bar'
        fixtures.blank.content.mimeType = 'application/json'
        expand.response(fixtures.blank).content.mimeType.should.eql('text/plain')

        done()
      })
    })
  })
})
