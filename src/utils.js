'use strict';

/**
 * create image object
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
  const sinLatitude = Math.sin(latitude * (Math.PI / 180.0));

  return {
    x: ((longitude + 180) / 360) * 256,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (Math.PI * 4)) * 256,
  };
}

module.exports = {
  getImageObj,
  makeTexture,
  latlngToPixel,
};
