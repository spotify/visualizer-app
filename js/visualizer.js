require([
  '$api/models',
  '$api/audio',
//  -- Add visualizations below
  'visualizations/waveform',
  'visualizations/multiband',
  'visualizations/multiband2',
  'visualizations/globe',
  'visualizations/boids/simple'
//  'visualizations/sample'
], function (models, audio) {
  'use strict';

  var
    bands     = audio.BAND31,
    num_bands = bands.length,
    ww,
    wh,
    screen,
    analyzer,
    audio_event_handlers,
    visualizations = [],
    running = [0];

  // Get a list of all visualization objects
  for (var i = 2; i < arguments.length; i++) {
    if (arguments[i].type === 'visualization') {
      visualizations.push(arguments[i]);
    }
  }

  // Figure out the current running visualization
  if (localStorage['vz.running']) {
    running = localStorage['vz.running'].split(',').map(function (i) { return parseInt(i); });
  }

  /**
   * Visualization Toolbar
   * @type {{id: string, node: null, init: Function}}
   */
  var toolbar = {
    id: 'vz-toolbar',
    node: null,
    isVisible: true,
    canHide: true,
    /**
     * Initialize the toolbar
     */
    init: function () {
      var self = this;
      self.node = document.getElementById(this.id);
      var vz_select = document.getElementById('vz-select'),
        option, i, r;

      for (i = 0; i < visualizations.length; i++) {
        option = document.createElement('option');
        option.value = i;
        option.innerText = visualizations[i].name;
        for (r = 0; r < running.length; r++) {
          if (i === running[r]) {
            option.selected = true;
            stopAll();
            start(i);
          }
        }
        vz_select.appendChild(option);
      }

      vz_select.addEventListener('change', function (event) {
        stopAll();
        for (var o = 0; o < event.target.selectedOptions.length; o++) {
          start(event.target.selectedOptions[o].value);
        }
      });

      self.node.addEventListener('mouseover', function(event) {
        self.canHide = false;
        self.show();
      });

      self.node.addEventListener('mouseout', function (event) {
        self.canHide = true;
      });
    },
    show: function() {
      this.node.classList.remove('hidden');
      this.isVisible = true;
    },
    hide: function() {
      if (!this.canHide) return;
      this.node.classList.add('hidden');
      this.isVisible = false;
    }
  };

  /**
   * Assign a color to a band given a frequency
   * @param frequency
   * @returns {string} color
   */
  function colorize(frequency) {
    var s = Math.log(frequency - 19) / Math.log(22500 - 19);
    var w = (1 - s) * 370 + 380;

    // wave length to RGB
    var r, g, b;
    if (w >= 380 && w < 440) {
      r = -(w - 440.) / (440. - 380.); g = 0.0; b = 1.0;
    } else if(w >= 440 && w < 490) {
      r = 0.0; g = (w - 440.) / (490. - 440.); b = 1.0;
    } else if(w >= 490 && w < 510) {
      r = 0.0; g = 1.0; b = -(w - 510.) / (510. - 490.);
    } else if(w >= 510 && w < 580) {
      r = (w - 510.) / (580. - 510.); g = 1.0; b = 0.0;
    } else if(w >= 580 && w < 645) {
      r = 1.0; g = -(w - 645.) / (645. - 580.); b = 0.0;
    } else if(w >= 645 && w <= 750) {
      r = 1.0; g = 0.0; b = 0.0;
    } else {
      r = 0.0; g = 0.0; b = 0.0;
    }
    r = Math.floor(r * 255).toString(16);
    g = Math.floor(g * 255).toString(16);
    b = Math.floor(b * 255).toString(16);
    if (r.length == 1) r = '0' + r;
    if (g.length == 1) g = '0' + g;
    if (b.length == 1) b = '0' + b;
    return '#' + r + g + b;
  }

  /**
   * Get the current window innerWidth and innerHeight
   * @returns {Array} [width, height]
   */
  function getScreenSize() {
    ww = window.innerWidth;
    wh = window.innerHeight;

    return [ww, wh]
  }

  /**
   * Resize running visualizations
   */
  function resize() {
    getScreenSize();

    for (var i in running) {
      visualizations[running[i]].resize(ww, wh);
    }
  }

  /**
   * Stop all running visualizations
   */
  function stopAll() {
    var to_stop = running;
    running = [];

    localStorage['vz.running'] = running.join(',');

    for (var i in to_stop) {
      visualizations[to_stop[i]].stop();
    }
  }

  /**
   * Start visualization at given index
   * @param i the visualization index
   */
  function start(i) {
    if (!(i in running)) running.push(i);
    localStorage['vz.running'] = running.join(',');

    visualizations[i].start({
      bands: bands,
      screen: screen,
      width: ww,
      height: wh
    });
  }

  /**
   * Fade in the visualization at given index
   * @param i the visualization index
   */
  function fadeIn(i) {
    if (!(i in running)) running.push(i);
    localStorage['vz.running'] = running.join(',');

    visualizations[i].fadeIn({
      bands: bands,
      screen: screen,
      width: ww,
      height: wh
    });
  }

  /**
   * Initialize the Visualizer
   */
  function init() {
    screen = document.getElementById('vz-screen');

    resize();
    toolbar.init();

    analyzer = audio.RealtimeAnalyzer.forPlayer(models.player, bands);
    analyzer.addEventListener("audio", audio_event_handlers.audio);
    analyzer.addEventListener("pause", audio_event_handlers.pause);
    analyzer.addEventListener("reset", audio_event_handlers.reset);

    window.addEventListener('resize', resize, false);
    window.addEventListener('orientationchange', resize, false);
  }

  audio_event_handlers = {
    audio: function (event) {
      if (toolbar.isVisible) {
        toolbar.hide();
      }
      for (var i in running) {
        visualizations[running[i]].audio.audio(event);
      }
      return true;
    },
    pause: function (event) {
      toolbar.show();
      for (var i in running) {
        visualizations[running[i]].audio.pause(event);
      }
      return true;
    },
    reset: function (event) {
      for (var i in running) {
        visualizations[running[i]].audio.reset(event);
      }
      return true;
    }
  };

  exports.init     = init;
  exports.resize   = resize;
  exports.stopAll  = stopAll;
  exports.colorize = colorize;
  exports.visualizations = visualizations;
  exports.running  = running;
});
