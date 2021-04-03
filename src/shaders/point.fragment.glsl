#version 300 es

precision highp float;

uniform sampler2D u_texture;

// declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, gl_PointCoord.xy);
}
