/*!
 * scheduler.js
 *
 * module to schedule downloads
 *
 * @author pfleidi
 */

var Fs = require('fs');
var Path = require('path');
var Util = require('util');
var Log4js = require('log4js')();
var Helper = require('./helper');

var PLUGIN_FOLDER = __dirname + "/../plugins/";

exports.createScheduler = function createScheduler(context) {
  var modules = [];
  var downloader = require('./downloader').createDownloader(context);

  var log = context.log;
  var DEFAULT_INTERVAL = 10000;
  var INTERVAL = DEFAULT_INTERVAL;
  var currTimeout = DEFAULT_INTERVAL;

  function getPluginName(fileName) {
    return fileName.split('.')[0];
  }

  function runModule(mod, url) {
    log.info('Backwards crawling ' + url);

    if (!url) {
      log.warn(mod.NAME + ' cannot be crawled backwards or is disabled');
      return;
    }

    Helper.httpGet(url, 'utf-8', function (err, content) {
        if (err) {
          log.error('Error while downloading ' + url + ': ' + err.message);
          return;
        }

        var nextUrl = mod.nextUrl(content);
        var images = mod.nextImages(content);

        if (images.length === 0) {
          currTimeout = currTimeout / 2;
          log.warn(nextUrl + ' no images on page?');
        } else {
          currTimeout = DEFAULT_INTERVAL;
          downloader.addDownloads(images);
        }

        if (nextUrl) {
          log.debug("Next url is: " + nextUrl);
          setTimeout(function () {
              runModule(mod, nextUrl);
            }, currTimeout);
        } else {
          log.warn(mod.NAME + ' End of page?');
        }
      });
  }

  function runBackwardsModules() {
    log.info("Running Backwards-in-Time modules");
    var currTimeout = 0;

    modules.forEach(function (mod) {
        if (!mod.BACKWARDS) {
          log.warn('Skipping ' + mod.NAME + ' because backwards crawling is disabled ');
          return;
        }
        log.debug("Starting module: " + mod.BACKWARDS + " at Timeout " + currTimeout);

        setTimeout(function () {
            runModule(mod, mod.BACKWARDS);
          }, currTimeout);

        currTimeout = currTimeout + INTERVAL;
      });
  }


  /**
   * Scans the PLUGIN_FOLDER directory for modules
   *
   * all modules are stored inside of the modules array
   */
  function initModules() {
    Fs.readdirSync(PLUGIN_FOLDER).forEach(function (file) {
        if (/\.js$/.test(file)) {
          var name = getPluginName(file);
          var logger = Log4js.getLogger(name);
          var mods = require(PLUGIN_FOLDER + name).createPlugin(logger);

          log.info('Found plugin: ' + name);
          mods.forEach(function (module) {
              log.debug('Successfully loaded module: ' + module.NAME + ' from Plugin ' + name);
              modules.push(module);
            });
        }
      });
  }

  return {
    schedule: function () {
      initModules();
      runBackwardsModules();
    }
  };

};
