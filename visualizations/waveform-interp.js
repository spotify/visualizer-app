'use strict';

/**
 * @namespace
 * @type {Object} Visualization object
 */
var vz = {
  name      : 'Wave - Interpolated',
  type      : 'visualization',
  tags      : ['canvas', '2d'],
  screen    : null,
  canvas    : null,
  ctx       : null,
  width     : 0,
  height    : 0,
  targetbanddata  : [[],[]],
  deltabanddata  : [[],[]],
  banddata  : [[],[]],
  bands     : [],
  band_count: 0,
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
  /*
  if (!vz.initialized) return;
*/
  var x, y, i, l,
    min = 100,
    max = -100;

  for (i = 0, l = audio.wave.left.length; i < l; i++) {
    vz.targetbanddata[0][i] = audio.wave.left[i];
    vz.targetbanddata[1][i] = audio.wave.right[i];
  }

  if (vz.banddata[0].length == 0) vz.banddata[0] = vz.targetbanddata[0].map(function(x) {return 0;});
  if (vz.banddata[1].length == 0) vz.banddata[1] = vz.targetbanddata[1].map(function(x) {return 0;});

  if (vz.deltabanddata[0].length == 0) vz.deltabanddata[0] = vz.targetbanddata[0].map(function(x) {return 0;});
  if (vz.deltabanddata[1].length == 0) vz.deltabanddata[1] = vz.targetbanddata[1].map(function(x) {return 0;});
};

/**
 * Redraw Visualization
 * @param audio
 */
vz.draw = function () {
  if (!vz.initialized) return;

  var x, y, i, l, b, v,
    min = 100,
    max = -100;

  // vz.ctx.clearRect(0, 0, vz.width, vz.height);

  vz.ctx.fillStyle = '#121';
  vz.ctx.fillRect(0, 0, vz.width, vz.height);

  var lingrad = vz.ctx.createRadialGradient(vz.width/2, vz.height/2, 0, vz.width/2, vz.height/2, Math.max(vz.width, vz.height));
  lingrad.addColorStop(0, '#306838');
  lingrad.addColorStop(1, '#103818');
  vz.ctx.fillStyle = lingrad;
  vz.ctx.fillRect(0, 0, vz.width, vz.height);
  vz.ctx.fillStyle = null;

  // Draw lines in the background to show real rendering speed
  vz.ctx.beginPath();
    vz.ctx.strokeStyle = 'rgba(30,150,20,0.5)';
  vz.ctx.lineWidth = 0.5;
  for(var g=-20; g<=20; g++) {
    var o = g * 70;
    vz.ctx.moveTo(0, Math.round(vz.height/2 + o) + 0.5);
    vz.ctx.lineTo(vz.width, Math.round(vz.height/2 + o) + 0.5);
    vz.ctx.moveTo(Math.round(vz.width/2 + o)+0.5, 0);
    vz.ctx.lineTo(Math.round(vz.width/2 + o)+0.5, vz.height);
  }
  vz.ctx.stroke();

  var basey = [vz.height * 1 / 4, vz.height * 3 / 4];

  function clipsample(b,t) {
    if (t < 0)
      t = 0;
    if (t >= vz.banddata[b].length)
      t = vz.banddata[b].length-1;
    return vz.banddata[b][t];
  }

  function smoothedsample(b,t) {
    var s0 = clipsample(b, t-2);
    var s1 = clipsample(b, t-1);
    var s2 = clipsample(b, t);
    var s3 = clipsample(b, t+1);
    var s4 = clipsample(b, t+2);
    return s2 * 0.6 + 0.3 * (s1+s3)/2.0 + 0.1 * (s0 + s4) / 2.0;
  }

  for (b = 0; b < 2; b++) {
    // Draw outer "glow"
    vz.ctx.beginPath();
    vz.ctx.strokeStyle = 'rgba(10,200,10,0.5)';
    vz.ctx.lineWidth = 6;
    l = vz.banddata[b].length;
    for (i = 0; i <= l; i++) {
      x = vz.width / l * i;
      v = smoothedsample(b, i);
      y = v * vz.height / 5;
      if (i == 0)
        vz.ctx.moveTo(x, y + basey[b]);
      else
        vz.ctx.lineTo(x, y + basey[b]);
    } 
    vz.ctx.stroke();

    // Draw inner sharp line
    vz.ctx.beginPath();
    vz.ctx.strokeStyle = 'rgba(90,250,80,0.8)';
    vz.ctx.lineWidth = 1;
    l = vz.banddata[b].length;
    for (i = 0; i <= l; i++) {
      x = vz.width / l * i;
      v = smoothedsample(b, i);
      y = v * vz.height / 5;
      if (i == 0)
        vz.ctx.moveTo(x, y + basey[b]);
      else
        vz.ctx.lineTo(x, y + basey[b]);
    } 
    vz.ctx.stroke();

    // Interpolate and bounce the values a bit
    for (i = 0; i < l; i++) {
      vz.deltabanddata[b][i] *= 0.33;
      vz.deltabanddata[b][i] += (vz.targetbanddata[b][i] - vz.banddata[b][i]) * 0.9;
      vz.banddata[b][i] += vz.deltabanddata[b][i] * 0.7;
    }
  }
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


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
  // vz.ctx.globalCompositeOperation = 'destination-over';
  // vz.ctx.globalAlpha = 1;

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
