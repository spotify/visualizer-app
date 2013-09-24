'use strict';

/**
 * @namespace
 * @type {Object} Visualization object
 */
var vz = {
  name      : 'Wave - Simple',
  type      : 'visualization',
  tags      : ['canvas', '2d'],
  screen    : null,
  canvas    : null,
  ctx       : null,
  width     : 0,
  height    : 0,
  bands     : [],
  band_count: 0,
  initialized: false,
  options: {
    wave_color_left: 'blue',
    wave_color_right: 'green'
  },
  audio: {
    audio: function (event) {
      vz.redraw(event.audio);
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
vz.redraw = function (audio) {
  if (!vz.initialized) return;

  var x, y, i, l,
    min = 100,
    max = -100;

  vz.ctx.clearRect(0, 0, vz.width, vz.height);
  vz.ctx.beginPath();
  vz.ctx.moveTo(0, vz.height / 2);

  vz.ctx.strokeStyle = vz.options.wave_color_left;

//  console.log('audio', audio);

  for (i = 0, l = audio.wave.left.length; i < l; i++) {
    x = vz.width / l * i;
    y = (1 - audio.wave.left[i]) / 2 * vz.height;
    vz.ctx.lineTo(x, y);
  }

  vz.ctx.stroke();
  vz.ctx.beginPath();
  vz.ctx.strokeStyle = vz.options.wave_color_right;

  for (i = 0, l = audio.wave.right.length; i < l; i++) {
    x = vz.width / l * i;
    y = (1 + audio.wave.right[i]) / 2 * vz.height;
    vz.ctx.lineTo(x, y);
  }

  vz.ctx.stroke();
};

/**
 * Start visualization
 * @param options
 */
vz.start = function (options) {
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
