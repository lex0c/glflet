#version 300 es

uniform mat4 u_matrix;

in vec4 a_vertex;
in float a_point_size;

void main() {
  gl_PointSize = a_point_size;
  gl_Position = u_matrix * a_vertex;
}
