'use strict';

const { getImageObj, makeTexture } = require('../utils');

module.exports = async (params, { gl, program }) => {
  const u_matLoc = gl.getUniformLocation(program, 'u_matrix');

  const textureLocation0 = gl.getUniformLocation(program, 'u_texture_state_0');
  const textureLocation1 = gl.getUniformLocation(program, 'u_texture_state_1');
  const textureLocationdefault = gl.getUniformLocation(program, 'u_texture_state_default');

  const vertLoc = gl.getAttribLocation(program, 'a_vertex');
  const stateLoc = gl.getAttribLocation(program, 'a_state');

  gl.aPointSize = gl.getAttribLocation(program, 'a_point_size');

  let verts = [];

  params.data.forEach((ld, i) => {
    const pixel = leafletMap.project(new L.LatLng(ld.point[0], ld.point[1]), 0);
    const state = ld.icon.includes('positive') ? 1 : 0;

    verts.push(pixel.x, pixel.y, state);
  });

  const numPoints = params.data.length;

  const vertArray = new Float32Array(verts);
  const fsize = vertArray.BYTES_PER_ELEMENT;

  // free memory
  verts = [];
  // -----------------

  const vertBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, fsize*3, 0);
  gl.enableVertexAttribArray(vertLoc);

  gl.vertexAttribPointer(stateLoc, 1, gl.FLOAT, false, fsize*3, fsize*2);
  gl.enableVertexAttribArray(stateLoc);

  const images = [
    await getImageObj('https://smac.climatempo.com.br/img/icons/lightning-historic-negative.png'),
    await getImageObj('https://smac.climatempo.com.br/img/icons/lightning-historic-positive.png'),
    await getImageObj('https://smac.climatempo.com.br/img/icons/lightning.png'),
  ];

  makeTexture(gl, textureLocation0, images[0], 0);
  makeTexture(gl, textureLocation1, images[1], 1);
  makeTexture(gl, textureLocationdefault, images[2], 2);

  return {
    draw: (map, mapMatrix) => draw(gl, u_matLoc, map, mapMatrix, numPoints),
  };
};

function draw(gl, matrixLocation, map, mapMatrix, count) {
  const pointSize = Math.max(map.getZoom() + 5.0, 1.0);
  gl.vertexAttrib1f(gl.aPointSize, pointSize);

  // attach matrix value to uniform in shader
  gl.uniformMatrix4fv(matrixLocation, false, mapMatrix);

  gl.drawArrays(gl.POINTS, 0, count);
}
