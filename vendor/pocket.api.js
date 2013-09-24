var Pocket = {};

Pocket.api = function(canvas, ctx, displayWidth, displayHeight) {
//  'use strict';

  var tmpCanvas, tmpCtx;

  tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = screenWidth();
  tmpCanvas.height = screenHeight();
  tmpCtx = tmpCanvas.getContext("2d")

  var displayQuality = 1.0;
  var compositeMode = "source-over";

  var images = [];

  function screenWidth() {
    return displayWidth * displayQuality;
  }

  function screenHeight() {
    return displayHeight * displayQuality;
  }

  function drawActivePath(fillStyle, strokeStyle, strokeWidth) {
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (strokeStyle) {
      if (strokeWidth)
        ctx.lineWidth = strokeWidth * displayQuality;
      else
        ctx.lineWidth = 1 * displayQuality;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
  }

  function clearRect(x, y, width, height) {
    ctx.save();
    ctx.clearRect(x * screenWidth(), y * screenHeight(), width * screenWidth(), height * screenHeight());
    ctx.restore();
  }


  function drawRects(rects, fillStyle, strokeStyle, strokeWidth) {
    var x, y, w, h;
    ctx.save();
    for (var i=0,l=rects.length;i<l;i++) {
      var rect = rects[i];
      x = rect.x;
      y = rect.y;
      w = rect.w;
      h = rect.h;
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x * screenWidth(), y * screenHeight(), w * screenWidth(), h * screenHeight());
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = (strokeWidth || 1) * displayQuality;
        ctx.strokeRect(x * screenWidth(), y * screenHeight(), w * screenWidth(), h * screenHeight());
      }
    }
    ctx.restore();
  }

  function drawRect(x, y, w, h, fillStyle, strokeStyle, strokeWidth) {
    drawRects([{x:x,y:y,w:w,h:h}], fillStyle, strokeStyle, strokeWidth);
  }

  function drawPath(points, close, fillStyle, strokeStyle, strokeWidth) {
    drawPaths([points], close, fillStyle, strokeStyle, strokeWidth);
  }

  function drawPaths(paths, close, fillStyle, strokeStyle, strokeWidth) {
    ctx.save();
    ctx.beginPath();

    for (var i=0,l=paths.length;i<l;i++) {
      var points = paths[i];
      if (points.length < 2) continue;

      var firstPoint = points[0];

      for (var j=0,k=points.length;j<k;j++) {
        var point = points[j];
        if (typeof point[0] == "number" && typeof point[1] == "number") {
          if (j == 0)
            ctx.moveTo(point[0]*screenWidth(), point[1]*screenHeight());
          else
            ctx.lineTo(point[0]*screenWidth(), point[1]*screenHeight());
        }
      }
      if (close) ctx.lineTo(firstPoint[0]*screenWidth(), firstPoint[1]*screenHeight());
    }

    drawActivePath(fillStyle, strokeStyle, strokeWidth);

    ctx.restore();
  }

  function drawCircle(x, y, radius, fillStyle, strokeStyle, strokeWidth) {
    drawCircles([{x:x, y:y, radius:radius}], fillStyle, strokeStyle, strokeWidth);
  }

  function drawCircles(circles, fillStyle, strokeStyle, strokeWidth) {
    ctx.save();
    ctx.beginPath();

    for (var i=0,l=circles.length;i<l;i++) {
      var c = circles[i];
      var r = c.radius;
      if (r < 0) r = 0;

      var startX = (c.x + r) * screenWidth();
      var startY = c.y * screenWidth();

      ctx.moveTo(startX, startY);
      ctx.arc(c.x*screenWidth(), c.y*screenHeight(), r*screenWidth(), 0, Math.PI * 2, false);
    }
    ctx.closePath();

    drawActivePath(fillStyle, strokeStyle, strokeWidth);

    ctx.restore();

  }

  function drawArc(x, y, radius, startAngle, endAngle, fillStyle, strokeStyle, strokeWidth, open) {
    drawArcs(
      [{x : x, y : y, radius : radius, startAngle : startAngle, endAngle : endAngle}],
      fillStyle, strokeStyle, strokeWidth, open
    );
  }

  function drawArcs(arcs, fillStyle, strokeStyle, strokeWidth, open) {
    ctx.save();
    ctx.beginPath();

    for (var i=0,l=arcs.length;i<l;i++) {
      var arc = arcs[i];
      if (arc.radius <= 0) continue;

      var startX = (arc.x + Math.cos(arc.startAngle) * arc.radius) * screenWidth();
      var startY = (arc.y + Math.sin(arc.startAngle) * arc.radius) * screenWidth();
      ctx.moveTo(startX, startY);
      ctx.arc(arc.x*screenWidth(), arc.y*screenHeight(), arc.radius*screenWidth(), arc.startAngle, arc.endAngle, true);
      if (!open)
        ctx.lineTo(arc.x*screenWidth(), arc.y*screenHeight());

    }

    ctx.closePath();

    drawActivePath(fillStyle, strokeStyle, strokeWidth);

    ctx.restore();
  }

  function drawEllipse(x, y, a, b, angle, fillStyle, strokeStyle, strokeWidth) {
    ctx.save();
    ctx.beginPath();
    a *= 2;
    b *= 2;
    var m = Math.max(a,b);
    ctx.translate(x*screenWidth(), y*screenHeight());
    ctx.rotate(angle);
    ctx.scale(a/m, b/m);
    ctx.arc(0, 0, m*0.5*screenWidth(), 0, Math.PI*2, true);
    ctx.closePath();

    drawActivePath(fillStyle, strokeStyle, strokeWidth);

    ctx.restore();
  }

  function drawLine(x1, y1, x2, y2, strokeColor, strokeWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1*screenWidth(), y1*screenHeight());
    ctx.lineTo(x2*screenWidth(), y2*screenHeight());
    ctx.closePath();
    if (strokeWidth)
      ctx.lineWidth = strokeWidth * displayQuality;
    else
      ctx.lineWidth = 1 * displayQuality;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();
  }

  function drawImage(src, x, y, width, height, angle) {
    ctx.save();
    if (!images[src]) {
      images[src] = new Image();
      images[src].src = src;
    }
    width = Math.max(0, width);
    height = Math.max(0, height);
    if (images[src].complete) {
      ctx.translate(x*screenWidth(), y*screenHeight());
      if (angle)
        ctx.rotate(angle);
      ctx.drawImage(
        images[src],
        0, 0,
        width*screenWidth(), height*screenHeight()
      );
    }
    ctx.restore();
  }


  function zoom(z) {
    stretch(z,z,0.5,0.5);
  }

  function stretch(x, y, ox, oy) {
    if (typeof ox == "undefined") ox = 0;
    if (typeof oy == "undefined") oy = 0;
    var w = screenWidth(), h = screenHeight();
    tmpCanvas.width = w; tmpCanvas.height = h;
    ox *= w;
    oy *= h;
    tmpCtx.clearRect(0,0,w,h);
    tmpCtx.drawImage(canvas,0,0);
    ctx.globalCompositeOperation = "copy";
    ctx.clearRect(0,0,screenWidth(),screenHeight());
    ctx.drawImage(tmpCanvas, -(x-1)*ox, -(y-1)*oy, screenWidth() * x, screenHeight() * y);
    ctx.globalCompositeOperation = "source-over";
  }

  function rotate(angle) {
    var w = screenWidth(), h = screenHeight();
    tmpCanvas.width = w; tmpCanvas.height = h;
    tmpCtx.drawImage(canvas,0,0);
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.clearRect(0,0,w,h);
    ctx.translate(w/2, h/2);
    ctx.rotate(angle);
    ctx.drawImage(tmpCanvas,-w/2,-h/2);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  function rotozoom(angle, zoom) {
    var w = screenWidth(), h = screenHeight();
    tmpCanvas.width = w; tmpCanvas.height = h;
    tmpCtx.drawImage(canvas,0,0);
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.clearRect(0,0,w,h);
    ctx.translate(w/2, h/2);
    ctx.rotate(angle);
    ctx.scale(zoom,zoom);
    ctx.drawImage(tmpCanvas,-w/2,-h/2);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  function move(x, y) {
    deform(function() {
      return {
        moveX : x, moveY : y
      }
    },1,1);
  }

  function process(action, options, defer) {
    if (!hasImageData)
      return;

    options = options || {};
    if (defer) {
      processList.push([action, options]);
    } else {
      Pixastic.process(ctx.canvas, action, options);
      ctx.globalCompositeOperation = "copy";
      ctx.drawImage(options.resultCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function rgb2hsl(r, g, b) {
    var h, s, l;
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(Math.max(r, g), b);
    var min = Math.min(Math.min(r, g), b);
    if (max == min) {
      h = 0;
    } else if (r == max && g >= b) {
      h = 60 * (g - b) / (max - min);
    } else if (r == max && g < b) {
      h = 60 * (g - b) / (max - min) + 360;
    } else if (g == max) {
      h = 60 * (b - r) / (max - min) + 120;
    } else if (b == max) {
      h = 60 * (r - g) / (max - min) + 240;
    }
    l = 0.5 * (max + min);
    if (max == min) {
      s = 0;
    } else if (l <= 0.5) {
      s = (max - min) / (max + min);
    } else {
      s = (max - min) / (2-(max + min));
    }
    return { h : h, s : s, l : l };
  }

  function hsl2rgb(hue, sat, light) {
    light /= 100;
    sat /= 100;
    if (light < 0.5) {
      var q = light * (1 + sat);
    } else {
      var q = light + sat - (light * sat);
    }
    var p = 2 * light - q;

    hue %= 360;
    if (hue < 0) hue += 360;

    var hk = hue / 360;

    var tr = hk + 1/3;
    var tg = hk;
    var tb = hk - 1/3;

    if (tr < 0) tr += 1;
    if (tr > 1) tr -= 1;

    if (tg < 0) tg += 1;
    if (tg > 1) tg -= 1;

    if (tb < 0) tb += 1;
    if (tb > 1) tb -= 1;


    var r, g, b;

    if (tr < 1/6) {
      r = p + ((q - p) * 6 * tr);
    } else if (tr < 1/2) {
      r = q;
    } else if (tr < 2/3) {
      r = p + ((q - p) * 6 * (2/3 - tr))
    } else {
      r = p;
    }


    if (tg < 1/6) {
      g = p + ((q - p) * 6 * tg);
    } else if (tg < 1/2) {
      g = q;
    } else if (tg < 2/3) {
      g = p + ((q - p) * 6 * (2/3 - tg))
    } else {
      g = p;
    }

    if (tb < 1/6) {
      b = p + ((q - p) * 6 * tb);
    } else if (tb < 1/2) {
      b = q;
    } else if (tb < 2/3) {
      b = p + ((q - p) * 6 * (2/3 - tb))
    } else {
      b = p;
    }

    return {r : (r * 255)>>0, g : (g * 255)>>0, b : (b * 255)>>0 };
  }

  function hsv2rgb(hue, sat, variance) {
    if (sat > 0) {
      sat /= 100;
      variance /= 100;

      hue %= 360;
      if (hue < 0) hue += 360;

      var h = (hue / 60)>>0;

      var hPart = (hue / 60) - h;

      if (!(h & 1)) hPart = 1 - hPart;

      var c1 = variance * (1 - sat);
      var c2 = variance * (1 - sat * hPart);

      var r,g,b;

      switch (h) {
        case 0:
          r = variance; g = c2; b = c1;
          break;
        case 1:
          r = c2; g = variance; b = c1;
          break;
        case 2:
          r = c1; g = variance; b = c2;
          break;
        case 3:
          r = c1; g = c2; b = variance;
          break;
        case 4:
          r = c2; g = c1; b = variance;
          break;
        case 5:
          r = variance; g = c1; b = c2;
          break;
      }
      return {r:r*255, g:g*255, b:b*255};
    } else {
      var c = variance / 100 * 255;
      return {r:c, g:c, b:c};
    }
  }

  function deform(deformFunction, gridSizeX, gridSizeY, paintGrid, gridColor, gridLineWidth) {
    var width = screenWidth(), height = screenHeight();
    tmpCanvas.width = width; tmpCanvas.height = height;

    var pixelMeshSizeX = Math.max(1, Math.min(32, gridSizeX || 7));
    var pixelMeshSizeY = Math.max(1, Math.min(32, gridSizeY || 7));

    var grid = [];

    for (var x=0;x<=pixelMeshSizeX;x++) {
      grid[x] = [];
      for (var y=0;y<=pixelMeshSizeY;y++) {
        var fx = x / pixelMeshSizeX;
        var fy = y / pixelMeshSizeY;

        var px = (fx - 0.5) * 2;
        var py = (fy - 0.5) * 2;

        var rad = Math.sqrt(px*px+py*py);
        var ang = Math.atan2(py,px);

        var pixelVars = deformFunction(rad, ang, fx, fy) || {};

        var cx = pixelVars.centerX;
        var cy = pixelVars.centerY;
        var sx = pixelVars.stretchX;
        var sy = pixelVars.stretchY;
        var dx = pixelVars.moveX;
        var dy = pixelVars.moveY;
        var zoom = pixelVars.zoom;
        var rot = pixelVars.rotate;

        if (typeof cx == "undefined" || isNaN(cx)) cx = 0;
        if (typeof cy == "undefined" || isNaN(cy)) cy = 0;
        if (typeof sx == "undefined" || isNaN(sx)) sx = 1;
        if (typeof sy == "undefined" || isNaN(sy)) sy = 1;
        if (typeof dx == "undefined" || isNaN(dx)) dx = 0;
        if (typeof dy == "undefined" || isNaN(dy)) dy = 0;
        if (typeof zoom == "undefined" || isNaN(zoom)) zoom = 1;
        if (typeof rot == "undefined" || isNaN(rot)) rot = 0;

        cx = (cx / 2 + 0.5);
        cy = (cy / 2 + 0.5);

        var u = px * 0.5 * zoom + 0.5;
        var v = py * 0.5 * zoom + 0.5;

        // stretch on X, Y:
        u = (u - cx) * sx + cx;
        v = (v - cy) * sy + cy;

        // rotation:
        if (rot) {
          var u2 = u - cx;
          var v2 = v - cy;
          var cos_rot = Math.cos(rot);
          var sin_rot = Math.sin(rot);
          u = u2*cos_rot - v2*sin_rot + cx;
          v = u2*sin_rot + v2*cos_rot + cy;
        }

        // translation:
        u += dx;
        v += dy;

        grid[x][y] = {
          x : u * width,
          y : v * height
        };
      }
    }

    var cellWidth = 1 / pixelMeshSizeX * width;
    var cellHeight = 1 / pixelMeshSizeY * height;

    for (var y=0;y<pixelMeshSizeY;y++) {
      var py = y / pixelMeshSizeY * height;
      for (var x=0;x<pixelMeshSizeX;x++) {
        var p00 = grid[x][y];
        var p10 = grid[x+1][y];
        var p01 = grid[x][y+1];
        var p11 = grid[x+1][y+1];

        var px = x / pixelMeshSizeX * width;

        var isIn00 = (p00.x > 0 || p00.x < 1 || p00.y > 0 || p00.y < 1);
        var isIn10 = (p10.x > 0 || p10.x < 1 || p10.y > 0 || p10.y < 1);
        var isIn01 = (p01.x > 0 || p01.x < 1 || p01.y > 0 || p01.y < 1);
        var isIn11 = (p11.x > 0 || p11.x < 1 || p11.y > 0 || p11.y < 1);

        if (isIn00 && isIn10 && isIn11) {
          renderTriangle(
            tmpCtx,
            p00, p10, p11,
            canvas,
            { x : px, y : py },
            { x : px+cellWidth, y : py },
            { x : px+cellWidth, y : py+cellHeight }
          )
        }
        if (isIn00 && isIn01 && isIn11) {
          renderTriangle(
            tmpCtx,
            p00, p01, p11,
            canvas,
            { x : px, y : py },
            { x : px, y : py+cellHeight },
            { x : px+cellWidth, y : py+cellHeight }
          )
        }
      }
    }

    ctx.clearRect(0,0,width,height);
    ctx.drawImage(tmpCtx.canvas, 0, 0);

    if (paintGrid) {
      ctx.strokeStyle = gridColor || "rgb(0,255,0)";
      ctx.lineWidth = gridLineWidth || 2 * displayQuality;
      ctx.beginPath();
      for (var x=0;x<=pixelMeshSizeX-1;x++) {
        for (var y=0;y<=pixelMeshSizeY-1;y++) {
          var p1 = grid[x][y];
          var p2 = grid[x+1][y];
          var p3 = grid[x+1][y+1];
          var p4 = grid[x][y+1];

          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.lineTo(p1.x, p1.y);
        }
      }
      ctx.stroke();
    }
  }

// draws a triangle (s0, s1, s2) from srcCanvas using dstCtx to (d0, d1, d2)
// used by deform()
  function renderTriangle(dstCtx, d0, d1, d2, srcCanvas, s0, s1, s2) {
    var sax = s1.x - s0.x;
    var say = s1.y - s0.y;
    var sbx = s2.x - s0.x;
    var sby = s2.y - s0.y;

    var dinv = 1 / (sax * sby - say * sbx);

    var i11 = sby * dinv;
    var i22 = sax * dinv;
    var i12 = -say * dinv;
    var i21 = -sbx * dinv;

    var dax = d1.x - d0.x;
    var day = d1.y - d0.y;
    var dbx = d2.x - d0.x;
    var dby = d2.y - d0.y;

    var m11 = i11 * dax + i12 * dbx;
    var m12 = i11 * day + i12 * dby;
    var m21 = i21 * dax + i22 * dbx;
    var m22 = i21 * day + i22 * dby;

    dstCtx.save();
    dstCtx.beginPath();
    dstCtx.moveTo(d0.x, d0.y);
    dstCtx.lineTo(d1.x, d1.y);
    dstCtx.lineTo(d2.x, d2.y);
    dstCtx.clip();

    dstCtx.transform(m11, m12, m21, m22,
      d0.x - (m11 * s0.x + m21 * s0.y),
      d0.y - (m12 * s0.x + m22 * s0.y)
    );
    dstCtx.drawImage(srcCanvas, 0, 0);
    dstCtx.restore();
  }



  function decay(amount) {
    drawRect(0,0,1,1,"rgba(0,0,0," + amount + ")");
  }

  function quality(q) {
    if (!q) return;
    if (q <= 0) return;
    displayQuality = q;
  }

  function composite(mode) {
    compositeMode = mode;
  }

  return {
    clearRect : clearRect,
    drawRect : drawRect,
    drawCircle : drawCircle,
    drawCircles : drawCircles,
    drawArc : drawArc,
    drawArcs : drawArcs,
    drawPath : drawPath,
    drawPaths : drawPaths,
    drawEllipse : drawEllipse,
    drawImage : drawImage,

    rgb2hsl : rgb2hsl,
    hsl2rgb : hsl2rgb,
    hsv2rgb : hsv2rgb,

    stretch : stretch,
    zoom : zoom,
    move : move,
    rotate : rotate,
    rotozoom : rotozoom,

    deform : deform,

    process : process,
    decay : decay,
    quality : quality,
    composite : composite,



  };

};