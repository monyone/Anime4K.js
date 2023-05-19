precision mediump float;

uniform sampler2D PREKERNEL;
uniform sampler2D STATSMAX;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;

varying vec2 v_texture_coord;

#define PREKERNEL_pos (v_texture_coord)
#define PREKERNEL_tex(pos) (texture2D(PREKERNEL, pos))
#define PREKERNEL_size (u_texture_size)
#define PREKERNEL_pt (1.0 / PREKERNEL_size)
#define PREKERNEL_texOff(offset) (PREKERNEL_tex(PREKERNEL_pos + PREKERNEL_pt * offset))
#define STATSMAX_pos (v_texture_coord)
#define STATSMAX_tex(pos) (texture2D(STATSMAX, pos))
#define STATSMAX_size (u_texture_size)
#define STATSMAX_pt (1.0 / STATSMAX_size)
#define STATSMAX_texOff(offset) (STATSMAX_tex(STATSMAX_pos + STATSMAX_pt * offset))

float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}

void main() {
	float current_luma = get_luma(PREKERNEL_tex(PREKERNEL_pos));
	float new_luma = min(current_luma, STATSMAX_tex(STATSMAX_pos).x);

	//This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
	//Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  float d = current_luma - new_luma;
  vec4 color = PREKERNEL_tex(PREKERNEL_pos);
  color.rgb -= (current_luma - new_luma) * color.a;
	gl_FragColor = color;
}
