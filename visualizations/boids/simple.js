require([
  'visualizations/boids/vector2d#Vector',
  'visualizations/boids/boid#Boid'
], function (Vector, Boid) {
  'use strict';

  /**
   * @namespace
   * @type {Object} Visualization object
   */
  var vz = {
    name       : 'Boids Test',
    type       : 'visualization',
    tags       : ['canvas', '2d'],
    screen     : null,
    canvas     : null,
    ctx        : null,
    swarm      : null,
    width      : 0,
    height     : 0,
    bands      : [],
    band_count : 0,
    initialized: false,
    BOID_RADIUS       : 3,
    SHOW_BOID_HEADING : true,
    BOID_COUNT        : 62,
    MAX_SPEED         : 20,
    RUNNING           : false,
    ADJUSTMENT_MULTIPLIER : 0.15,
    SEPARATION            : 1,
    SEPARATION_DISTANCE   : 10, // times the radius
    ALIGNMENT             : 1.0,
    COHESION              : 1.0,
    AVOIDANCE             : 100000000.0,
    VISIBILITY            : 30,
    CompositeOperation    : 'source-over',
    decay                 : 0.2,
    avg                   : {},
//  DEBUG : true,
//  DEBUG_COUNT : 0,
    options: {

    },
    audio: {
      audio: function (event) {
        vz.redraw(event.audio);
        return true;
      },
      pause: function (event) {
        vz.RUNNING = false;
        return true;
      },
      reset: function (event) {
        vz.RUNNING = false;
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

    if (!vz.RUNNING) {
      vz.RUNNING = true;
      vz.animate();
    }


    var i, l = 0, r = 0;
    for (i = 0; i < vz.band_count; i++) {
      l += vz.swarm.boids.left[i].audio = (audio.spectrum.left[i] + 96) || 1;
      r += vz.swarm.boids.right[i].audio = (audio.spectrum.right[i] + 96) || 1;
    }

    vz.avg.left = l / vz.band_count;
    vz.avg.right = r / vz.band_count;

    var avg = (vz.avg.left + vz.avg.right) / 2;

    vz.decay = avg * 0.002;

//    console.log('vz.decay', vz.decay);
  };

  vz.animate = function () {
    if (!vz.RUNNING === true) return;
    requestAnimationFrame(vz.animate);

    vz.ctx.globalCompositeOperation = vz.CompositeOperation;

    vz.swarm.run();

//    function clearbg() {
//      vz.cleartimeout = null;
//      vz.ctx_visible.clearRect(0, 0, vz.width, vz.height);
//    }
//
//    if (!vz.cleartimeout) {
//      vz.cleartimeout = window.setTimeout(clearbg, 500);
//    }

////    var old = vz.ctx_visible.fillStyle;
    vz.ctx_visible.fillStyle = "rgba(0,0,0," + vz.decay + ")";
    vz.ctx_visible.fillRect(0, 0, vz.width, vz.height);
////    vz.ctx_visible.fillStyle = old;
//    vz.ctx_visible.beginPath();
    vz.ctx_visible.drawImage(vz.buffer, 0, 0);
  };

  /**
   * Start visualization
   * @param options
   */
  vz.start = function (options) {
    vz.bands         = options.bands;
    vz.band_count    = vz.bands.length;
    vz.screen        = options.screen;
    vz.buffer        = document.createElement('canvas');
    vz.canvas        = document.createElement('canvas');
    vz.buffer.width  = vz.canvas.width  = vz.width  = options.width;
    vz.buffer.height = vz.canvas.height = vz.height = options.height;
    vz.screen.appendChild(vz.canvas);

    vz.ctx = vz.buffer.getContext('2d');
    vz.ctx_visible = vz.canvas.getContext('2d');
//    vz.ctx_visible.globalCompositeOperation = 'source-over';
//    vz.ctx.globalCompositeOperation = 'lighter';
//    vz.ctx_visible.globalCompositeOperation = "lighter";
    vz.ctx.globalAlpha = 1;

    vz.ctx.clearRect(0, 0, vz.canvas.width, vz.canvas.height);
    vz.ctx.fillStyle = 'rgb(190,245,127)';
    vz.ctx.strokeStyle = 'rgb(60,145,225)';
    vz.ctx.translate(0, vz.canvas.height);
    vz.ctx.scale(1, -1);

    vz.swarm = new Swarm(vz.bands);

    vz.initialized = true;
  };

  /**
   * Stop visualization
   */
  vz.stop = function () {
    if (!vz.initialized) return;
    vz.ctx.clearRect(0, 0, vz.canvas.width, vz.canvas.height);
    vz.screen.removeChild(vz.canvas);
    vz.canvas = null;
    vz.ctx = null;

    vz.RUNNING = false;
    vz.initialized = false;
  };

  /**
   * Start visualization fading in
   * @param options
   */
  vz.fadeIn = function (options) {
    vz.start(options);
    vz.ctx.globalAlpha = 0.0;

    function incrementalpha () {
      if (vz.ctx.globalAlpha < 1) {
        vz.ctx.globalAlpha += 0.1;
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

  function Swarm(bands) {
//    this.size = n;
    this.width = vz.canvas.width;
    this.height = vz.canvas.height;

    this.boids = {left: [], right: []};

    for (var i = 0; i < vz.band_count; i++) {
      this.boids.left.push(Boid.randomBoid({
        x: this.width,
        y: this.height,
        heading_multiplier: vz.MAX_SPEED,
        ctx: vz.ctx,
        radius: vz.BOID_RADIUS,
        max_speed: vz.MAX_SPEED,
        show_heading: vz.SHOW_BOID_HEADING,
        adjustment_multiplier: vz.ADJUSTMENT_MULTIPLIER,
        color: Visualizer.colorize(bands[i]),
        band: vz.bands[i]
      }));

      this.boids.right.push(Boid.randomBoid({
        x: this.width,
        y: this.height,
        heading_multiplier: vz.MAX_SPEED,
        ctx: vz.ctx,
        radius: vz.BOID_RADIUS,
        max_speed: vz.MAX_SPEED,
        show_heading: vz.SHOW_BOID_HEADING,
        adjustment_multiplier: vz.ADJUSTMENT_MULTIPLIER,
        color: Visualizer.colorize(bands[i]),
        band: vz.bands[i]
      }));
    }
  }

  Swarm.prototype.run = function() {
    vz.ctx.clearRect(0, 0, vz.canvas.width, vz.canvas.height);
    this.drawAll();
    this.advance();
    this.flipAll();
  };
  Swarm.prototype.drawAll = function() {
    var temp = [], temp2 = [], i;
    for (i = 0; i < vz.band_count; i++) { temp[i] = i; }

    for (i = 0; i < vz.band_count-1; i++ ) {
      // The following line removes one random element from arr
      // and pushes it onto tempArr
      temp2.push(temp.splice(Math.floor(Math.random()*temp.length),1)[0]);
    }

    temp2.push(temp[0]);

    for (i = 0; i < temp2.length; i++) {
      this.boids.left[temp2[i]].draw();
      this.boids.right[temp2[i]].draw();
    }
  };
  Swarm.prototype.flipAll = function() {
    this.boids.left.forEach(function(boid) {
      boid.flip();
    });
    this.boids.right.forEach(function(boid) {
      boid.flip();
    });
  };
  Swarm.prototype.advance = function() {
    for (var i in this.boids.left) {
      this.advanceBoid(this.boids.left[i]);
    }
    for (var i in this.boids.right) {
      this.advanceBoid(this.boids.right[i]);
    }
  };

  Swarm.prototype.advanceBoid = function(boid) {
    var visible = this.boids.left.filter(function(b) {
      return boid.position.distanceTo(b.position) <= vz.VISIBILITY && boid !== b;
    });

    visible.concat(this.boids.right.filter(function(b) {
      return boid.position.distanceTo(b.position) <= vz.VISIBILITY && boid !== b;
    }));

    //debug(visible);

    // Cohesion
    if (visible.length > 0) {
      var cohAvgPos = visible.reduce(function(prev, next) {
        var pt = next.position.asCartesian();
        return {
          x: prev.x + (pt.x / visible.length),
          y: prev.y + (pt.y / visible.length)
        };
      }, {x: null, y: null});
      boid.adjustHeading(
        boid.position.vectorTo(cohAvgPos)
          .scaledBy(vz.COHESION)
      );
    }

    // Alignment
    if (visible.length > 0) {
      var alignAvgVector = visible.reduce(function(prev, next) {
        return prev.addVector(next.heading);
      }, new Vector(0, 0));
      boid.adjustHeading(
        alignAvgVector
          .scaledBy(vz.ALIGNMENT)
      );
    }

    // Separation
    // TODO: Magnitude of the effect should be inversely proportional to distance
    var tooClose = visible.filter(function(b) {
      return boid.position.distanceTo(b.position) <= b.radius * vz.SEPARATION_DISTANCE;
    });

    if (tooClose.length > 0) {
      var sepAvgPos = tooClose.reduce(function(prev, next) {
        var pt = next.position.asCartesian();
        return {
          x: prev.x + (pt.x / tooClose.length),
          y: prev.y + (pt.y / tooClose.length)
        };
      }, {x: null, y: null});
      boid.adjustHeading(
        boid.position.vectorTo(sepAvgPos)
          .scaledBy(-1)
          .scaledBy(vz.SEPARATION)
      );
    }

    // Avoidance
    var boidPt = boid.position.asCartesian();

    if (boidPt.x < vz.VISIBILITY || boidPt.x > (this.width - vz.VISIBILITY)) {
      boid.adjustHeading(
        boid.position.vectorTo(Vector.fromCartesian({
          x: this.width / 2,
          y: boidPt.y
        }))
          .scaledBy(vz.AVOIDANCE)
      );
    }

    if (boidPt.y < vz.VISIBILITY || boidPt.y > (this.height - vz.VISIBILITY)) {
      boid.adjustHeading(
        boid.position.vectorTo(Vector.fromCartesian({
          x: boidPt.x,
          y: this.height / 2
        }))
          .scaledBy(vz.AVOIDANCE)
      );
    }

  };


// Export API
  exports.vz      = vz;
  exports.name    = vz.name;
  exports.type    = vz.type;
  exports.start   = vz.start;
  exports.stop    = vz.stop;
  exports.fadeIn  = vz.fadeIn;
  exports.fadeOut = vz.fadeOut;
  exports.resize  = vz.resize;
  exports.audio   = vz.audio;

});

