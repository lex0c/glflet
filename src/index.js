'use strict';

if (!window || !window.L) {
  throw new Error('Leaflet not found.');
}

require('babel-core/register');
require('babel-polyfill');

window.L.glflet = (map) => {
  require('./third-party/canvas-overlay');

  const { latlngToPixel } = require('./utils');
  const m4 = require('./third-party/m4');

  const layer = window.L.canvasOverlay().addTo(map);

  const canvas = layer.canvas();

  layer.canvas.width = canvas.clientWidth;
  layer.canvas.height = canvas.clientHeight;

  const gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true });

  if (!gl) {
    console.error('WebGL2 not available');
  }

  /**
   * Creates and compiles a shader.
   *
   * @param {!WebGLRenderingContext} gl The WebGL Context.
   * @param {string} shaderSource The GLSL source code for the shader.
   * @param {number} shaderType The type of shader, gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
   * @return {!WebGLShader} The shader.
   */
  function compileShader(source, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw `Could not compile shader: ${gl.getShaderInfoLog(shader)}`;
    }

    return shader;
  }

  /**
   * Creates a program from 2 shaders.
   *
   * @param {!WebGLRenderingContext) gl The WebGL context.
   * @param {!WebGLShader} vertexShader A vertex shader.
   * @param {!WebGLShader} fragmentShader A fragment shader.
   * @return {!WebGLProgram} A program.
   */
  function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw `Program failed to link: ${gl.getProgramInfoLog(program)}`;
    }

    gl.useProgram(program);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    return program;
  };

  function setup(callback) {
    if (gl == null) return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // set base matrix to translate canvas pixel coordinates to webgl coordinates
    let mapMatrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    const bounds = map.getBounds();
    const topLeft = new window.L.LatLng(bounds.getNorth(), bounds.getWest());
    const offset = latlngToPixel(topLeft.lat, topLeft.lng);

    // scale to current zoom
    mapMatrix = m4.scale(mapMatrix, Math.pow(2, map.getZoom()), 1);

    mapMatrix = m4.translate(mapMatrix, -offset.x, -offset.y, 0);

    if (callback) callback(map, mapMatrix);
  }

  async function pointSwitch(params) {
    if (!params) return;

    const program = createProgram(
      compileShader(require('./shaders/point-state.vertex.glsl'), gl.VERTEX_SHADER),
      compileShader(require('./shaders/point-state.fragment.glsl'), gl.FRAGMENT_SHADER),
    );

    const handler = await require('./renderers/point')(params, { gl, program });

    layer.drawing(() => setup(handler.draw)).redraw();
  }

  return Object.freeze({
    pointSwitch,
  });
}
