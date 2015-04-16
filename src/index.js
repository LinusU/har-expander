'use strict'

var request = require('./request')
var response = require('./response')
var validate = require('har-validator')

module.exports = function (input) {
  // don't mess with original object
  var har = JSON.parse(JSON.stringify(input))

  // sanity
  validate(har, function (err, valid) {
    if (!valid) {
      throw err
    }
  })

  har.log.entries.forEach(function (entry) {
    entry.request = request(entry.request)
    entry.response = response(entry.response)
  })

  return har
}

module.exports.request = request
module.exports.response = response
