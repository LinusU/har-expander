'use strict'

var Dicer = require('dicer')
var reducer = require('./reducer')
var typer = require('media-typer')

module.exports = function (src) {
  var header = src.headersObj['content-type'] || src.mimeType

  if (!header) {
    return false
  }

  // parse Content-Type to get boundary
  var type = typer.parse(header)

  if (!type.parameters.boundary) {
    return false
  }

  var values = []
  var params = []

  // find the right reference
  var data = src[src.postData ? 'postData' : 'content']

  // set the boundary
  data.boundary = type.parameters.boundary

  // parse a file upload
  var dice = new Dicer({
    boundary: type.parameters.boundary
  })

  dice.on('part', function (part) {
    part.on('data', function (data) {
      values.push(src.toString('utf8'))
    })

    part.on('header', function (headers) {
      var param = {}

      if (headers['content-disposition']) {
        // normalize header
        var header = headers['content-disposition'][0].replace('form-data', 'form-data/text')
        var disposition = typer.parse(header || 'form-data/text')

        param.name = disposition.parameters.name

        if (disposition.parameters.filename) {
          param.fileName = disposition.parameters.filename
        }
      }

      if (headers['content-type']) {
        var type = typer.parse(headers['content-type'][0] || 'application/octet-stream')

        param.contentType = [[type.type, type.subtype].join('/'), type.suffix].join('+').replace(/\+$/, '')
      }

      params.push(param)
    })
  })

  dice.on('finish', function () {
    // assign values and send to params array
    data.params = params.map(function (param, index) {
      // append value to pair
      param.value = values[index]

      return param
    })

    data.paramsObj = params.reduce(reducer, {})
  })

  dice.write(src.postData.text || src.content.text)
}
