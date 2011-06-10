/**
 * This is the main scheduler for magnets.js
 *
 * It's main purpose is to manage and schedule
 * modules for different websites
 *
 * @author makefu
 * @author pfleidi
 *
 */

var Log4js = require('log4js')();

var LOGFILE = __dirname + '/log/magnets.log';
var LOG_LEVEL = 'INFO';

Log4js.addAppender(Log4js.fileAppender(LOGFILE), 'magnets');

var log = Log4js.getLogger('magnets');
log.setLevel(LOG_LEVEL);

var context = {
  log: log
};

var scheduler = require('./lib/scheduler').createScheduler(context);

/* Process Logging */

process.on('SIGINT', function () {
    log.info('Got SIGINT. Exiting ...');
    process.exit(0);
  });

process.on('uncaughtException', function (err) {
    log.fatal('RUNTIME ERROR! :' + err.stack);
  });

/*
 * main function.
 * magnets is started here
 */
(function main() {
    scheduler.schedule();
  }());
