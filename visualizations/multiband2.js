'use strict';

/**
 * @namespace
 * @type {Object} Visualization object
 */
var vz = {
  name      : 'Bars 2 - Simple canvas',
  type      : 'visualization',
  tags      : ['canvas', '2d'],
  screen    : null,
  canvas    : null,
  ctx       : null,
  width     : 0,
  height    : 0,
  bands     : [],
  band_count: 0,
  ww        : 0,
  wh        : 0,
  ch        : 0,
  cw        : 0,
  hc        : 0,
  vc        : 0,
  nP        : 0,
  amp       : 96,
  gap       : 1,
  opacity   : 0.5,
  initialized: false,
  options: {

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

  var d = new Date(),
    t = d.getTime();

  vz.ctx.clearRect(0, 0, vz.cw, vz.ch); // clear canvas

  if (t % 1 === 0) {
    var x, xl, xr, dxl, dxr;
    var y, yl, yr, dyl, dyr;
    var w, wl, wr;
    var h, hl, hr;
    var i, b, l, r;

    vz.ctx.globalAlpha = vz.opacity; //(t % 10) * 0.1;


    x = 0;
    y = vz.hc;
    hl = hr = 0;
    w = (vz.cw - vz.band_count * vz.gap) / vz.band_count; // width of bar

    for (i = 0; i < vz.band_count; i++) {
      b = vz.bands[i];
      l = parseFloat(audio.spectrum.left[i]);
      r = parseFloat(audio.spectrum.right[i]);

      hl = (vz.amp + l) * (vz.ch / 2 - 50) / vz.amp;
      hr = (vz.amp + r) * (vz.ch / 2 - 50) / vz.amp;

      dxl = x + (w * i) + i;
      dyl = y - hl;
      dxr = x + (w * i) + i;
      dyr = y;

      //left
      vz.ctx.fillStyle = Visualizer.colorize(vz.bands[i]);
      vz.ctx.fillRect(dxl, dyl - 0.5, w, hl);

      // right
      vz.ctx.fillStyle = Visualizer.colorize(vz.bands[i]);
      vz.ctx.fillRect(dxr, dyr + 0.5, w, hr);
    }
  }

  if (t % 1 === 0) {
    vz.ctx.strokeStyle = 'rgb(255,255,255)';

    // left
    vz.drawPath(audio.spectrum, -280, 0);
    vz.drawPath(audio.spectrum, -180, 0);
    vz.drawPath(audio.spectrum, -100, 0);
    vz.drawPath(audio.spectrum, -10, 0);
    vz.drawPath(audio.spectrum, 0, 0);
    vz.drawPath(audio.spectrum, 10, 0);
    vz.drawPath(audio.spectrum, 20, 0);
    vz.drawPath(audio.spectrum, 30, 0);
    vz.drawPath(audio.spectrum, 40, 0);

    // right
    vz.drawPath(audio.spectrum, -280, 1);
    vz.drawPath(audio.spectrum, -180, 1);
    vz.drawPath(audio.spectrum, -100, 1);
    vz.drawPath(audio.spectrum, -10, 1);
    vz.drawPath(audio.spectrum, 0, 1);
    vz.drawPath(audio.spectrum, 10, 1);
    vz.drawPath(audio.spectrum, 20, 1);
    vz.drawPath(audio.spectrum, 30, 1);
    vz.drawPath(audio.spectrum, 40, 1);
  }
};

/**
 * Start visualization
 * @param options
 */
vz.start = function (options) {
  vz.screen = options.screen;
  vz.ww = options.width;
  vz.wh = options.height;

  vz.canvas = document.createElement('canvas');

  vz.screen.appendChild(vz.canvas);

//  cv.webkitRequestFullScreen();
//    document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)

  vz.cw = vz.ww - 20;
  vz.ch = vz.wh - 20;
  vz.hc = vz.ch / 2; // vertical center
  vz.vc = vz.cw / 2; // horizontal center
  vz.canvas.width = vz.cw;
  vz.canvas.height = vz.ch;

  vz.bands = options.bands;
  vz.band_count = vz.bands.length;
  vz.nP = vz.cw / vz.band_count;

  vz.ctx = vz.canvas.getContext('2d');
  vz.ctx.globalCompositeOperation = 'destination-over';

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

  function decrementalpha() {
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

  vz.ww = width;
  vz.wh = height;

  vz.cw = vz.ww - 20;
  vz.ch = vz.wh - 20;
  vz.hc = vz.ch / 2; // vertical center
  vz.vc = vz.cw / 2; // horizontal center
  vz.canvas.width = vz.cw;
  vz.canvas.height = vz.ch;
};

/**
 * Make some lines
 * @param s
 * @param offset
 * @param lr
 */
vz.drawPath = function (s, offset, lr) {
  var y, rh, lh, i, b, l, r;

  vz.ctx.beginPath();
  vz.ctx.moveTo(0, vz.hc);

  for (i = 0; i < vz.band_count; i++) {
    b = vz.bands[i];
    l = parseFloat(s.left[i]);
    r = parseFloat(s.right[i]);
//        ctx.strokeStyle = spectrum.color(_options.bands[i]);
    if (lr) {
      // right
      y = vz.hc + ((vz.amp + r) * (vz.ch / 2 - 50) / vz.amp) + offset;
      y = y > vz.hc ? y : vz.hc;
      vz.ctx.lineTo(i * vz.nP, y);
      vz.ctx.lineTo(i * vz.nP + vz.nP, y);
    } else {
      // left
      y = vz.hc - ((vz.amp + l) * (vz.ch / 2 - 50) / vz.amp) - offset;
      y = y < vz.hc ? y : vz.hc;
      vz.ctx.lineTo(i * vz.nP, y);
      vz.ctx.lineTo(i * vz.nP + vz.nP, y);
    }
  }

  vz.ctx.lineTo(vz.cw, vz.hc);
  vz.ctx.stroke();
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
