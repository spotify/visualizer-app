'use strict';

require('visualizations/beatdetection-helper', function(helperfile) {

  /**
   * @namespace
   * @type {Object} Visualization object
   */
  var vz = {
    name      : 'Simple beat detection',
    type      : 'visualization',
    tags      : ['canvas', '2d'],
    screen    : null,
    canvas    : null,
    ctx       : null,
    width     : 0,
    height    : 0,
    helper    : null,
    initialized: false,
    options: {
      wave_color_left: 'blue',
      wave_color_right: 'green'
    },
    audio: {
      audio: function (event) {
        vz.onaudio(event.audio);
        return true;
      },
      pause: function (event) {
        return true;
      },
      reset: function (event) {
        return true;
      }
    }
  };

  /**
   * Redraw Visualization
   * @param audio
   */
  vz.onaudio = function (audio) {
    vz.helper.setData(audio.spectrum);
  };

  /**
   * Redraw Visualization
   * @param audio
   */
  vz.draw = function () {
    if (!vz.initialized) return;

    var x, y, i, l, b;

    vz.ctx.clearRect(0, 0, vz.width, vz.height);

    var maxrad = Math.min(vz.width, vz.height) * 0.15;
    var rad = maxrad * (0.5 + 0.5 * Math.sin(vz.frame / 9.0));

    function bounce(v) {
      v /= 30.0;
      v *= v;
      return Math.max(0.1, 1.0 - v);
    }

    //draw a circle
    rad = maxrad * bounce(vz.helper.low_timer);
    vz.ctx.fillStyle = '#f40';
    vz.ctx.beginPath();
  	vz.ctx.arc(vz.width*1/4, vz.height/3, rad, 0, Math.PI*2, false);
    vz.ctx.fill();

    rad = maxrad * bounce(vz.helper.mid_timer);
    vz.ctx.fillStyle = '#0f4';
    vz.ctx.beginPath();
    vz.ctx.arc(vz.width*2/4, vz.height/3, rad, 0, Math.PI*2, false);
    vz.ctx.fill();

    rad = maxrad * bounce(vz.helper.high_timer);
    vz.ctx.fillStyle = '#04f';
    vz.ctx.beginPath();
    vz.ctx.arc(vz.width*3/4, vz.height/3, rad, 0, Math.PI*2, false);
    vz.ctx.fill();


    var basey = [vz.height * 1 / 4, vz.height * 3 / 4];

    l = vz.helper.banddata[0].length;

    if (l > 0) {
      maxrad = (vz.width / l) * 0.4;
      for (i = 0; i < l; i++) {
        x = vz.width / (l + 3) * (i + 2);

        y = vz.height * 6 / 8;

        rad = Math.max(1,Math.abs(maxrad * vz.helper.banddata[0][i] / 100.0));

        vz.ctx.beginPath();
        vz.ctx.fillStyle = 'rgba(180,180,180,0.5)';
        vz.ctx.arc(x, y, rad, 0, Math.PI*2, false);
        vz.ctx.fill();

        rad = Math.max(1,Math.abs(maxrad * vz.helper.peaks[0][i] / 100.0));

        vz.ctx.beginPath();
        vz.ctx.fillStyle = null;
        vz.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        vz.ctx.lineWidth = 2.0;
        vz.ctx.arc(x, y, rad, 0, Math.PI*2, false);
        vz.ctx.stroke();
      }
    }

    vz.helper.update();
  };

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();


  /**
   * Start visualization
   * @param options
   */
  vz.start = function (options) {
    vz.helper        = new helperfile.BeatDetectionHelper();
    vz.bands         = options.bands;
    vz.band_count    = vz.bands.length;
    vz.screen        = options.screen;
    vz.canvas        = document.createElement('canvas');
    vz.canvas.width  = vz.width  = options.width;
    vz.canvas.height = vz.height = options.height;
    vz.screen.appendChild(vz.canvas);

    vz.ctx = vz.canvas.getContext('2d');
    vz.ctx.globalCompositeOperation = 'destination-over';
    vz.ctx.globalAlpha = 1;

    (function animloop() {
      if (vz.canvas) {
        requestAnimFrame(animloop);
        vz.draw();
      }
    })();

    vz.initialized = true;
  };

  /**
   * Stop visualization
   */
  vz.stop = function () {
    if (!vz.initialized) return;
    vz.screen.removeChild(vz.canvas);
    vz.canvas = null;
    vz.ctx = null;
    vz.initialized = false;
  };

  /**
   * Start visualization fading in
   * @param options
   */
  vz.fadeIn = function (options, step) {
    vz.start(options);
    vz.ctx.globalAlpha = 0.0;

    step = step || 0.03;

    function incrementalpha () {
      if (1 - vz.ctx.globalAlpha <= step || vz.ctx.globalAlpha >= 1.0) {
        vz.ctx.globalAlpha = 1;
      } else {
        vz.ctx.globalAlpha += step;
        window.setTimeout(incrementalpha, 100);
      }
    }

    incrementalpha();
  };

  /**
   * Stop visualization fading out
   */
  vz.fadeOut = function (step) {
    if (!vz.initialized) return;

    step = step || 0.03;

    function decrementalpha () {
      if (vz.ctx.globalAlpha <= step || vz.ctx.globalAlpha >= 0) {
        vz.ctx.globalAlpha = 0;
        vz.stop();
      } else {
        vz.ctx.globalAlpha -= step;
        window.setTimeout(decrementalpha, 100);
      }
    }

    decrementalpha();
  };

  /**
   * Resize the visualization
   * @param width
   * @param height
   */
  vz.resize = function (width, height) {
    if (!vz.initialized) return;
    vz.canvas.width = vz.width = width;
    vz.canvas.height = vz.height = height;
  };

  // Export API
  exports.name    = vz.name;
  exports.type    = vz.type;
  exports.tags    = vz.tags;
  exports.start   = vz.start;
  exports.stop    = vz.stop;
  exports.fadeIn  = vz.fadeIn;
  exports.fadeOut = vz.fadeOut;
  exports.resize  = vz.resize;
  exports.audio   = vz.audio;

});
