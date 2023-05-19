precision mediump float;

uniform sampler2D conv2d_tf;
uniform sampler2D conv2d_1_tf;
uniform sampler2D conv2d_2_tf;
uniform sampler2D conv2d_3_tf;
uniform sampler2D conv2d_4_tf;
uniform sampler2D conv2d_5_tf;
uniform sampler2D conv2d_6_tf;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;

varying vec2 v_texture_coord;

#define conv2d_tf_pos (v_texture_coord)
#define conv2d_tf_tex(pos) (texture2D(conv2d_tf, pos))
#define conv2d_tf_size (u_texture_size)
#define conv2d_tf_pt (1.0 / conv2d_tf_size)
#define conv2d_tf_texOff(offset) (conv2d_tf_tex(conv2d_tf_pos + conv2d_tf_pt * offset))
#define conv2d_1_tf_pos (v_texture_coord)
#define conv2d_1_tf_tex(pos) (texture2D(conv2d_1_tf, pos))
#define conv2d_1_tf_size (u_texture_size)
#define conv2d_1_tf_pt (1.0 / conv2d_1_tf_size)
#define conv2d_1_tf_texOff(offset) (conv2d_1_tf_tex(conv2d_1_tf_pos + conv2d_1_tf_pt * offset))
#define conv2d_2_tf_pos (v_texture_coord)
#define conv2d_2_tf_tex(pos) (texture2D(conv2d_2_tf, pos))
#define conv2d_2_tf_size (u_texture_size)
#define conv2d_2_tf_pt (1.0 / conv2d_2_tf_size)
#define conv2d_2_tf_texOff(offset) (conv2d_2_tf_tex(conv2d_2_tf_pos + conv2d_2_tf_pt * offset))
#define conv2d_3_tf_pos (v_texture_coord)
#define conv2d_3_tf_tex(pos) (texture2D(conv2d_3_tf, pos))
#define conv2d_3_tf_size (u_texture_size)
#define conv2d_3_tf_pt (1.0 / conv2d_3_tf_size)
#define conv2d_3_tf_texOff(offset) (conv2d_3_tf_tex(conv2d_3_tf_pos + conv2d_3_tf_pt * offset))
#define conv2d_4_tf_pos (v_texture_coord)
#define conv2d_4_tf_tex(pos) (texture2D(conv2d_4_tf, pos))
#define conv2d_4_tf_size (u_texture_size)
#define conv2d_4_tf_pt (1.0 / conv2d_4_tf_size)
#define conv2d_4_tf_texOff(offset) (conv2d_4_tf_tex(conv2d_4_tf_pos + conv2d_4_tf_pt * offset))
#define conv2d_5_tf_pos (v_texture_coord)
#define conv2d_5_tf_tex(pos) (texture2D(conv2d_5_tf, pos))
#define conv2d_5_tf_size (u_texture_size)
#define conv2d_5_tf_pt (1.0 / conv2d_5_tf_size)
#define conv2d_5_tf_texOff(offset) (conv2d_5_tf_tex(conv2d_5_tf_pos + conv2d_5_tf_pt * offset))
#define conv2d_6_tf_pos (v_texture_coord)
#define conv2d_6_tf_tex(pos) (texture2D(conv2d_6_tf, pos))
#define conv2d_6_tf_size (u_texture_size)
#define conv2d_6_tf_pt (1.0 / conv2d_6_tf_size)
#define conv2d_6_tf_texOff(offset) (conv2d_6_tf_tex(conv2d_6_tf_pos + conv2d_6_tf_pt * offset))

