'use strict';

/**
 * @namespace
 * @type {Object} Visualization object
 */
var vz = {
  name      : 'Bars 1 - Raphael',
  type      : 'visualization',
  tags      : ['canvas', '2d'],
  screen    : null,
  containerl: null,
  containerr: null,
  bands     : [],
  num_bands : 0,
  range     : 100,
  bw        : 0,
  bh        : 0,
  gapw      : 0,
  gaph      : 0,
  width     : 0,
  height    : 0,
  paperl    : 0,
  paperr    : 0,
  bandl     : [],
  bandr     : [],
  peakl     : [],
  peakr     : [],
  band_fade : 500,
  peak_fade : 500,
  initialized: false,
  options: {

  },
  audio: {
    audio: function (event) {
      vz.redraw(vz.bandl, vz.peakl, event.audio.spectrum.left);
      vz.redraw(vz.bandr, vz.peakr, event.audio.spectrum.right);
      return true;
    },
    pause: function (event) {
      vz.fadeDown(vz.bandl);
      vz.fadeDown(vz.bandr);
      return true;
    },
    reset: function (event) {
      return true;
    }
  }
};

/**
 * Redraw Visualization
 * @param band
 * @param peak
 * @param data
 */
vz.redraw = function (band, peak, data) {
  if (!vz.initialized) return;

  var db, i, l, y, h, anim, green;

  for (i = 0; i < vz.num_bands; i++) {
    db = data[i];
    l = Math.max(Math.min(Math.floor(db + 60), 72), 0) / 72 * vz.range;
    h = l * vz.bh;
    y = vz.bh + vz.height - h;

    // dynamic gradient
    // green = Math.ceil(l / 72 * 127 + 128).toString(16);
    // if (green.length == 1) green = '0' + green;
    // band[i].attr('fill', '90-black-#00' + green.toString(16) + '00');

    // band[i].attr('height', h);
    // band[i].attr('y', y);
    band[i].animate(Raphael.animation({height: h, y: y}, 10));

    // new peak
    if (l >= 1 && (peak[i].attrs.y > y - vz.bh || peak[i].attrs.opacity === 0.0)) {
      peak[i].attr('y', y - vz.bh);
      peak[i].attr('opacity', 1.0);
      peak[i].show();
      anim = Raphael.animation({opacity: 0.0}, vz.peak_fade, 'easeIn');
      // peak[i].animate(anim.delay(peak_hold));
      peak[i].animate(anim);
    }
  }
};

/**
 * Start visualization
 * @param options
 */
vz.start = function (options) {
  vz.bands = options.bands;
  vz.num_bands = vz.bands.length;
  vz.screen = options.screen;

  vz.bw = Math.floor(options.width / 2 / vz.num_bands);
  vz.bh = Math.floor(options.height / (vz.range + 2));
  vz.gapw = options.width - vz.bw * vz.num_bands * 2;
  vz.gaph = options.height - vz.bh * (vz.range + 2);

  vz.width = vz.num_bands * vz.bw;
  vz.height = vz.range * vz.bh;

  vz.containerl = document.createElement('div');
  vz.containerl.style.width  = (options.width / 2) + 'px';
  vz.containerl.style.height = options.height + 'px';
  vz.containerl.style.position = 'absolute';
  vz.containerl.style.top = vz.gaph + 'px';
  vz.containerl.style.left = 0;
  vz.screen.appendChild(vz.containerl);

  vz.containerr = document.createElement('div');
  vz.containerr.style.width  = (options.width / 2) + 'px';
  vz.containerr.style.height = options.height + 'px';
  vz.containerr.style.position = 'absolute';
  vz.containerr.style.top = vz.gaph + 'px';
  vz.containerr.style.right = 0;
  vz.screen.appendChild(vz.containerr);

  vz.paperl = Raphael(vz.containerl, vz.width, vz.height + vz.bh + vz.bh);
  vz.paperr = Raphael(vz.containerr, vz.width, vz.height + vz.bh + vz.bh);

  vz.init(vz.paperl, vz.bandl, vz.peakl);
  vz.init(vz.paperr, vz.bandr, vz.peakr);

  vz.initialized = true;
};

/**
 * Stop visualization
 */
