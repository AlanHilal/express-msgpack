Express Msgpack
===============

[![License](https://img.shields.io/github/license/textbook/express-msgpack.svg)](https://github.com/textbook/express-msgpack/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/textbook/express-msgpack.svg?branch=master)](https://travis-ci.org/textbook/express-msgpack)
[![Test Coverage](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/test_coverage)](https://codeclimate.com/github/textbook/express-msgpack/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/e9a820ea77a01c1ba8bb/maintainability)](https://codeclimate.com/github/textbook/express-msgpack/maintainability)
[![NPM Version](https://img.shields.io/npm/v/express-msgpack.svg)](https://www.npmjs.com/package/express-msgpack)

[Express] and [MessagePack], together at last. Uses [`msgpack-lite`][1] by default.

Functionality
-------------

Provides transparent middleware that can be used to support clients requesting
`Accept: application/msgpack` from endpoints using `res.json` or sending
`Content-Type: application/msgpack` to any endpoint. You can continue to use
`req.body` and `res.json` and `expressMsgpack` will handle the conversion in
the background using `msgpack-lite` or any compatible library of your choice.

Installation
------------

```bash
$ npm install --save express-msgpack
// or
$ yarn add express-msgpack
```

If you intend to use an alternative to `msgpack-lite` (see Configuration) you
can add the `--no-optional` flag; it's an optional dependency.

Usage
-----

```javascript
const msgpack = require("express-msgpack");

// ...
app.use(msgpack());
```

Configuration
-------------

To configure, pass options when you configure the middleware. Currently supported options are:

  - `encoder`: a function converting from JavaScript to MessagePack (default:
    `msgpack-lite#encode`)
  - `decoder`: a function converting from MessagePack to JavaScript (default:
    `msgpack-lite#decode`)

For example, to switch to the node-gyp C++ based [msgpack] library:

```javascript
const { pack, unpack } = require("msgpack");
const msgpack = require("express-msgpack");

// ...

app.use(msgpack({ decoder: unpack, encoder: pack }));
```

Development
-----------

The tests are in the `__tests__/` directory and are run using [Jest]. They're
split into two files:

  - `unit.test.js` - mockist unit tests, to check specific internal details
  - `integration.test.js` - integration tests using [SuperTest] with a simple
    Express app using the middleware

[Express]: https://expressjs.com/
[Jest]: https://jestjs.io/
[MessagePack]: https://msgpack.org/
[msgpack]: https://www.npmjs.com/package/msgpack
[SuperTest]: https://github.com/visionmedia/supertest
[1]: https://www.npmjs.com/package/msgpack-lite
