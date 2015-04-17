'use strict'

var parser = require('./multipart-parser')
var querystring = require('querystring')
var reducer = require('./reducer')
var url = require('url')
var validate = require('har-validator')

module.exports = function (input) {
  // don't mess with original object
  var res = JSON.parse(JSON.stringify(input))

  // sanity
  validate.response(res, function (err, valid) {
    if (!valid) {
      throw err
    }
  })

  // initialize properties
  res.headersObj = {}
  res.cookiesObj = {}

  if (res.content) {
    res.content.jsonObj = false
    res.content.paramsObj = false
  }

  // construct headers object
  if (res.headers && res.headers.length) {
    res.headersObj = res.headers.reduce(reducer, {})

    // loweCase header keys
    res.headersObj = Object.keys(res.headersObj).reduceRight(function (headers, name) {
      headers[name.toLowerCase()] = res.headersObj[name]
      return headers
    }, {})
  }

  // construct cookies object
  if (res.cookies && res.cookies.length) {
    res.cookiesObj = res.cookies.reduce(reducer, {})
  }

  // construct Cookie header
  var cookies = res.cookies.map(function (cookie) {
    return encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value)
  })

  if (cookies.length) {
    res.headersObj.cookie = cookies.join('; ')
  }

  if (res.content) {
    switch (res.content.mimeType) {
      case 'multipart/mixed':
      case 'multipart/related':
      case 'multipart/form-data':
      case 'multipart/alternative':
        // reset values
        res.content.text = ''
        res.content.mimeType = 'multipart/form-data'

        // got the full text, lets parse it
        if (res.content.text) {
          parser(res)
        }
        break

      case 'application/x-www-form-urlencoded':
        // populate the params object
        if (res.content.text) {
          res.content.paramsObj = querystring.parse(res.content.text)
        }
        break

      case 'text/json':
      case 'text/x-json':
      case 'application/json':
      case 'application/x-json':
        res.content.mimeType = 'application/json'

        if (res.content.text) {
          try {
            res.content.jsonObj = JSON.parse(res.content.text)
          } catch (e) {
            // force back to text/plain
            // if headers have proper content-type value, then this should also work
            res.content.mimeType = 'text/plain'
          }
        }
        break
    }
  }

  res.redirectURLObj = url.parse(res.redirectURL, true, true)

  return res
}