vz.stop = function () {
  if (!vz.initialized) return;

  var countl = 0, countr = 0;

  vz.fadeDown(vz.bandl, function () {
    countl++;
    if (countl === vz.bandl.length) {
      vz.paperl.remove();
      vz.bandl = [];
      vz.peakl = [];
    }
  });

  vz.fadeDown(vz.bandr, function () {
    countr++;
    if (countr === vz.bandr.length) {
      vz.paperr.remove();
      vz.bandr = [];
      vz.peakr = [];
    }
  });

  vz.screen.removeChild(vz.containerl);
  vz.screen.removeChild(vz.containerr);

  vz.initialized = false;
};

/**
 * Start visualization fading in
 * @param options
 */
vz.fadeIn = function (options, step) {
  vz.start(options);
//  vz.ctx.globalAlpha = 0.0;
//
//  step = step || 0.03;
//
//  function incrementalpha () {
//    if (1 - vz.ctx.globalAlpha <= step || vz.ctx.globalAlpha >= 1.0) {
//      vz.ctx.globalAlpha = 1;
//    } else {
//      vz.ctx.globalAlpha += step;
//      window.setTimeout(incrementalpha, 100);
//    }
//  }
//
//  incrementalpha();
};

/**
 * Stop visualization fading out
 */
vz.fadeOut = function (step) {
  if (!vz.initialized) return;

  vz.stop();

//  step = step || 0.03;
//
//  function decrementalpha () {
//    if (vz.ctx.globalAlpha <= step || vz.ctx.globalAlpha >= 0) {
//      vz.ctx.globalAlpha = 0;
//      vz.stop();
//    } else {
//      vz.ctx.globalAlpha -= step;
//      window.setTimeout(decrementalpha, 100);
//    }
//  }
//
//  decrementalpha();
};

vz.fadeDown = function (band, callback) {
  var anim, i;
  for (i = 0; i < vz.num_bands; i++) {
    anim = Raphael.animation({height: 0, y: vz.height + vz.bh}, vz.band_fade, 'easeIn', callback);
    band[i].animate(anim);
  }
};

/**
 * Resize the visualization
 * @param width
 * @param height
 */
vz.resize = function (width, height) {
  if (!vz.initialized) return;

  vz.containerl.style.width  = (width / 2) + 'px';
  vz.containerl.style.height = height + 'px';
  vz.containerr.style.width  = (width / 2) + 'px';
  vz.containerr.style.height = height + 'px';

  vz.bw = Math.floor(width / 2 / vz.num_bands);
  vz.bh = Math.floor(height / (vz.range + 2));
  vz.gapw = width - vz.bw * vz.num_bands * 2;
  vz.gaph = height - vz.bh * (vz.range + 2);

  vz.width  = vz.num_bands * vz.bw;
  vz.height = vz.range * vz.bh;

  vz.paperl = Raphael(vz.containerl, vz.width, vz.height + vz.bh + vz.bh);
  vz.paperr = Raphael(vz.containerr, vz.width, vz.height + vz.bh + vz.bh);
};

/**
 * Initialize paper
 * @param paper
 * @param band
 * @param peak
 */
vz.init = function (paper, band, peak) {
  // blue bar at the bottom
  var i, base, rect;

  base = paper.rect(i * vz.bw, vz.height + vz.bh, vz.width, vz.bh);
  base.attr('fill', '#0000ff');
  base.attr('stroke-width', 0);

  for (i = 0; i < vz.num_bands; i++) {
    // horizontal bar
    rect = paper.rect(i * vz.bw, vz.height + vz.bh, vz.bw, 0);
    // gradient
    // rect.attr('fill', '90-#002000-#00ff00');
    // rect.attr('fill', '90-#202020-' + colorize(bands[i]));
    rect.attr('fill', Visualizer.colorize(vz.bands[i]));
    // solid color
    // rect.attr('fill', '#00ff00');
    // rect.attr('stroke-width', 0);
    band.push(rect);

    // peak indicator
    rect = paper.rect(i * vz.bw, vz.height + vz.bh, vz.bw, vz.bh);
    rect.attr('fill', '#ff0000');
    // rect.attr('stroke-width', 0);
    rect.attr('opacity', 0.0);
    peak.push(rect);
  }
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
