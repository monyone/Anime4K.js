precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texture_coord;

void main() {
  vec4 rgba = texture2D(u_image, v_texture_coord);
  float y = rgba.r * 0.299 + rgba.g * 0.587 + rgba.b * 0.114;
  float u = (rgba.b - y) - 0.565;
  float v = (rgba.r - y) * 0.713;

  gl_FragColor = vec4(y, u, v, 1);
}