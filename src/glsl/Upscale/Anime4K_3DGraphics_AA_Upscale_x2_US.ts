// MIT License

// Copyright (c) 2019-2021 bloc97
// All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import Anime4KShader from "../shader";
import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../../utils/index";

const vertex_shader = `
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texture_coord;

uniform vec2 u_resolution;

varying vec2 v_texture_coord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, 1), 0, 1);

  v_texture_coord = a_texture_coord;
}
`;
const fragment_0_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D MAIN;
#define MAIN_pos (v_texture_coord)
#define MAIN_tex(pos) (texture2D(MAIN, pos))
#define MAIN_size (u_texture_size)
#define MAIN_pt (1.0 / MAIN_size)
#define MAIN_texOff(offset) (MAIN_tex(MAIN_pos + MAIN_pt * offset))

#define go_0(x_off, y_off) (MAIN_texOff(vec2(x_off, y_off)))
void main() {
  vec4 result = mat4(0.10005958, 0.30363804, -0.24045889, -0.003466652, 0.25860623, 0.47408342, -0.58965975, 0.058167808, 0.17228158, 0.43657768, -0.3982826, -0.022539442, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, -1.0);
  result += mat4(-0.23593923, 0.4692322, 0.04355681, 0.009586428, -0.37485301, 0.5885971, 0.3236714, -0.08301241, -0.3188667, 0.5608897, 0.3396368, 0.059106056, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 0.0);
  result += mat4(-0.15485556, -0.11745722, 0.042440087, 0.5313071, -0.24682014, 0.00033858762, -0.08202063, 0.84100145, -0.15803772, -0.11368423, -0.09765383, 0.6991758, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 1.0);
  result += mat4(0.21323937, 0.07442176, -0.10949712, -0.05313448, 0.44871446, 0.16815953, 0.07202329, -0.05763504, 0.12998791, 0.06934043, 0.044557367, -0.00978054, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, -1.0);
  result += mat4(0.40295616, -0.7156766, 0.7321813, -0.54544497, 0.44781828, -1.1244348, 0.7786728, -0.91297877, 0.52567977, -0.81486106, 0.56867415, -0.68681335, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 0.0);
  result += mat4(0.020084642, -0.072761856, -0.13040084, 0.063976064, 0.18822637, -0.096821584, -0.06842927, 0.18078656, 0.05295053, -0.18540566, -0.1239999, 0.0156137515, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 1.0);
  result += mat4(-0.6254935, 0.0074730455, 0.21930416, 0.028796878, -0.82789946, 0.051125027, 0.25597844, 0.049207535, -0.68400925, -0.015768895, 0.233402, 0.021760475, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, -1.0);
  result += mat4(0.21823564, -0.15992375, -0.14845636, -0.031485636, 0.13821888, -0.27466524, -0.094343, -0.07067512, 0.20875643, -0.20346795, -0.12910774, -0.052383807, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 0.0);
  result += mat4(0.001368614, 0.17603171, -0.36661625, -0.0043979343, 0.1381601, 0.27952382, -0.6743216, 0.0067374213, -0.023204552, 0.21662682, -0.3795221, -0.025739884, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 1.0);
  result += vec4(0.025272772, 0.014345055, -0.009859513, 0.000597734);
  gl_FragColor = result;
}
`;
const fragment_1_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D conv2d_tf;
#define conv2d_tf_pos (v_texture_coord)
#define conv2d_tf_tex(pos) (texture2D(conv2d_tf, pos))
#define conv2d_tf_size (u_texture_size)
#define conv2d_tf_pt (1.0 / conv2d_tf_size)
#define conv2d_tf_texOff(offset) (conv2d_tf_tex(conv2d_tf_pos + conv2d_tf_pt * offset))

#define go_0(x_off, y_off) (max((conv2d_tf_texOff(vec2(x_off, y_off))), 0.0))
#define go_1(x_off, y_off) (max(-(conv2d_tf_texOff(vec2(x_off, y_off))), 0.0))
void main() {
  vec4 result = mat4(-0.08796357, 0.028130328, 0.073414765, -0.029320398, -0.07826724, 0.012752971, 0.06304871, 0.082551956, -0.052348416, 0.010077275, 0.0803755, 0.16395038, -0.08238233, -0.0012038432, -0.1297045, -0.1087021) * go_0(-1.0, -1.0);
  result += mat4(0.044162463, -0.019727755, -0.05845153, -0.23984948, 0.08363732, -0.06774037, 0.0234879, 0.02139741, 0.0028723166, -0.07549135, 0.0744662, 0.109019615, 0.03763121, -0.060664024, -0.03823593, -0.015655363) * go_0(-1.0, 0.0);
  result += mat4(-0.026882887, 0.124355234, -0.005225512, 0.053853527, -0.004761375, 0.07739831, 0.007993726, -0.024238527, -0.035357814, 0.022114292, -0.026158875, 0.047122046, -0.021067293, 0.041959677, 0.008588816, -0.006613815) * go_0(-1.0, 1.0);
  result += mat4(-0.037601672, 0.010898833, 0.05053419, -0.0118405875, 0.052177202, 0.013291429, -0.20246609, -0.07192325, -0.05164381, -0.011278074, -0.12394048, -0.037769064, 0.24392918, 0.03289724, 0.018663784, 0.04071627) * go_0(0.0, -1.0);
  result += mat4(-0.17768572, -0.003431817, 0.024597375, -0.067222916, -0.15119793, -0.049984362, 0.0588867, 0.20031504, -0.028296817, -0.17337173, 0.02136566, 0.07842319, -0.10203611, 0.02128208, 0.20057699, 0.026265312) * go_0(0.0, 0.0);
  result += mat4(-0.018206367, -0.36731398, -0.07842714, -0.08946319, 0.05601789, -0.13398123, -0.09766525, 0.0051633804, -0.004821273, -0.060362365, -0.08751827, -0.01924666, -0.01642196, -0.084792316, -0.021546558, -0.01531331) * go_0(0.0, 1.0);
  result += mat4(-0.003315341, 0.003464535, 0.023609636, -0.029517155, 0.023121882, -0.033598952, 0.032658506, 0.072380014, 0.038630765, -0.020992903, -0.09003304, 0.048244834, 0.17752261, -0.023978172, 0.7178278, 0.09461632) * go_0(1.0, -1.0);
  result += mat4(0.010277829, -0.0462686, -0.024897251, -0.02214524, 0.1262903, -0.15583614, -0.50100106, -0.04074772, 0.0612536, -0.17066137, -0.15715116, -0.020877155, -0.062031068, 0.4314311, -0.008700501, -0.030722365) * go_0(1.0, 0.0);
  result += mat4(-0.12062004, 0.055291675, 0.041176047, -0.034254536, -0.04062085, 0.14750236, 0.100433215, 0.024384778, -0.02506444, -0.0012329774, 0.06715311, 0.013158619, -0.07343181, 0.08929479, 0.015891392, 0.0014893904) * go_0(1.0, 1.0);
  result += mat4(-0.00028356185, 0.008408778, 0.046833538, -0.110735945, 0.050230157, -0.023995856, -0.06471944, -0.12666705, 0.121487044, -0.040447604, -0.13425831, -0.035763647, 0.06327994, 0.04542948, 0.12984566, 0.041735172) * go_1(-1.0, -1.0);
  result += mat4(-0.09654193, 0.055733874, 0.14149562, 0.20103204, -0.04256184, 0.041129943, -0.0997907, 0.030775042, 0.017492702, 0.053436417, -0.13472094, -0.037674613, -0.09461306, 0.07363193, 0.025130237, -0.020962669) * go_1(-1.0, 0.0);
  result += mat4(0.003966979, -0.077911004, -0.025530541, -0.08657802, 0.047928706, -0.12820454, -0.034780253, 0.070523396, 0.0991259, -0.07432318, -0.035848588, 0.026542934, -0.005886989, -0.048655648, 0.014799456, -0.033676937) * go_1(-1.0, 1.0);
  result += mat4(0.0040423325, 0.011639387, 0.014709128, -0.100935176, -0.03094238, -0.0058094636, 0.1256023, 0.086693585, -0.00840243, -0.02635784, -0.2395783, 0.0055595445, -0.104565054, 0.05285065, 0.092289336, 0.12696597) * go_1(0.0, -1.0);
  result += mat4(-0.097862415, 0.035469674, -0.12026435, -0.25865972, 0.12508512, -0.00648921, -0.1848096, -0.24143967, -0.009432349, -0.035211377, -0.05589267, -0.11565712, 0.015937572, 0.02717122, -0.09954979, -0.081140056) * go_1(0.0, 0.0);
  result += mat4(-0.09073428, 0.31426015, 0.087145604, -0.00073830306, 0.013578701, 0.032616604, 0.038264107, 0.07236385, -0.012257218, 0.040580798, 0.08520396, 0.004167174, 0.02280993, 0.113494344, 0.027510444, 0.029490784) * go_1(0.0, 1.0);
  result += mat4(-0.02391937, 0.0039571812, -0.026116686, -0.025334306, 0.06904104, 0.011511556, -0.14147542, 0.01224604, 0.03788813, -0.041387778, -0.1523622, 0.03650455, 0.04693732, 0.03091366, 0.2839756, 0.1779714) * go_1(1.0, -1.0);
  result += mat4(-0.026292996, 0.020397607, 0.09354275, 0.00044126343, -0.047845, 0.11368384, 0.18426466, 0.12002076, -0.034070846, 0.042704806, -0.041553736, 0.04446022, -0.006331844, 0.16227855, 0.07832003, -0.07068554) * go_1(1.0, 0.0);
  result += mat4(-0.026658786, -0.0079359505, -0.04125044, -0.10622727, 0.06254047, -0.36537018, -0.10755624, 0.011665703, 0.025558028, -0.087151, -0.06987865, 0.00023839885, 0.03247968, -0.053188834, -0.004876301, -0.06005079) * go_1(1.0, 1.0);
  result += vec4(-0.012601902, -0.0121468, -0.027073797, -0.0223602);
  gl_FragColor = result;
}
`;
const fragment_2_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D conv2d_1_tf;
#define conv2d_1_tf_pos (v_texture_coord)
#define conv2d_1_tf_tex(pos) (texture2D(conv2d_1_tf, pos))
#define conv2d_1_tf_size (u_texture_size)
#define conv2d_1_tf_pt (1.0 / conv2d_1_tf_size)
#define conv2d_1_tf_texOff(offset) (conv2d_1_tf_tex(conv2d_1_tf_pos + conv2d_1_tf_pt * offset))

