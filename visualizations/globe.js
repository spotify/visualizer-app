'use strict';

/**
 * @namespace
 * @type {Object} Visualization object
 */
var vz = {
  name         : 'Globe Normals - WebGL',
  type         : 'visualization',
  tags         : ['webgl', '3d'],
  screen       : null,
  container    : null,
  camera       : null,
  scene        : null,
  renderer     : null,
  bands        : [],
  band_count   : 0,
  num_objs     : 0,
  r            : 0,
  SCREEN_WIDTH : 0,
  SCREEN_HEIGHT: 0,
  mouseX       : 0,
  mouseY       : 0,
  windowHalfX  : 0,
  windowHalfY  : 0,
  initialized  : false,
  options: {
    linecount: 1500,
    AMP      : 70
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
  var step = Math.floor(vz.num_bands / vz.num_objs),
    s = audio.spectrum,
    i, l, color;
  vz.renderer.render(vz.scene, vz.camera);
  for (i = 0; i < vz.num_objs; i++) {
    l = (s.left[i * step] + s.right[i * step]) / 2;
    vz.scene.objects[i].scale.x = vz.scene.objects[i].scale.y = vz.scene.objects[i].scale.z = vz.scene.objects[i].originalScale + (l + vz.options.AMP) / 50;
  }
};

/**
 * Start visualization
 * @param options
 */
vz.start = function (options) {
  vz.bands = options.bands;
  vz.num_bands = vz.bands.length;
  vz.num_objs = vz.num_bands / 5;

  vz.SCREEN_WIDTH = options.width;
  vz.SCREEN_HEIGHT = options.height;

  vz.r = vz.SCREEN_HEIGHT / 2;

  vz.windowHalfX = vz.SCREEN_WIDTH / 2;
  vz.windowHalfY = vz.SCREEN_HEIGHT / 2;

  vz.screen = options.screen;

  vz.container = document.createElement('div');
  vz.screen.appendChild(vz.container);

  vz.init();
  vz.initialized = true;
  vz.animate();
};

/**
 * Stop visualization
 */
vz.stop = function () {
  if (!vz.initialized) return;

  document.removeEventListener('mousemove', vz.onDocumentMouseMove, false);
  document.removeEventListener('touchstart', vz.onDocumentTouchStart, false);
  document.removeEventListener('touchmove', vz.onDocumentTouchMove, false);
  vz.screen.removeChild(vz.container);

  vz.initialized = false;
};

/**
 * Start visualization fading in
 * @param options
 */
vz.fadeIn = function (options) {
  vz.start(options);
};

/**
 * Stop visualization fading out
 */
vz.fadeOut = function (step) {
  if (!vz.initialized) return;

  vz.stop();
};

/**
 * Resize the visualization
 * @param width
 * @param height
 */
vz.resize = function (width, height) {
//  if (!vz.initialized) return;
};

/**
 * Initialize the visualization
 */
vz.init = function () {
  vz.scene = new THREE.Scene();
  vz.camera = new THREE.PerspectiveCamera(80, vz.SCREEN_WIDTH / vz.SCREEN_HEIGHT, 1, 3000);
  vz.camera.position.z = 1000;
  vz.scene.add(vz.camera);

  var i, line, vector1, vector2, material, p,
    parameters = [],
    geometry = new THREE.Geometry();

  var step = Math.floor(vz.num_bands / vz.num_objs);
  var l, color;

  for (i = 0; i < vz.num_objs; i++) {
    color = Visualizer.colorize(vz.bands[i * step]).replace('#', '0x');
//    color = '0x00ff00';
    parameters.push([ 0.25, color, 1, 1 ]);
  }

  parameters.push([3.5, 0xffffff, 0.5, 1]);
  parameters.push([4.5, 0xffffff, 0.25, 1]);
  parameters.push([5.5, 0xffffff, 0.125, 1]);

  for (i = 0; i < vz.options.linecount; i++) { // 1500
    vector1 = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    vector1.normalize();
    vector1.multiplyScalar(vz.r);

    vector2 = vector1.clone();
    vector2.multiplyScalar(Math.random() * 0.09 + 1);

    geometry.vertices.push(new THREE.Vertex(vector1));
    geometry.vertices.push(new THREE.Vertex(vector2));
  }

  for(i = 0; i < parameters.length; ++i) {
    p = parameters[i];

    material = new THREE.LineBasicMaterial({color: p[1], opacity: p[2], linewidth: p[3]});

    line = new THREE.Line(geometry, material, THREE.LinePieces);
    line.scale.x = line.scale.y = line.scale.z = p[0];
    line.originalScale = p[0];
    line.rotation.y = Math.random() * Math.PI;
    line.updateMatrix();

    vz.scene.add(line);
  }

  vz.renderer = new THREE.WebGLRenderer({antialias: true});
  vz.renderer.setSize(vz.SCREEN_WIDTH, vz.SCREEN_HEIGHT);
  vz.container.appendChild(vz.renderer.domElement);

  document.addEventListener('mousemove', vz.onDocumentMouseMove, false);
  document.addEventListener('touchstart', vz.onDocumentTouchStart, false);
  document.addEventListener('touchmove', vz.onDocumentTouchMove, false);
};

vz.onDocumentMouseMove = function (event) {
  vz.mouseX = event.clientX - vz.windowHalfX;
  vz.mouseY = event.clientY - vz.windowHalfY;
};

vz.onDocumentTouchStart = function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();

    vz.mouseX = event.touches[0].pageX - vz.windowHalfX;
    vz.mouseY = event.touches[0].pageY - vz.windowHalfY;
  }
};

vz.onDocumentTouchMove = function (event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    vz.mouseX = event.touches[0].pageX - vz.windowHalfX;
    vz.mouseY = event.touches[0].pageY - vz.windowHalfY;
  }
};

vz.animate = function () {
  requestAnimationFrame(vz.animate);
  vz.render();
};

vz.render = function () {
  vz.camera.position.y += (-vz.mouseY + 200 - vz.camera.position.y) * 0.05;
  vz.camera.lookAt(vz.scene.position);
  vz.renderer.render(vz.scene, vz.camera);

  var i, time = Date.now() * 0.00004;
  for (i = 0; i < vz.scene.objects.length; i++) {
    vz.scene.objects[i].rotation.y = time * (i < 4 ? (i + 1) : -(i + 1));
  }
};

// Export API
exports.name    = vz.name;
exports.type    = vz.type;
exports.start   = vz.start;
exports.stop    = vz.stop;
exports.fadeIn  = vz.fadeIn;
exports.fadeOut = vz.fadeOut;
exports.resize  = vz.resize;
exports.audio   = vz.audio;
