/*!
 * webworker to download images
 *
 * @author pfleidi
 */


exports.createDownloader = function createDownloader(context) {
  var queue = [];

  function addDownloads(images) {
    queue = queue.concat(images);
  };

  (function schedule() {
      console.log('schedule');
      queue.forEach(function (image) {
          //TODO: Implement this
          console.log('Would download: ');
          console.dir(image);
        });
      setTimeout(schedule, 300);
    }());

  return {
    addDownloads: addDownloads
  };

};