#define go_0(x_off, y_off) (max((conv2d_1_tf_texOff(vec2(x_off, y_off))), 0.0))
void main() {
  vec4 result = mat4(-0.00055252935, 0.0011350953, -0.0016148019, 0.0014946404, -0.30635214, -0.017596753, -0.0036547943, 0.016236471, 0.005174489, 0.0030302007, 0.00019672248, 0.0006430973, 0.0007490077, -0.0031795658, -6.158733e-05, 0.0006820584) * go_0(-1.0, -1.0);
  result += mat4(0.15602079, 0.011071071, -0.0027609533, -0.0034318874, -0.0039016667, 0.016504101, -0.27816474, -0.008282344, 0.19063498, 0.012465078, 0.010091085, -0.004841106, -0.11758087, -0.012808949, 0.0067606894, 0.005216566) * go_0(-1.0, 0.0);
  result += mat4(0.013258877, -0.014989483, 0.22402754, 0.013204027, 0.00016207264, -0.00042593342, -0.00333761, -0.0012207513, 0.0033727325, -0.007841196, 0.16044731, 0.00594871, -0.0028581345, 0.012616562, -0.15928285, -0.011812331) * go_0(-1.0, 1.0);
  result += mat4(-0.0048872055, -0.0011780986, -0.0029523429, 0.00082424335, -0.0024385185, -0.26525813, 0.013532772, -0.0008381766, 0.0024996721, 0.0022899017, -0.0017697349, -0.0010618394, 0.0024938583, 0.005421073, 0.0028740794, -0.007808829) * go_0(0.0, -1.0);
  result += mat4(-0.08293415, 0.2659366, -0.010839574, 0.023423964, 0.01725351, -0.009252893, -0.011632222, -0.308242, 0.0001496815, 0.16104282, -0.0069378703, 0.00842848, 0.085917845, -0.18407243, -0.006601597, -0.027134055) * go_0(0.0, 0.0);
  result += mat4(-0.033873428, -0.011743531, -0.230377, 0.116242796, -0.0018527015, -0.00853698, 0.0059901997, -0.006155517, -0.009841329, 0.006163952, 0.014816026, 0.18667653, 0.016977048, -0.0017093032, 0.19695279, -0.061764043) * go_0(0.0, 1.0);
  result += mat4(-0.0003514533, -0.0069080726, 0.0052108583, -0.0016346197, -0.0016860099, 0.006002445, -0.0022835485, -0.0028219873, 0.0005367275, 0.0005437954, 0.00059865275, -0.00014915364, -0.0032214937, -0.00052043283, -0.0031621973, 0.0055843857) * go_0(1.0, -1.0);
  result += mat4(-0.006905302, -0.20389622, 0.01891904, -0.018114902, 0.00724176, 0.011335843, -0.0028616642, 0.016452003, -0.00013852821, -0.00039706306, 0.0011838446, 0.0028873065, 0.012857878, 0.16889338, -0.014114007, 0.009388666) * go_0(1.0, 0.0);
  result += mat4(0.0040798862, 0.002933288, -0.016012201, -0.14650294, -0.0017411204, 0.0017980475, 0.00056705566, -0.0003218331, -0.0014291195, -0.0062614805, 0.00082543516, -0.00397049, -0.004496662, 0.0008032309, 0.0049529593, 0.117166765) * go_0(1.0, 1.0);
  result += vec4(-3.1127936e-05, 3.3726166e-05, 4.8580805e-05, -9.541029e-06);
  gl_FragColor = result;
}
`;
const fragment_3_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D MAIN;
#define MAIN_pos (v_texture_coord)
#define MAIN_tex(pos) (texture2D(MAIN, pos))
#define MAIN_size (u_texture_size)
#define MAIN_pt (1.0 / MAIN_size)
#define MAIN_texOff(offset) (MAIN_tex(MAIN_pos + MAIN_pt * offset))

uniform sampler2D conv2d_last_tf;
#define conv2d_last_tf_pos (v_texture_coord)
#define conv2d_last_tf_tex(pos) (texture2D(conv2d_last_tf, pos))
#define conv2d_last_tf_size (u_texture_size)
#define conv2d_last_tf_pt (1.0 / conv2d_last_tf_size)
#define conv2d_last_tf_texOff(offset) (conv2d_last_tf_tex(conv2d_last_tf_pos + conv2d_last_tf_pt * offset))

void main() {
  vec2 f0 = fract(conv2d_last_tf_pos * conv2d_last_tf_size);
  ivec2 i0 = ivec2(f0 * vec2(2.0));
  float c0 = 0.0;
  if (i0.y * 2 + i0.x == 0) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[0];
  } else if (i0.y * 2 + i0.x == 1) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[1];
  } else if (i0.y * 2 + i0.x == 2) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[2];
  } else if (i0.y * 2 + i0.x == 3) {
    c0 = conv2d_last_tf_tex((vec2(0.5) - f0) * conv2d_last_tf_pt + conv2d_last_tf_pos)[3];
  };
  float c1 = c0;
  float c2 = c1;
  float c3 = 0.0;
  gl_FragColor = vec4(c0, c1, c2, c3) + MAIN_tex(MAIN_pos);
}
`;

