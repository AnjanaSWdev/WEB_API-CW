const crypto = require('crypto');

// Wraps a controller's res.json() so that, after the response body is
// built, we compute an ETag (hash of the body) and compare it against the
// client's If-None-Match header. If they match, we discard the body we
// just built and send 304 Not Modified instead.
function conditionalGet(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const serialized = JSON.stringify(body);
    const etag = crypto.createHash('sha1').update(serialized).digest('hex');

    res.set('ETag', etag);

    const clientETag = req.headers['if-none-match'];
    if (clientETag && clientETag === etag) {
      return res.status(304).end();
    }

    return originalJson(body);
  };

  next();
}

module.exports = conditionalGet;