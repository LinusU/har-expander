/* global describe, it, beforeEach */

'use strict'

var expand = require('..')
var clone = require('stringify-clone')
var fixtures = require('./fixtures/request')

var should = require('should')

describe('Request', function () {
  it('should fail validation', function (done) {
    var result

    /*eslint-disable no-extra-parens */
    (function () {
      result = expand.request({yolo: 'foo'})
    }).should.throw(Error)

    should.not.exist(result)

    done()
  })

  it('should add "headersObj" to source object', function (done) {
    var result = expand.request(fixtures.headers)

    result.headersObj.should.be.an.Object
    result.headersObj.should.eql({
      'accept': 'application/json',
      'x-foo': 'Bar'
    })

    done()
  })

  it('should add "cookiesObj" to source object', function (done) {
    var result = expand.request(fixtures.cookies)

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

  describe('URL & Query', function () {
    it('should add "uriObj" to source object', function (done) {
      var result = expand.request(fixtures.query)

      result.uriObj.should.be.an.Object
      result.uriObj.should.eql({
        auth: null,
        hash: null,
        host: 'mockbin.com',
        hostname: 'mockbin.com',
        href: 'http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value',
        path: '/har?foo=bar&foo=baz&baz=abc&key=value',
        pathname: '/har',
        port: null,
        protocol: 'http:',
        query: {
          baz: 'abc',
          key: 'value',
          foo: [
            'bar',
            'baz'
          ]
        },
        search: '?foo=bar&foo=baz&baz=abc&key=value',
        slashes: true
      })

      done()
    })

    it('should add "queryObj" to source object', function (done) {
      var result = expand.request(fixtures.query)

      result.queryObj.should.be.an.Object
      result.queryObj.should.eql({
        baz: 'abc',
        key: 'value',
        foo: [
          'bar',
          'baz'
        ]
      })

      done()
    })

    it('should modify orignal url to strip query string', function (done) {
      var result = expand.request(fixtures.query)

      result.url.should.be.a.String
      result.url.should.eql('http://mockbin.com/har')

      done()
    })

    it('should add "fullUrl" to source object', function (done) {
      var result = expand.request(fixtures.query)

      result.fullUrl.should.be.a.String
      result.fullUrl.should.eql('http://mockbin.com/har?foo=bar&foo=baz&baz=abc&key=value')

      done()
    })

    it('should fix "path" property of "uriObj" to match queryString', function (done) {
      var result = expand.request(fixtures.query)

      result.uriObj.path.should.be.a.String
      result.uriObj.path.should.eql('/har?foo=bar&foo=baz&baz=abc&key=value')

      done()
    })
  })

  describe('postData', function () {
    beforeEach(function (done) {
      fixtures.blank = clone(fixtures.min)
      done()
    })

    describe('multipart', function () {
      it('should convert multipart/* to multipart/form-data', function (done) {
        ['multipart/mixed', 'multipart/related', 'multipart/related', 'multipart/alternative'].forEach(function (type) {
          fixtures.blank.postData.mimeType = type
          expand.request(fixtures.blank).postData.mimeType.should.eql('multipart/form-data')
        })

        done()
      })

      it('should parse postData.params of a detailed multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.params.data)

        result.postData.boundary.should.be.a.String
        result.postData.boundary.should.equal('---011000010111000001101001')

        result.headersObj['content-type'].should.be.a.String
        result.headersObj['content-type'].should.equal('multipart/form-data; boundary=---011000010111000001101001')

        result.postData.text.should.be.a.String
        result.postData.text.should.equal('-----011000010111000001101001\r\nContent-Disposition: form-data; name="foo"; filename="hello.txt"\r\nContent-Type: text/plain\r\n\r\nHello World\r\n-----011000010111000001101001--')

        done()
      })

      it('should parse postData.params of a file upload multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.params.file)

        result.postData.text.should.be.a.String
        result.postData.text.should.equal('-----011000010111000001101001\r\nContent-Disposition: form-data; name="foo"; filename="hello.txt"\r\nContent-Type: text/plain\r\n\r\n\r\n-----011000010111000001101001--')

        done()
      })

      it('should parse postData.params of a form multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.params.form)

        result.postData.text.should.be.a.String
        result.postData.text.should.equal('-----011000010111000001101001\r\nContent-Disposition: form-data; name="foo"\r\n\r\nbar\r\n-----011000010111000001101001--')

        done()
      })

      it.skip('should parse postData.text of a detailed multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.text.data)

        result.postData.boundary.should.be.a.String
        result.postData.boundary.should.equal('---011000010111000001101001')

        result.headersObj['content-type'].should.be.a.String
        result.headersObj['content-type'].should.equal('multipart/form-data; boundary=---011000010111000001101001')

        result.postData.params.should.be.an.Array
        result.postData.params.should.eql([{
          name: 'foo',
          value: 'Hello World',
          fileName: 'hello.txt',
          contentType: 'text/plain'
        }])

        done()
      })

      it.skip('should parse postData.text of a file upload multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.text.file)

        result.postData.params.should.be.an.Array
        result.postData.params.should.eql([{
          name: 'foo',
          fileName: 'test/fixtures/files/hello.txt',
          contentType: 'text/plain'
        }])

        done()
      })

      it.skip('should parse postData.text of a form multipart/form-data body', function (done) {
        var result = expand.request(fixtures.multipart.text.form)

        result.postData.params.should.be.an.Array
        result.postData.params.should.eql([{
          'name': 'foo',
          'value': 'bar'
        }])

        done()
      })
    })

    describe('json', function () {
      it('should convert */json to application/json', function (done) {
        ['text/json', 'text/x-json', 'application/x-json'].forEach(function (type) {
          fixtures.blank.postData.mimeType = type
          expand.request(fixtures.blank).postData.mimeType.should.eql('application/json')
        })

        done()
      })

      it('should add "jsonObj" to source object', function (done) {
        var result = expand.request(fixtures.json)

        result.postData.jsonObj.should.be.an.Object
        result.postData.jsonObj.should.eql({ number: 1,
          string: 'f"oo',
          arr: [ 1, 2, 3 ],
          nested: { a: 'b' },
          arr_mix: [ 1, 'a', { arr_mix_nested: {} } ]
        })

        done()
      })

      it('should gracefully fallback if not able to parse JSON', function (done) {
        fixtures.blank.postData.text = 'foo/bar'
        fixtures.blank.postData.mimeType = 'application/json'
        expand.request(fixtures.blank).postData.mimeType.should.eql('text/plain')

        done()
      })
    })

    describe('urlencoded', function () {
      it('should set postData.text = empty string when postData.params === undefined', function (done) {
        fixtures.blank.postData.mimeType = 'application/x-www-form-urlencoded'
        var result = expand.request(fixtures.blank)

        result.postData.should.have.property('text')
        result.postData.text.should.equal('')

        done()
      })

      it('should parse postData.params of a x-www-form-urlencoded body', function (done) {
        var result = expand.request(fixtures['form-params'])

        result.postData.text.should.be.a.String
        result.postData.text.should.equal('foo=bar&hello=world')

        result.postData.paramsObj.should.be.an.Object
        result.postData.paramsObj.should.eql({
          foo: 'bar',
          hello: 'world'
        })

        done()
      })

      it('should parse postData.text of a x-www-form-urlencoded body', function (done) {
        var result = expand.request(fixtures['form-text'])

        result.postData.paramsObj.should.be.an.Object
        result.postData.paramsObj.should.eql({
          foo: 'bar',
          bar: 'baz'
        })

        done()
      })

    })
  })
})
