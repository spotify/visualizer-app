'use strict';
/**
 * Vector class borrowed from https://github.com/glesica/canvas-boids
 */

/**
 * Vector: Represents a vector in 2D space.
 * @param d Vector direction, in radians
 * @param m Vector magnitude or length
 * @constructor
 */
function Vector(d, m) {
  // If `d` is outside [0, 2PI), bring it back into the correct range.
  this.direction = d % (2 * Math.PI);
  this.magnitude = m;
}

/**
 * Factory that returns a vector using the given x and y coordinates.
 * @param pt
 * @return {Vector}
 */
Vector.fromCartesian = function (pt) {
  var dir;
  var mag = Math.sqrt((pt.x * pt.x) + (pt.y * pt.y));

  if (pt.x >= 0) {
    dir = ((2 * Math.PI) + Math.asin(pt.y / mag)) % (2 * Math.PI);
  } else {
    dir = Math.PI - Math.asin(pt.y / mag);
  }

  // Value of `dir` should *always* be in [0, 2PI)
  if (dir < 0 || dir >= (2 * Math.PI)) {
    console.error('Error, angle out of range: ', dir, pt);
  }

  return new Vector(
    dir,
    mag
  );
};

/**
 * Returns the vector represented as cartesian coordinates: {x:_, y:_}.
 * @return {Object}
 */
Vector.prototype.asCartesian = function () {
  return {
    x: Math.cos(this.direction) * this.magnitude,
    y: Math.sin(this.direction) * this.magnitude
  };
};

/**
 * Returns a copy of the vector.
 * @return {Vector}
 */
Vector.prototype.copyOf = function () {
  return new Vector(
    this.direction,
    this.magnitude
  );
};

/**
 * Returns the result of adding `vec`.
 * @param vec
 * @return {Vector}
 */
Vector.prototype.addVector = function (vec) {
  var self = this.asCartesian();
  var other = vec.asCartesian();
  return Vector.fromCartesian({
    x: self.x + other.x,
    y: self.y + other.y
  });
};

/**
 * Returns the result of subtracting `vec`.
 * @param vec
 * @return {Vector}
 */
Vector.prototype.subtractVector = function (vec) {
  var self = this.asCartesian();
  var other = vec.asCartesian();
  return Vector.fromCartesian({
    x: self.x - other.x,
    y: self.y - other.y
  });
};

/**
 * Returns the vector multiplied by a scalar.
 * @param scl
 * @return {Vector}
 */
Vector.prototype.scaledBy = function (scl) {
  return new Vector(
    this.direction,
    this.magnitude * scl
  );
};

/**
 * Returns a relative vector to the given vector or point.
 * @param other
 * @return {Vector}
 */
Vector.prototype.vectorTo = function (other) {
  var vec = other;
  if (!(other instanceof Vector)) {
    vec = Vector.fromCartesian(other);
  }
  return vec.subtractVector(this);
};

/**
 * Returns the angle to the vector or point.
 * @param other
 * @return {*}
 */
Vector.prototype.directionTo = function (other) {
  return this.vectorTo(other).direction;
};

/**
 * Returns the distance to the vector or point.
 * @param other
 * @return {*}
 */
Vector.prototype.distanceTo = function (other) {
  return this.vectorTo(other).magnitude;
};

// Exports
if (typeof exports !== 'undefined') {
  exports.Vector = Vector;
}
