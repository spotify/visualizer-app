/**
 * Boid class borrowed from https://github.com/glesica/canvas-boids
 */

require(['visualizations/boids/vector2d#Vector'], function (Vector) {
  'use strict';

  /**
   * Boid: Represents a simulation unit.
   * @param options
   * @constructor
   *
   * Example:
   *   boids[i] = new Boid({
   *     id                   : 'boid-' + i, // identifier for the given boid (unused)
   *     ctx                  : canvas.ctx,
   *     position             : [10,20],     // position vector
   *     heading              : [30,-10],    // heading vector, should be relative to the position vector
   *     radius               : 3,
   *     max_speed            : 10,
   *     show_heading         : true,
   *     adjustment_multiplier: 0.5
   *   })
   */
  function Boid(options) {
    this.id          = options.id || null;
    this.ctx         = options.ctx;
    this.position    = options.position.copyOf();
    this.heading     = options.heading.copyOf();

    this.color       = options.color || null;
    this.radius                = options.radius || 3;
    this.max_speed             = options.max_speed || 15;
    this.band                  = options.band || 0;
    this.show_heading          = options.show_heading ? true : false;
    this.adjustment_multiplier = options.adjustment_multiplier || 0.05;

    this.adjustments = [];
    this.audio = 0;
  }

  /**
   * Factory function that creates a random boid within the given constraints
   * @param options
   * @return {Boid}
   *
   * Example:
   *   boids[i] = new Boid({
   *     id                   : 'boid-' + i, // identifier for the given boid (unused)
   *     ctx                  : canvas.ctx,
   *     heading_multiplier   : 0.45
   *     radius               : 3,
   *     max_speed            : 10,
   *     show_heading         : true,
   *     adjustment_multiplier: 0.5
   *   })
   */
  Boid.randomBoid = function (options) {
    options.position = Vector.fromCartesian({
      x: Math.random() * options.x,
      y: Math.random() * options.y
    });
    options.heading = new Vector(
      Math.random() * (2 * Math.PI),
      Math.random() * options.heading_multiplier
    );
    return new Boid(options);
  };

  /**
   * Draws the boid on the given graphics context.
   */
  Boid.prototype.draw = function () {
    var pt = this.position.asCartesian();
    var tar = this.position.addVector(this.heading.scaledBy(5)).asCartesian();
    var tail = this.position.subtractVector(this.heading.scaledBy(5)).asCartesian();
    var body1 = this.position.subtractVector(this.heading.scaledBy(1.5)).asCartesian();
    var body2 = this.position.subtractVector(this.heading.scaledBy(2)).asCartesian();

    this.ctx.lineWidth = 1;

    if (this.audio) {
//      this.radius = Math.floor(100 * this.audio / 96);
      this.radius = Math.floor(Math.pow(this.audio/28, 3));
//      console.log(this.audio, this.radius);
    }

    if (this.radius < 3) {
      this.radius = 3;
    }

    if (this.color) {
      this.ctx.fillStyle = this.color;
      this.ctx.strokeStyle = this.color;
    }

    // Draw the direction vector
    if (this.show_heading === true) {
      this.ctx.beginPath();
      this.ctx.moveTo(pt.x, pt.y);
      this.ctx.lineTo(tail.x, tail.y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = 'rgb(255,255,255)';

    // Draw the dots

    this.ctx.beginPath();
    this.ctx.arc(body1.x, body1.y, this.radius/1.5, 0, Math.PI*2);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(body2.x, body2.y, this.radius/2, 0, Math.PI*2);
    this.ctx.stroke();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.lineWidth = this.radius > 20 ? 3 : 2;
    this.ctx.arc(pt.x, pt.y, this.radius, 0, Math.PI*2);
    this.ctx.stroke();
    this.ctx.fill();

    this.radius = 3;
  };

  /**
   * Apply adjustments to heading then merge heading into position.
   */
  Boid.prototype.flip = function () {
    if (this.adjustments.length > 0) {
      var adjVector = this.adjustments.reduce(function(prev, next) {
        return prev.addVector(next);
      });
      this.adjustments = [];

      this.heading = this.heading.addVector(adjVector);
    }

    // TODO: We mutate the heading vector here, maybe not a good idea...
    if (this.heading.magnitude > this.max_speed) {
      this.heading.magnitude = this.max_speed;
    }
    this.position = this.position.addVector(this.heading);
  };

  /**
   * Adds an adjustment vector.
   * @param vec
   */
  Boid.prototype.adjustHeading = function (vec) {
    // Limit magnitude of adjustment vectors to avoid crazy course changes
    // TODO: Shouldn't mutate vectors
    if (vec.magnitude > this.max_speed) {
      vec.magnitude = this.max_speed * this.adjustment_multiplier;
    }
    this.adjustments.push(vec.copyOf());
  };

  // Exports
  exports.Boid = Boid;
});
