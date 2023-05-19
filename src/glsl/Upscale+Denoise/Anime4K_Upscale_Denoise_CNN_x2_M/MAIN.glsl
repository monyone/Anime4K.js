precision mediump float;

uniform sampler2D conv2d_last_tf;
uniform sampler2D MAIN;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;

varying vec2 v_texture_coord;

#define conv2d_last_tf_pos (v_texture_coord)
#define conv2d_last_tf_tex(pos) (texture2D(conv2d_last_tf, pos))
#define conv2d_last_tf_size (u_texture_size)
#define conv2d_last_tf_pt (1.0 / conv2d_last_tf_size)
#define conv2d_last_tf_texOff(offset) (conv2d_last_tf_tex(conv2d_last_tf_pos + conv2d_last_tf_pt * offset))
#define MAIN_pos (v_texture_coord)
#define MAIN_tex(pos) (texture2D(MAIN, pos))
#define MAIN_size (u_texture_size)
#define MAIN_pt (1.0 / MAIN_size)
#define MAIN_texOff(offset) (MAIN_tex(MAIN_pos + MAIN_pt * offset))

void main() {
  vec2 f0 = fract(conv2d_last_tf_pos * conv2d_last_tf_size);
  ivec2 i0 = ivec2(f0 * vec2(1.0));
  float c0 = 0.0;
  if (i0.y * 2 + i0.x == 0) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[0];
  } else if (i0.y * 2 + i0.x == 1) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[1];
  } else if (i0.y * 2 + i0.x == 2) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[2];
  } else if (i0.y * 2 + i0.x == 3) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[3];
  }
  float c1 = c0;
  float c2 = c1;
  float c3 = c2;
  gl_FragColor = vec4(c0, c1, c2, c3) + MAIN_tex(MAIN_pos);
}