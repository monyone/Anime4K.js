precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texture_coord;

void main() {
  vec4 rgba = texture2D(u_image, v_texture_coord);
  gl_FragColor = vec4(
    pow(rgba.r, 1.0 / 2.2),
    pow(rgba.g, 1.0 / 2.2),
    pow(rgba.b, 1.0 / 2.2),
    rgba.a
  );
}