/*!
 * helper.js
 *
 * Module contains some helper functions
 */

var HttpClient = require('wwwdude');

exports.httpGet = function httpGet(url, encoding, callback) {
  if (!url) {
    callback(new Error("No url given! Can't download " + url));
    return;
  }

  var client = HttpClient.createClient({
      headers: { 'User-Agent': 'fucking magnets' },
      encoding: encoding
    });

  client.get(url)
  .on('error', function (data, resp) {
      callback(new Error(url + 'returned with code: ' + resp.statusCode));
    })
  .on('network-error', function (err) {
      callback(new Error(url + 'returned with network error: ' + err.message));
    })
  .on('success', function (data, resp) {
      var content = {
        url: url,
        data: data
      };
      callback(null, content);
    }).send();
};
