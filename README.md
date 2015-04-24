# HAR Expander [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

Expands HTTP Archive ([HAR](http://www.softwareishard.com/blog/har-12-spec/)) objects with helpful utility properties and a sprinkle of magic.

[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Code Climate][codeclimate-quality]][codeclimate-url]
[![Coverage Status][codeclimate-coverage]][codeclimate-url]
[![Dependencies][david-image]][david-url]

## Utility Properties

###### Request

- creates a new property `queryObj` as a standard object from `queryString` array
- creates a new property `headersObj` as a standard object from `headers` array
- creates a new property `cookieObj` as a standard object from `cookies` array
- parses `url` property for any query string params and adds them to `queryString` & `queryObj`
- creates a new property `fullUrl` by combining `url` with `queryString`
- creates a new property `uriObj` by parsing `fullUrl`
- restores `url` to queryString-less state after parsing
- creates a new property `postData.jsonObj` from parsing `req.postData.text` with appropriate mimeType
- creates a new property `postData.paramsObj` from `postData.params` array
- creates a new property `postData.paramsObj` from parsing `req.postData.text` with appropriate mimeType *(`multipart/form-data`, `application/x-www-form-urlencoded`)*

###### Response

- creates a new property `headersObj` as a standard object from `headers` array
- creates a new property `cookieObj` as a standard object from `cookies` array
- creates a new property `redirectURLObj` by parsing `redirectURL`
- creates a new property `content.jsonObj` from parsing `req.postData.text` with appropriate mimeType

## Example

###### Before

```json
{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "har-expander",
      "version": "1.0"
    },
    "entries": [
      {
        "startedDateTime": "2015-02-10T07:33:17.146Z",
        "time": 110,
        "request": {
          "method": "GET",
          "url": "http://mockbin.com/har?key=value",
          "httpVersion": "HTTP/1.1",
          "headers": [
            { "name": "Host", "value": "mockbin.com" },
            { "name": "Connection", "value": "keep-alive" }
          ],
          "queryString": [
            { "name": "foo", "value": "bar"}
          ],
          "cookies": [
            { "name": "foo", "value": "bar" }
          ],
          "headersSize": 0,
          "bodySize": 0
        },
        "response": {
          "status": 200,
          "statusText": "OK",
          "httpVersion": "HTTP/1.1",
          "headers": [
            { "name": "Date", "value": "Tue, 10 Feb 2015 07:33:16 GMT" },
            { "name": "X-Powered-By", "value": "mockbin.com" },
            { "name": "Content-Type", "value": "text/html; charset=utf-8" }
          ],
          "cookies": [
            { "name": "foo", "value": "bar" }
          ],
          "content": {
            "size": 0,
            "mimeType": "application/json",
            "text": "{\"foo\": \"bar\"}"
          },
          "redirectURL": "",
          "headersSize": 0,
          "bodySize": 0
        },
        "cache": {},
        "timings": {
          "send": -1,
          "wait": -1,
          "receive": -1
        }
      }
    ]
  }
}
```

###### After

```json
{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "har-expander",
      "version": "1.0"
    },
    "entries": [
      {
        "startedDateTime": "2015-02-10T07:33:17.146Z",
        "time": 110,
        "request": {
          "method": "GET",
          "url": "http://mockbin.com/har",
          "httpVersion": "HTTP/1.1",
          "headers": [
            { "name": "Host", "value": "mockbin.com" },
            { "name": "Connection", "value": "keep-alive" }
          ],
          "queryString": [
            { "name": "foo", "value": "bar"}
          ],
          "cookies": [
            { "name": "foo", "value": "bar" }
          ],
          "headersSize": 0,
          "bodySize": 0,
          "queryObj": {
            "foo": "bar",
            "key": "value"
          },
          "headersObj": {
            "connection": "keep-alive",
            "host": "mockbin.com",
            "cookie": "foo=bar"
          },
          "cookiesObj": {
            "foo": "bar"
          },
          "uriObj": {
            "protocol": "http:",
            "slashes": true,
            "auth": null,
            "host": "mockbin.com",
            "port": null,
            "hostname": "mockbin.com",
            "hash": null,
            "search": "?foo=bar&key=value",
            "query": {
              "foo": "bar",
              "key": "value"
            },
            "pathname": "/har",
            "path": "/har?foo=bar&key=value",
            "href": "http://mockbin.com/har?foo=bar&key=value"
          },
          "fullUrl": "http://mockbin.com/har?foo=bar&key=value"
        },
        "response": {
          "status": 200,
          "statusText": "OK",
          "httpVersion": "HTTP/1.1",
          "headers": [
            { "name": "Date", "value": "Tue, 10 Feb 2015 07:33:16 GMT" },
            { "name": "X-Powered-By", "value": "mockbin.com" },
            { "name": "Content-Type", "value": "text/html; charset=utf-8" }
          ],
          "cookies": [
            { "name": "foo", "value": "bar" }
          ],
          "content": {
            "size": 0,
            "mimeType": "application/json",
            "text": "{\"foo\": \"bar\"}",
            "jsonObj": {
              "foo": "bar"
            },
            "paramsObj": false
          },
          "redirectURL": "",
          "headersSize": 0,
          "bodySize": 0,
          "headersObj": {
            "content-type": "text/html; charset=utf-8",
            "x-powered-by": "mockbin.com",
            "date": "Tue, 10 Feb 2015 07:33:16 GMT",
            "cookie": "foo=bar"
          },
          "cookiesObj": {
            "foo": "bar"
          },
          "redirectURLObj": {
            "protocol": null,
            "slashes": null,
            "auth": null,
            "host": null,
            "port": null,
            "hostname": null,
            "hash": null,
            "search": "",
            "query": {},
            "pathname": null,
            "path": null,
            "href": ""
          }
        },
        "cache": {},
        "timings": {
          "send": -1,
          "wait": -1,
          "receive": -1
        }
      }
    ]
  }
}
```

## Install

```sh
npm install --save har-expander
```

## Usage

```

  Usage: har-expander [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## API

### har-expander()

```js
var expander = require('har-expander')

// expand full HAR log
var expandedHAR = expander(HAR)

// expand request object only
var expandedReq = expander.request(HAR.log.entries[0].request)

// expand response object only
var expandedRes = expander.request(HAR.log.entries[0].response)
```

## Support

Donations are welcome to help support the continuous development of this project.

[![Gratipay][gratipay-image]][gratipay-url]
[![PayPal][paypal-image]][paypal-url]
[![Flattr][flattr-image]][flattr-url]
[![Bitcoin][bitcoin-image]][bitcoin-url]

## License

[MIT](LICENSE) &copy; [Ahmad Nassri](https://www.ahmadnassri.com)

[license-url]: https://github.com/ahmadnassri/har-expander/blob/master/LICENSE

[travis-url]: https://travis-ci.org/ahmadnassri/har-expander
[travis-image]: https://img.shields.io/travis/ahmadnassri/har-expander.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/har-expander
[npm-license]: https://img.shields.io/npm/l/har-expander.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/har-expander.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/har-expander.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/ahmadnassri/har-expander
[codeclimate-quality]: https://img.shields.io/codeclimate/github/ahmadnassri/har-expander.svg?style=flat-square
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/ahmadnassri/har-expander.svg?style=flat-square

[david-url]: https://david-dm.org/ahmadnassri/har-expander
[david-image]: https://img.shields.io/david/ahmadnassri/har-expander.svg?style=flat-square

[gratipay-url]: https://www.gratipay.com/ahmadnassri/
[gratipay-image]: https://img.shields.io/gratipay/ahmadnassri.svg?style=flat-square

[paypal-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS&on0=project&os0=har-expander
[paypal-image]: http://img.shields.io/badge/payPal-donate-green.svg?style=flat-square

[flattr-url]: https://flattr.com/submit/auto?user_id=codeinchaos&url=https://github.com/ahmadnassri/har-expander&title=har-expander&language=&tags=github&category=software
[flattr-image]: http://img.shields.io/badge/flattr-donate-green.svg?style=flat-square

[bitcoin-image]: http://img.shields.io/badge/bitcoin-1Nb46sZRVG3or7pNaDjthcGJpWhvoPpCxy-green.svg?style=flat-square
[bitcoin-url]: https://www.coinbase.com/checkouts/7579a122f0cb2e7e4bbc2de9d780caa5