export default class Anime4K_3DGraphics_AA_Upscale_x2_US extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;
  private program_0_intermediate_texture: WebGLProgram;
  private program_1_intermediate_texture: WebGLProgram;
  private program_2_intermediate_texture: WebGLProgram;
  private program_3_intermediate_texture: WebGLProgram;
  private program_0_a_position_location: number;
  private program_1_a_position_location: number;
  private program_2_a_position_location: number;
  private program_3_a_position_location: number;
  private program_0_a_texture_coord_location: number;
  private program_1_a_texture_coord_location: number;
  private program_2_a_texture_coord_location: number;
  private program_3_a_texture_coord_location: number;
  private program_0_u_resolution_location: WebGLUniformLocation | null;
  private program_1_u_resolution_location: WebGLUniformLocation | null;
  private program_2_u_resolution_location: WebGLUniformLocation | null;
  private program_3_u_resolution_location: WebGLUniformLocation | null;
  private program_0_u_texture_size_location: WebGLUniformLocation | null;
  private program_1_u_texture_size_location: WebGLUniformLocation | null;
  private program_2_u_texture_size_location: WebGLUniformLocation | null;
  private program_3_u_texture_size_location: WebGLUniformLocation | null;
  private program_0_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_1_conv2d_tf_TextureLocation: WebGLUniformLocation | null
  private program_2_conv2d_1_tf_TextureLocation: WebGLUniformLocation | null
  private program_3_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_3_conv2d_last_tf_TextureLocation: WebGLUniformLocation | null


  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_3 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_3_shader)!)!;
    this.program_0_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_1_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_2_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_3_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_0_a_position_location = gl.getAttribLocation(this.program_0, "a_position");
    gl.enableVertexAttribArray(this.program_0_a_position_location);
    this.program_1_a_position_location = gl.getAttribLocation(this.program_1, "a_position");
    gl.enableVertexAttribArray(this.program_1_a_position_location);
    this.program_2_a_position_location = gl.getAttribLocation(this.program_2, "a_position");
    gl.enableVertexAttribArray(this.program_2_a_position_location);
    this.program_3_a_position_location = gl.getAttribLocation(this.program_3, "a_position");
    gl.enableVertexAttribArray(this.program_3_a_position_location);
    this.program_0_a_texture_coord_location = gl.getAttribLocation(this.program_0, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_0_a_texture_coord_location);
    this.program_1_a_texture_coord_location = gl.getAttribLocation(this.program_1, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_1_a_texture_coord_location);
    this.program_2_a_texture_coord_location = gl.getAttribLocation(this.program_2, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_2_a_texture_coord_location);
    this.program_3_a_texture_coord_location = gl.getAttribLocation(this.program_3, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_3_a_texture_coord_location);
    this.program_0_u_resolution_location = gl.getUniformLocation(this.program_0, "u_resolution");
    this.program_1_u_resolution_location = gl.getUniformLocation(this.program_1, "u_resolution");
    this.program_2_u_resolution_location = gl.getUniformLocation(this.program_2, "u_resolution");
    this.program_3_u_resolution_location = gl.getUniformLocation(this.program_3, "u_resolution");
    this.program_0_u_texture_size_location = gl.getUniformLocation(this.program_0, "u_texture_size");
    this.program_1_u_texture_size_location = gl.getUniformLocation(this.program_1, "u_texture_size");
    this.program_2_u_texture_size_location = gl.getUniformLocation(this.program_2, "u_texture_size");
    this.program_3_u_texture_size_location = gl.getUniformLocation(this.program_3, "u_texture_size");
    this.program_0_MAIN_TextureLocation = gl.getUniformLocation(this.program_0, "MAIN")
    this.program_1_conv2d_tf_TextureLocation = gl.getUniformLocation(this.program_1, "conv2d_tf")
    this.program_2_conv2d_1_tf_TextureLocation = gl.getUniformLocation(this.program_2, "conv2d_1_tf")
    this.program_3_MAIN_TextureLocation = gl.getUniformLocation(this.program_3, "MAIN")
    this.program_3_conv2d_last_tf_TextureLocation = gl.getUniformLocation(this.program_3, "conv2d_last_tf")
  }

  public hook_MAIN(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = this.program_0_intermediate_texture;
        fillEmptyTexture(gl, output, MAIN.width, MAIN.height);
        gl.viewport(0, 0, MAIN.width, MAIN.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_0);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, MAIN.width, MAIN.height)!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_0_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_0_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_0_u_resolution_location, MAIN.width, MAIN.height);
        gl.uniform2f(this.program_0_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_0_MAIN_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('conv2d_tf', { texture: output, width: MAIN.width, height: MAIN.height});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      const conv2d_tf = textures.get('conv2d_tf');
      if (!conv2d_tf) { return; }
     {
        const output = this.program_1_intermediate_texture;
        fillEmptyTexture(gl, output, conv2d_tf.width, conv2d_tf.height);
        gl.viewport(0, 0, conv2d_tf.width, conv2d_tf.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, conv2d_tf.width, conv2d_tf.height)!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_1_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_1_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_1_u_resolution_location, conv2d_tf.width, conv2d_tf.height);
        gl.uniform2f(this.program_1_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, conv2d_tf.texture);
        gl.uniform1i(this.program_1_conv2d_tf_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('conv2d_1_tf', { texture: output, width: conv2d_tf.width, height: conv2d_tf.height});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      const conv2d_1_tf = textures.get('conv2d_1_tf');
      if (!conv2d_1_tf) { return; }
     {
        const output = this.program_2_intermediate_texture;
        fillEmptyTexture(gl, output, conv2d_1_tf.width, conv2d_1_tf.height);
        gl.viewport(0, 0, conv2d_1_tf.width, conv2d_1_tf.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, conv2d_1_tf.width, conv2d_1_tf.height)!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_2_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_2_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_2_u_resolution_location, conv2d_1_tf.width, conv2d_1_tf.height);
        gl.uniform2f(this.program_2_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, conv2d_1_tf.texture);
        gl.uniform1i(this.program_2_conv2d_1_tf_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('conv2d_last_tf', { texture: output, width: conv2d_1_tf.width, height: conv2d_1_tf.height});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      const conv2d_last_tf = textures.get('conv2d_last_tf');
      if (!conv2d_last_tf) { return; }
     {
        const output = this.program_3_intermediate_texture;
        fillEmptyTexture(gl, output, (conv2d_last_tf.width * 2), (conv2d_last_tf.height * 2));
        gl.viewport(0, 0, (conv2d_last_tf.width * 2), (conv2d_last_tf.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (conv2d_last_tf.width * 2), (conv2d_last_tf.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_3_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_3_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_3_u_resolution_location, (conv2d_last_tf.width * 2), (conv2d_last_tf.height * 2));
        gl.uniform2f(this.program_3_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_3_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, conv2d_last_tf.texture);
        gl.uniform1i(this.program_3_conv2d_last_tf_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('MAIN', { texture: output, width: (conv2d_last_tf.width * 2), height: (conv2d_last_tf.height * 2)});
      }
    }
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;

  }
}
