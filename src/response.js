'use strict'

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

  return res
}
