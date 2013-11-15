'use strict';

require('visualizations/beatdetection-helper', function(helperfile) {

  /**
   * @namespace
   * @type {Object} Visualization object
   */
  var vz = {
    name         : 'WebGL Raymarching example',
    type         : 'visualization',
    tags         : ['webgl', '3d'],
    screen       : null,
    container    : null,
    camera       : null,
    scene        : null,
    renderer     : null,
    helper       : null,
    bands        : [],
    band_count   : 0,
    num_objs     : 0,
    r            : 0,
    width        : 0,
    height       : 0,
    mouseX       : 0,
    mouseY       : 0,
    windowHalfX  : 0,
    windowHalfY  : 0,
    waveformdata : [],
    time         : 0,
    beattime     : 0.0,
    beatoffset   : 0,
    targethue1   : 45,
    targethue2   : 180,
    hue1         : 0,
    hue2         : 0,
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
    vz.helper.setData(audio.spectrum);
    var i, l = audio.wave.left.length;
    for (i = 0; i < l; i++) {
      this.waveformdata[i] = (audio.wave.left[i]+audio.wave.right[i]) / 2.0;
    }
  };

  /**
   * Start visualization
   * @param options
   */
  vz.start = function (options) {
    vz.helper = new helperfile.BeatDetectionHelper();
    vz.bands = options.bands;
    vz.num_bands = vz.bands.length;
    vz.num_objs = vz.num_bands / 5;

    vz.width = options.width;
    vz.height = options.height;

    vz.r = vz.height / 2;

    vz.windowHalfX = vz.width / 2;
    vz.windowHalfY = vz.height / 2;

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
    if (!vz.initialized) return;
    vz.width = width;
    vz.height = height;
    vz.camera.updateProjectionMatrix();
    vz.mtrlattr.uniforms.resolution.value = new THREE.Vector2(
      vz.width,
      vz.height
    );
    vz.renderer.setSize(vz.width, vz.height);
  };


  vz.init = function () {
    vz.scene = new THREE.Scene();
    vz.camera = new THREE.PerspectiveCamera(45, vz.width / vz.height, 1, 3000);
    vz.camera.position.z = 2;
    vz.scene.add(vz.camera);

    var i, line, vector1, vector2, material, p,
      parameters = [],
      geometry = new THREE.Geometry();

    var fs = document.getElementById('2d-fragment-shader');
    var vs = document.getElementById('2d-vertex-shader');
    vz.mtrlattr = {
      fragmentShader: fs.text,
      vertexShader: vs.text,
      attributes: {
      },
      uniforms: {
        resolution: {type: 'v2', value: new THREE.Vector2(  500.0,  500.0 )},
        time: {type: 'f', value: 0.0},
        beattime: {type: 'f', value: 0.0},
        mouse: {type: 'v2', value: new THREE.Vector2( 0.5, 0.5 )},
        hue1: {type: 'f', value: 1.0},
        color1: {type: 'v3', value: new THREE.Vector3( 0, 1, 0 )},
        hue2: {type: 'f', value: 1.0},
        color2: {type: 'v3', value: new THREE.Vector3( 0, 1, 2 )},
        specSampler: {type: 't', value: 0, texture: null},
      }
    };
    vz.mtrl = new THREE.ShaderMaterial(vz.mtrlattr);

    // var mtrl = new THREE.MeshNormalMaterial();

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vz.mtrl);
    plane.overdraw = true;
    vz.scene.add(plane);

    vz.renderer = new THREE.WebGLRenderer({antialias: false});
    vz.renderer.setSize(vz.width, vz.height);
    vz.container.appendChild(vz.renderer.domElement);

    document.addEventListener('mousemove', vz.onDocumentMouseMove, false);
    document.addEventListener('touchstart', vz.onDocumentTouchStart, false);
    document.addEventListener('touchmove', vz.onDocumentTouchMove, false);
    document.addEventListener('keydown', vz.onDocumentKeyDown, false);
  };

  vz.beat1 = function() {
    vz.beatoffset += 5.0 + Math.random() * 30.0;
    vz.beattime = 0.0;
    while (vz.time > 60.0)
      vz.time -= 60.0;
    while (vz.beatoffset > 60.0)
      vz.beatoffset -= 60.0;
  }

  vz.beat2 = function() {
    vz.targethue1 += 45 * Math.ceil(Math.random() * 4.0);
  }

  vz.beat3 = function() {
    vz.targethue2 += 45 * Math.ceil(Math.random() * 4.0);
  }

  vz.onDocumentKeyDown = function(e) {
    // console.log(e, e.keyCode);
    if (e.keyCode == 32 || e.keyCode == 51) vz.beat1();
    if (e.keyCode == 49) vz.beat2();
    if (e.keyCode == 50) vz.beat3();
  }

  vz.onDocumentMouseMove = function (event) {
    vz.mtrlattr.uniforms.mouse.value = new THREE.Vector2(
      event.clientX / vz.width,
      event.clientY / vz.height
    );
  };

  vz.onDocumentTouchStart = function (event) {};

  vz.onDocumentTouchMove = function (event) {};

  vz.animate = function () {
    requestAnimationFrame(vz.animate);
    vz.render();
    vz.time += 1.0 / 60.0;
    vz.beattime += 1.0 / 60.0;
    vz.hue1 += (vz.targethue1 - vz.hue1) * 0.5;
    vz.hue2 += (vz.targethue2 - vz.hue2) * 0.1;
    vz.helper.update();
  };

  function hslToRgb(h, s, l) {
    var r, g, b;
    function hue2rgb(p, q, t) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
    return [r, g, b];
  }

  vz.render = function () {
    if (vz.helper.low_peak) vz.beat1();
    if (vz.helper.mid_peak) vz.beat2();
    if (vz.helper.high_peak) vz.beat3();

    var rgb1 = hslToRgb((vz.hue1 / 360.0) % 1.0, 1.0, 0.5);
    var rgb2 = hslToRgb((vz.hue2 / 360.0) % 1.0, 1.0, 0.5);

    var arr = [];
    for(var j=0; j<4; j++) {
      for(var i=0; i<64; i++) {
        var o = Math.floor((i * 64.0) / this.waveformdata.length);
        var v = 128.0 + (this.waveformdata[o] * 128.0);
        arr.push(v);
        arr.push(v);
        arr.push(v);
        arr.push(255);
      }
    }
    var buf = new Uint8Array(arr);
    if (vz.mtrlattr.uniforms.specSampler.texture == null)
     vz.mtrlattr.uniforms.specSampler.texture = new THREE.DataTexture(buf, 64, 4, THREE.RGBAFormat);
    vz.mtrlattr.uniforms.specSampler.texture.image.data = buf;
    vz.mtrlattr.uniforms.specSampler.texture.needsUpdate = true;

    vz.mtrlattr.uniforms.time.value = vz.time + vz.beatoffset;
    vz.mtrlattr.uniforms.beattime.value = vz.beattime;
    vz.mtrlattr.uniforms.hue1.value = vz.hue1;
    vz.mtrlattr.uniforms.hue2.value = vz.hue2;
    vz.mtrlattr.uniforms.color1.value = new THREE.Vector3(rgb1[0], rgb1[1], rgb1[2]);
    vz.mtrlattr.uniforms.color2.value = new THREE.Vector3(rgb2[0], rgb2[1], rgb2[2]);

    vz.renderer.render(vz.scene, vz.camera);
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

});

