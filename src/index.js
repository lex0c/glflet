'use strict';

if (!window || !window.L) {
  throw new Error('Leaflet not found.');
}

//require('@babel/polyfill');

window.L.glflet = (map) {
  require('./third-party/canvas-overlay');

  const { compileShader, createProgram, latlngToPixel } = require('./utils');
  const { orthographic, scale, translate } = require('./third-party/m4');

  const layer = window.L.canvasOverlay().addTo(map);

  const canvas = glLayer.canvas();

  layer.canvas.width = canvas.clientWidth;
  layer.canvas.height = canvas.clientHeight;

  var gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true });

  if (!gl) {
    console.error('WebGL2 not available');
  }

  function setup(callback) {
    if (gl == null) return;

    resizeCanvasToDisplaySize(gl.canvas);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // set base matrix to translate canvas pixel coordinates to webgl coordinates
    let mapMatrix = orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    const bounds = leafletMap.getBounds();
    const topLeft = new window.L.LatLng(bounds.getNorth(), bounds.getWest());
    const offset = latlngToPixel(topLeft.lat, topLeft.lng);

    // scale to current zoom
    const scale = Math.pow(2, leafletMap.getZoom());
    mapMatrix = scale(mapMatrix, scale, scale, 1);

    mapMatrix = translate(mapMatrix, -offset.x, -offset.y, 0);

    if (callback) callback(mapMatrix);
  }

  function point(params) {
    if (!params) return;

    const program = createProgram(
      compileShader(require('./shaders/point-state.vertex.glsl'), gl.VERTEX_SHADER),
      compileShader(require('./shaders/point-state.fragment.glsl'), gl.FRAGMENT_SHADER),
    );

    const handler = await pointRender(params, { gl, program, map });

    layer.drawing(() => setup(handler.draw));
    layer.redraw();
  }

  return Object.freeze({
    point,
  });
}