#define g_0 (max((conv2d_tf_tex(conv2d_tf_pos)), 0.0))
#define g_1 (max(-(conv2d_tf_tex(conv2d_tf_pos)), 0.0))
#define g_2 (max((conv2d_1_tf_tex(conv2d_1_tf_pos)), 0.0))
#define g_3 (max(-(conv2d_1_tf_tex(conv2d_1_tf_pos)), 0.0))
#define g_4 (max((conv2d_2_tf_tex(conv2d_2_tf_pos)), 0.0))
#define g_5 (max(-(conv2d_2_tf_tex(conv2d_2_tf_pos)), 0.0))
#define g_6 (max((conv2d_3_tf_tex(conv2d_3_tf_pos)), 0.0))
#define g_7 (max(-(conv2d_3_tf_tex(conv2d_3_tf_pos)), 0.0))
#define g_8 (max((conv2d_4_tf_tex(conv2d_4_tf_pos)), 0.0))
#define g_9 (max(-(conv2d_4_tf_tex(conv2d_4_tf_pos)), 0.0))
#define g_10 (max((conv2d_5_tf_tex(conv2d_5_tf_pos)), 0.0))
#define g_11 (max(-(conv2d_5_tf_tex(conv2d_5_tf_pos)), 0.0))
#define g_12 (max((conv2d_6_tf_tex(conv2d_6_tf_pos)), 0.0))
#define g_13 (max(-(conv2d_6_tf_tex(conv2d_6_tf_pos)), 0.0))
void main() {
  vec4 result = mat4(0.03795613, 0.09572901, 0.019826923, 0.10568741, -0.0030050736, -0.018890928, 0.0095737, 0.00807826, -0.022741016, 0.0046556294, -0.017018225, -0.010523109, -0.017621946, -0.0006488902, -0.009405731, -0.0027796263) * g_0;
  result += mat4(-0.046617493, -0.018167915, -0.039274286, -0.027566826, -0.015821747, 0.003789104, -0.0020801623, 0.004032968, -0.05708595, -0.018440764, -0.032891296, 0.004184342, 0.047413353, 0.0034510887, 0.019148773, -0.0035636695) * g_1;
  result += mat4(-0.046619494, -0.017274255, -0.03372405, -0.011152855, 0.10981248, 0.036214054, 0.07969624, 0.05590572, -0.031791378, -0.00307391, -0.0032425344, 0.0025762853, 0.0053703627, -0.02076939, -0.00058634114, -0.012593452) * g_2;
  result += mat4(0.110471316, 0.031102506, 0.07860556, -0.018570926, -0.05038586, -0.07667239, -0.0819002, -0.08958284, 0.03846167, -0.007570915, 0.008598097, -0.0082979705, -0.03610172, -0.022735123, 0.02343143, 0.030037913) * g_3;
  result += mat4(-0.075562544, -0.020187575, -0.020969959, 0.0062222136, 0.019780673, 0.059694994, 0.019240001, 0.05951303, 0.004168261, 0.00041100322, -0.0013793377, 0.002048099, -0.040564027, -0.031818517, -0.015498987, -0.02695407) * g_4;
  result += mat4(-0.0016428401, 0.018965026, -0.013192817, -0.008289604, -0.044686675, -0.009061507, -0.049217258, -0.043777503, -0.07308355, -0.063734084, 0.019393511, -0.028853234, 0.057311818, 0.04126226, 0.086301416, 0.11784249) * g_5;
  result += mat4(-0.06087458, 0.046508487, -0.10723279, 0.017619802, 0.13637137, 0.2054238, 0.013641375, 0.091581754, 0.03556439, 0.0500333, 0.0696777, 0.0922045, -0.020914901, -0.025425691, -0.050319638, -0.049094327) * g_6;
  result += mat4(0.0030941095, -0.008679898, -0.05815756, -0.038728733, -0.062450465, -0.073838525, -0.030359933, -0.08355475, -0.039032117, -0.0689333, -0.04834296, -0.079471886, 0.09694701, 0.17491414, 0.093450785, 0.16742545) * g_7;
  result += mat4(0.035618782, -0.027659958, 0.055540156, 0.013073733, 0.12144545, 0.05981087, -0.015131131, -0.0476281, -0.090847984, 0.005347584, 0.015588529, 0.024184622, -0.10743599, -0.01785147, -0.08566232, -0.14611128) * g_8;
  result += mat4(-0.03812077, 0.018126076, -0.016625525, -0.06906415, -0.06267368, -0.058914356, 0.0009385371, -0.026746314, 0.048242237, 0.028906677, -0.028120263, -0.004209134, 0.009636235, 0.013206963, 0.07449269, 0.038961377) * g_9;
  result += mat4(-0.014510558, -0.021065345, 0.09356215, -0.005815953, 0.08807958, 0.067895725, 0.08723713, 0.057831496, -0.10227873, -0.07699344, -0.06321843, -0.07448854, 0.09820774, 0.007563063, -0.14045772, -0.014161681) * g_10;
  result += mat4(-0.18385889, 0.2255883, -0.29741547, 0.14618248, -0.08100661, -0.06860545, -0.112705804, -0.122642964, -0.06736901, 0.06971933, 0.12909706, -0.0418256, -0.32786265, 0.032497127, 0.4390302, 0.032726523) * g_11;
  result += mat4(0.10560793, 0.083280005, -0.20369564, -0.14290833, -0.119196005, -0.028741803, 0.020456403, -0.06509816, 0.073811695, 0.02724128, -0.08691891, 0.10240907, 0.16827166, -0.17502932, -0.18295282, 0.15154512) * g_12;
  result += mat4(0.0036247042, -0.002368346, 0.049646147, 0.058079436, 0.14403848, 0.07125248, 0.040327612, -0.013934329, 0.03871744, -0.1717596, 0.20666012, -0.24093682, -0.09846371, 0.011563227, 0.11973811, -0.0574434) * g_13;
  result += vec4(0.022095086, 0.021079032, 0.030224537, 0.02154015);
  gl_FragColor = result;
}