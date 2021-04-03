'use strict';

/**
 *
 */
function getImageObj(url) {
  return new Promise(resolve => {
    const image = new Image();

    image.crossOrigin = 'Anonymous';

    image.onload = function() {
      resolve(image);
    }

    image.src = url;
  });
}

/**
 * copy image into the texture
 */
function makeTexture(gl, textureLocation, sprite, index) {
  const texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + index);

  gl.uniform1i(textureLocation, index);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sprite);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
}

/**
 * converts lat/lng to pixel
 * reference: http://build-failed.blogspot.cz/2013/02/displaying-webgl-data-on-google-maps.html
 */
function latlngToPixel(latitude, longitude) {
  const pi_180 = Math.PI / 180.0;
  const pi_4 = Math.PI * 4;
  const sinLatitude = Math.sin(latitude * pi_180);
  const pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
  const pixelX = ((longitude + 180) / 360) * 256;

  const pixel = { x: pixelX, y: pixelY };

  return pixel;
}

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl, source, type) {
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
function createProgram(gl, vertexShader, fragmentShader) {
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

module.exports = {
  getImageObj,
  makeTexture,
  latlngToPixel,
  compileShader,
  createProgram,
};
