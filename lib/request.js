'use strict'

var clone = require('stringify-clone')
var es = require('event-stream')
var MultiPartForm = require('form-data')
var parser = require('./multipart-parser')
var querystring = require('querystring')
var reducer = require('./reducer')
var url = require('url')
var util = require('util')
var validate = require('har-validator')

module.exports = function (input) {
  // don't mess with original object
  var req = clone(input)

  // sanity check
  validate.request(req, function (err, valid) {
    if (!valid) {
      throw err
    }
  })

  // initialize properties
  req.queryObj = {}
  req.headersObj = {}
  req.cookiesObj = {}

  if (req.postData) {
    req.postData.jsonObj = false
    req.postData.paramsObj = false
  }

  // construct query object
  if (req.queryString && req.queryString.length) {
    req.queryObj = req.queryString.reduce(reducer, {})
  }

  // de-construct the uri
  req.uriObj = url.parse(req.url, true, true)

  // merge all possible queryString values
  req.queryObj = util._extend(req.queryObj, req.uriObj.query)

  // reset uriObj values for a clean url
  req.uriObj.query = null
  req.uriObj.search = null
  req.uriObj.path = req.uriObj.pathname

  // keep the base url clean of queryString
  req.url = url.format(req.uriObj)

  // update the uri object
  req.uriObj.query = req.queryObj
  req.uriObj.search = '?' + querystring.stringify(req.queryObj)

  if (req.uriObj.search) {
    req.uriObj.path = req.uriObj.pathname + req.uriObj.search
  }

  // construct a full url
  req.fullUrl = url.format(req.uriObj)

  // update uriObj
  req.uriObj.href = req.fullUrl

  // construct headers object
  if (req.headers && req.headers.length) {
    req.headersObj = req.headers.reduce(reducer, {})

    // loweCase header keys
    req.headersObj = Object.keys(req.headersObj).reduceRight(function (headers, name) {
      headers[name.toLowerCase()] = req.headersObj[name]
      return headers
    }, {})
  }

  // construct cookies object
  if (req.cookies && req.cookies.length) {
    req.cookiesObj = req.cookies.reduce(reducer, {})
  }

  // construct Cookie header
  var cookies = req.cookies.map(function (cookie) {
    return encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value)
  })

  if (cookies.length) {
    req.headersObj.cookie = cookies.join('; ')
  }

  if (req.postData) {
    switch (req.postData.mimeType) {
      case 'multipart/mixed':
      case 'multipart/related':
      case 'multipart/form-data':
      case 'multipart/alternative':
        // reset values
        req.postData.mimeType = 'multipart/form-data'

        if (req.postData.text) {
          // got the full text, lets parse it

          parser(req)
        } else if (req.postData.params) {
          // lets construct the full text from existing params

          // initialize
          req.postData.text = ''

          var form = new MultiPartForm()

          // magic sauce
          form._boundary = '---011000010111000001101001'

          req.postData.params.forEach(function (param) {
            form.append(param.name, param.value || '', {
              filename: param.fileName || null,
              contentType: param.contentType || null
            })
          })

          form.pipe(es.map(function (data, cb) {
            req.postData.text += data
          }))

          req.postData.boundary = form.getBoundary()
          req.headersObj['content-type'] = 'multipart/form-data; boundary=' + form.getBoundary()
        }
        break

      case 'application/x-www-form-urlencoded':
        // populate the params object
        if (req.postData.params) {
          // populate the text property
          req.postData.paramsObj = req.postData.params.reduce(reducer, {})

          // always overwrite
          req.postData.text = querystring.stringify(req.postData.paramsObj)
        } else if (req.postData.text && req.postData.text.length > 0) {
          req.postData.paramsObj = querystring.parse(req.postData.text)
        } else {
          req.postData.text = ''
        }
        break

      case 'text/json':
      case 'text/x-json':
      case 'application/json':
      case 'application/x-json':
        req.postData.mimeType = 'application/json'

        if (req.postData.text) {
          try {
            req.postData.jsonObj = JSON.parse(req.postData.text)
          } catch (e) {
            // force back to text/plain
            // if headers have proper content-type value, then this should also work
            req.postData.mimeType = 'text/plain'
          }
        }
        break
    }
  }

  return req
}
