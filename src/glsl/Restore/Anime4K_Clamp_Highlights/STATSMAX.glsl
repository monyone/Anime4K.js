precision mediump float;

uniform sampler2D STATSMAX;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;

varying vec2 v_texture_coord;

#define STATSMAX_pos (v_texture_coord)
#define STATSMAX_tex(pos) (texture2D(STATSMAX, pos))
#define STATSMAX_size (u_texture_size)
#define STATSMAX_pt (1.0 / STATSMAX_size)
#define STATSMAX_texOff(offset) (STATSMAX_tex(STATSMAX_pos + STATSMAX_pt * offset))

#define KERNELSIZE 5 //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE 2 //Half of the kernel size without reSTATSMAXder. Must be equal to trunc(KERNELSIZE/2).

float get_luma(vec4 rgba) {
	return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}

void main() {
	float gmax = 0.0;

	for (int i=0; i<KERNELSIZE; i++) {
		float g = STATSMAX_texOff(vec2(0, i - KERNELHALFSIZE)).x;
		gmax = max(g, gmax);
	}

	gl_FragColor = vec4(gmax, 0.0, 0.0, 0.0);
}