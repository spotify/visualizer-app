/**
 * todo: pass visualizer to visualizations that we don't add it to the global namespace
 */
var Visualizer;

require('js/visualizer', function (vz) {
  'use strict';

  Visualizer = vz;

  if (document.readyState === "complete") {
    vz.init();
  } else {
    window.addEventListener("load", vz.init, false);
  }
});



