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
  vec4 result = mat4(0.020295616, 0.26657984, -0.28531083, 0.041052748, 0.11729335, 0.4042445, -0.5860672, 0.098661005, 0.07756054, 0.32493782, -0.38677853, 0.029859459, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, -1.0);
  result += mat4(-0.28257942, 0.46859467, 0.07703674, -0.05280326, -0.46674755, 0.6592401, 0.28513643, -0.059969574, -0.37685588, 0.54568315, 0.1845521, -0.002367634, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 0.0);
  result += mat4(-0.14898707, -0.088150576, -0.09723321, 0.48359355, -0.27636692, -0.09316871, -0.15453896, 0.68637407, -0.19012338, -0.13310172, -0.13367014, 0.61284137, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 1.0);
  result += mat4(0.36225644, 0.14732021, -0.17000826, -0.039856624, 0.50175637, 0.11733988, -0.080232985, -0.059622094, 0.3199943, 0.14199091, -0.08377198, -0.058804136, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, -1.0);
  result += mat4(0.42444956, -0.7508643, 0.77660984, -0.5920436, 0.6205736, -1.1258985, 0.91925675, -0.854362, 0.5576168, -0.84702957, 0.6147012, -0.7004013, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 0.0);
  result += mat4(0.047896724, -0.018435799, -0.07901341, 0.14234425, 0.12161554, -0.03132901, -0.049536135, 0.16390118, 0.054683182, -0.054823015, -0.019946543, 0.058345634, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 1.0);
  result += mat4(-0.60845935, -0.0062592463, 0.17769416, 0.00643066, -0.8315386, 0.010405371, 0.227901, 0.054893702, -0.63039875, -0.02128892, 0.20843753, 0.054094747, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, -1.0);
  result += mat4(0.24499738, -0.11924165, -0.16513842, -0.012650152, 0.21676576, -0.14322694, -0.08526706, -0.0122355, 0.26050088, -0.115822464, -0.11147918, -0.018665116, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 0.0);
  result += mat4(-0.06054074, 0.094478205, -0.23038268, 0.008782032, -0.028404612, 0.22320247, -0.4821615, -0.0055871494, -0.047503285, 0.15098651, -0.26161456, 0.029869653, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 1.0);
  result += vec4(0.0033260486, 0.0027453774, 0.002706769, -0.0022023292);
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
  vec4 result = mat4(-0.26565167, 0.03297807, 0.08926044, 0.029984077, -0.20809028, 0.00351991, 0.15452495, 0.09963063, -0.13773972, 0.01029457, 0.045066427, 0.1247363, -0.12714206, 0.010659472, -0.06463583, -0.0154152885) * go_0(-1.0, -1.0);
  result += mat4(0.0030874603, -0.04652791, -0.23016497, -0.46789864, 0.16454394, -0.12389561, -0.026154622, -0.008619661, -0.10648254, -0.10581639, 0.038306713, -0.038339432, 0.09716571, -0.037978917, -0.075691506, -0.0712344) * go_0(-1.0, 0.0);
  result += mat4(-0.22059305, 0.18160829, 0.027175324, -0.09482166, -0.07888123, 0.12431242, 0.02432025, -0.121108614, -0.0720631, -0.0138989305, -0.02100737, -0.027440425, -0.06610268, 0.115165174, 0.02048676, -0.0409675) * go_0(-1.0, 1.0);
  result += mat4(-0.043652806, 0.0134993605, 0.0030924282, -0.03314738, 0.27716368, 0.05542831, -0.28217152, -0.017624432, -0.11218036, 0.009025405, -0.13453043, -0.05897923, 0.32378325, -0.0070016393, -0.04415195, 0.10701437) * go_0(0.0, -1.0);
  result += mat4(-0.23568924, 0.028462708, 0.11686719, 0.025355088, -0.088295944, 0.033592343, 0.22703041, 0.45683298, -0.0860751, -0.17487867, -0.048110463, 0.0030137985, -0.031168368, 0.075628504, 0.24791549, 0.13066974) * go_0(0.0, 0.0);
  result += mat4(0.04647855, -0.42392284, -0.19600202, -0.07964123, 0.059082046, -0.16060755, -0.12607971, 0.011384242, 0.021775302, -0.10103477, -0.09646511, -0.0333935, 0.017039102, -0.14098461, -0.0981411, -0.0023695084) * go_0(0.0, 1.0);
  result += mat4(-0.016526148, -0.0006880693, 0.030872462, -0.018204063, -0.025757499, -0.01037187, 0.21834393, 0.09965417, -0.057800297, -0.029975737, -0.00684766, 0.05800057, 0.1683585, -0.057496388, 0.7087625, 0.2665085) * go_0(1.0, -1.0);
  result += mat4(0.059480842, -0.05298332, -0.06537449, -0.06439374, 0.09735456, -0.19591855, -0.42987427, -0.012228564, 0.03898561, -0.22284365, -0.24668825, -0.06651606, -0.087776355, 0.3200755, -0.050433923, -0.100411855) * go_0(1.0, 0.0);
  result += mat4(-0.053572096, 0.16021295, 0.071161, -0.06335539, 0.015909042, 0.20072727, 0.08304887, 0.05335472, -0.03467755, -0.02854195, 0.044690188, 0.0045897495, -0.02924389, 0.16038977, 0.06578487, 0.027916174) * go_0(1.0, 1.0);
  result += mat4(0.11840388, -0.011793132, -0.004042257, -0.116042845, 0.17388786, -0.031351876, -0.1152781, -0.13333467, 0.2354002, -0.045496088, -0.16311322, -0.06960798, 0.11317423, 0.005508318, 0.15634489, 0.061211936) * go_1(-1.0, -1.0);
  result += mat4(0.009622364, 0.03682801, 0.20317583, 0.41673073, 0.00662247, 0.11070694, -0.020392824, 0.13875432, 0.036129113, 0.073727116, -0.114370294, 0.042431634, -0.0446233, 0.0734258, 0.09814352, 0.09335129) * go_1(-1.0, 0.0);
  result += mat4(0.057668976, -0.21368256, -0.029979514, 0.039450984, 0.16685131, -0.15085255, -0.042412136, 0.15757313, 0.110782996, -0.07277766, -0.035268076, 0.06094599, 0.088834405, -0.07145625, 0.0009840949, 0.04932651) * go_1(-1.0, 1.0);
  result += mat4(-0.00010679438, 0.0036139274, -0.001123274, -0.10001404, -0.035231482, -0.008196208, 0.24442215, 0.13503289, -0.082656465, -0.061868448, -0.34716147, -0.22398905, -0.00626325, 0.063109376, 0.10340223, 0.030913284) * go_1(0.0, -1.0);
  result += mat4(-0.11526892, -0.01739956, -0.1781953, -0.27035302, 0.13689406, -0.04320452, -0.19705579, -0.16808036, -0.20343314, -0.13549826, -0.08057608, -0.16109829, 0.16905797, 0.00077912246, -0.14143418, 2.5004636e-05) * go_1(0.0, 0.0);
  result += mat4(-0.110721245, 0.33579257, 0.14410733, -0.06675498, 0.002022071, 0.18419205, 0.09936456, 0.07311257, 0.0064584822, -0.031634383, 0.095907465, 0.031282485, 0.0051860735, 0.25176755, 0.089756206, 0.052209254) * go_1(0.0, 1.0);
  result += mat4(-0.06346731, 0.009824449, -0.02733463, -0.06341941, 0.17385058, 0.0067438814, -0.15083039, -0.09102664, 0.065680414, -0.06668183, -0.18805085, -0.02785943, 0.06386912, 0.09340653, 0.0032584765, 0.060902752) * go_1(1.0, -1.0);
  result += mat4(-0.061221372, -0.0020573896, 0.063335806, 0.046898697, -0.030530764, 0.27301106, 0.23682626, 0.14863367, -0.034555666, 0.024279105, -0.176423, 0.018163674, -0.00015057978, 0.1575829, 0.25034854, 0.054726984) * go_1(1.0, 0.0);
  result += mat4(-0.03807849, -0.0440673, 0.038429137, -0.029738983, 0.035449427, -0.44138825, -0.16462126, -0.015045709, 0.010627751, -0.12178318, -0.07076098, -0.059846148, 0.0009871369, -0.07265447, -0.01998304, -0.018729536) * go_1(1.0, 1.0);
  result += vec4(-0.0016514715, -0.0038319482, -0.0073834592, -0.0059920377);
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
  vec4 result = mat4(0.010651157, 0.0018537974, 0.0051580826, 0.0020901994, -0.41468114, -0.08517094, -0.04803197, 0.008413933, 0.014026587, 0.012820705, 0.01553548, 0.01283508, -0.040812977, -0.015933262, -0.01949977, -0.011502392) * go_0(-1.0, -1.0);
  result += mat4(0.2278103, 0.06374709, 0.062103115, 0.02010158, -0.01932597, 0.01159983, -0.35690293, -0.062822886, 0.29807624, 0.036038283, 0.028565003, -0.025969796, -0.24225195, -0.06635989, -0.06890857, -0.010140013) * go_0(-1.0, 0.0);
  result += mat4(-0.009164529, -0.0036277112, 0.19577485, 0.05511193, 0.025875263, 0.020616682, 0.02919653, 0.030669902, 0.00751339, -0.00551052, 0.2690018, 0.035395138, -0.013392302, -0.03666098, -0.23751089, -0.11222924) * go_0(-1.0, 1.0);
  result += mat4(0.017815048, 0.011143683, -0.002918766, -0.0042153858, -0.01929562, -0.3405707, 0.039267153, 0.0041966257, 0.0026771557, 0.009982735, 0.00087975257, 0.003984122, 0.0062404936, -0.04230462, 0.001981855, -0.0145921325) * go_0(0.0, -1.0);
  result += mat4(-0.02615864, 0.2872578, 0.08103852, 0.11812216, -0.031988684, -0.08532163, -0.094653316, -0.42660478, 0.00077043264, 0.284553, -0.015517693, 0.036667597, 0.14234932, -0.20201443, -0.017204845, -0.111502305) * go_0(0.0, 0.0);
  result += mat4(-0.11529456, -0.09024149, -0.2545015, 0.08581955, -0.020051582, -0.031601675, -0.031320736, -0.051691536, -0.019313173, 0.028963564, 0.017521648, 0.3159018, 0.179573, 0.19400181, 0.382411, 0.076367974) * go_0(0.0, 1.0);
  result += mat4(-0.016741822, -0.001993879, -0.01517403, -0.010949569, 0.01859244, 0.042316843, 0.00025326485, -0.007079785, 0.001070783, 0.000911405, -0.0024269924, -0.0014501393, -0.01206317, 0.007300575, -0.0062582446, -0.0016001783) * go_0(1.0, -1.0);
  result += mat4(-0.06300321, -0.20786348, 0.019603852, 0.020122321, 0.022107193, 0.036766138, 0.013046632, 0.02677947, -0.0006842017, -0.044024136, 0.0109439045, 0.0040129004, 0.009831765, 0.15807834, -0.05166107, -0.014462446) * go_0(1.0, 0.0);
  result += mat4(-0.023205867, -0.049788095, -0.08251341, -0.26488927, 0.0029636251, 0.021618038, -0.0057556895, 0.018444102, 0.0064643323, -0.027886944, 0.010029941, -0.041902024, -0.021232832, -0.0072857663, 0.02056806, 0.18491453) * go_0(1.0, 1.0);
  result += vec4(-0.00016697648, -0.00015957489, 0.00017437353, -0.00019393339);
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

export default class Anime4K_3DGraphics_Upscale_x2_US extends Anime4KShader {
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
