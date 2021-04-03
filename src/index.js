'use strict';

if (!window || !window.L) {
  throw new Error('Leaflet not found.');
}

require('babel-core/register');
require('babel-polyfill');

window.L.glflet = (map) => {
  require('./third-party/canvas-overlay');

  const { compileShader, createProgram, latlngToPixel } = require('./utils');
  const m4 = require('./third-party/m4');
  const { resizeCanvasToDisplaySize } = require('./third-party/webgl-utils');

  const layer = window.L.canvasOverlay().addTo(map);

  const canvas = layer.canvas();

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
    let mapMatrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    const bounds = map.getBounds();
    const topLeft = new window.L.LatLng(bounds.getNorth(), bounds.getWest());
    const offset = latlngToPixel(topLeft.lat, topLeft.lng);

    // scale to current zoom
    const scale = Math.pow(2, map.getZoom());
    mapMatrix = m4.scale(mapMatrix, scale, scale, 1);

    mapMatrix = m4.translate(mapMatrix, -offset.x, -offset.y, 0);

    if (callback) callback(map, mapMatrix);
  }

  async function point(params) {
    if (!params) return;

    const program = createProgram(
      gl,
      compileShader(gl, require('./shaders/point-state.vertex.glsl'), gl.VERTEX_SHADER),
      compileShader(gl, require('./shaders/point-state.fragment.glsl'), gl.FRAGMENT_SHADER),
    );

    const handler = await require('./renderers/point')(params, { gl, program });

    layer.drawing(() => setup(handler.draw)).redraw();
  }

  return Object.freeze({
    point,
  });
}
