#version 300 es

precision highp float;

// retrieve state of vertex
in vec4 v_state;

uniform sampler2D u_texture_state_0;
uniform sampler2D u_texture_state_1;
uniform sampler2D u_texture_state_default;

// declare an output for the fragment shader
out vec4 outColor;

void main() {
  float state = v_state[0];

  if (state == 1.0) {
    outColor = texture(u_texture_state_1, gl_PointCoord.xy);
  } else if (state == 0.0) {
    outColor = texture(u_texture_state_0, gl_PointCoord.xy);
  } else {
    outColor = texture(u_texture_state_default, gl_PointCoord.xy);
  }
}
