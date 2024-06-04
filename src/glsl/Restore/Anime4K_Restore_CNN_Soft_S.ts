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
  vec4 result = mat4(0.10922428, -0.16249932, 0.15452726, -0.15669551, 0.053448875, -0.16528402, 0.01697721, -0.049275912, 0.20947173, -0.10576949, 0.19738325, -0.025417482, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, -1.0);
  result += mat4(-0.3285196, 0.15909512, -0.5273671, 0.23778777, -0.40508887, -0.0609677, -0.4188177, 0.11137456, -0.24131267, 0.10453423, -0.36216277, 0.053446792, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 0.0);
  result += mat4(0.23072472, -0.082083695, -0.0041477727, -0.09136237, 0.11958912, -0.312698, -0.15842685, -0.013882424, 0.10933724, 0.017880991, -0.022167003, 0.014662608, 0.0, 0.0, 0.0, 0.0) * go_0(-1.0, 1.0);
  result += mat4(-0.2789985, 0.054727737, 0.22577816, -0.49625716, -0.48472273, -0.011525487, 0.5354349, -0.08814955, -0.27021924, -0.044563178, 0.008232271, -0.13480483, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, -1.0);
  result += mat4(-0.18203105, 0.09277001, 0.27071548, -0.17773713, -0.4335171, 1.2275106, -0.07663438, -0.29020032, 0.011992759, 0.060106967, 0.11002492, -0.046098012, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 0.0);
  result += mat4(0.08363418, 0.063420765, -0.10278259, 0.09357691, 0.38670546, 0.13577081, 0.048631024, -0.024960777, 0.0846784, -0.057097007, 0.06049236, 0.042082917, 0.0, 0.0, 0.0, 0.0) * go_0(0.0, 1.0);
  result += mat4(0.12315548, -0.056513585, -0.09826642, -0.17079762, 0.06479095, -0.36984903, -0.12512982, 0.042867575, 0.08360464, 0.12835538, -0.005067881, 0.02542005, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, -1.0);
  result += mat4(0.18997705, 0.086363226, -0.0007131526, 0.19858918, 0.39745626, -0.0090341605, 0.27864447, 0.20052041, 0.010576528, -0.089242525, -0.025109483, -0.030768145, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 0.0);
  result += mat4(0.05427315, -0.060894873, 0.06548642, 0.095537595, 0.29116166, -0.16159569, -0.13293959, -0.112566955, 0.0059667625, 0.016041303, 0.03831561, 0.09869594, 0.0, 0.0, 0.0, 0.0) * go_0(1.0, 1.0);
  result += vec4(0.0113532655, -0.06449327, 0.035503868, 0.5683031);
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
  vec4 result = mat4(-0.027102098, 0.2640691, 0.1169015, 0.030902913, 0.15404584, 0.1361459, -0.38066056, 0.096569136, -0.111836195, -0.0051853824, -0.0996669, -0.23538585, -0.07060754, -0.18889332, -0.10793357, -0.15154232) * go_0(-1.0, -1.0);
  result += mat4(0.1378689, 0.21024452, 0.010976513, 0.0179521, -0.05993059, -0.28364083, 0.24486947, 0.21347582, -0.12522404, -0.16091396, 0.15499291, 0.08353191, -0.03342411, -0.08964405, 0.25111282, -0.07550899) * go_0(-1.0, 0.0);
  result += mat4(-0.06398718, 0.05763278, 0.021394925, 0.14780094, -0.033050716, 0.03346528, -0.0846797, 0.0125302235, 0.18018652, 0.24586707, 0.050538495, 0.09879243, -0.100035876, 0.043505374, 0.042692907, -0.08768257) * go_0(-1.0, 1.0);
  result += mat4(-0.11572878, 0.0545887, 0.16437739, 0.2775331, 0.10323911, -0.18938646, -0.17097469, -0.188723, 0.085762165, 0.14605838, -0.15568069, -0.16947642, 0.09042493, -0.087587915, -0.041969277, 0.27252352) * go_0(0.0, -1.0);
  result += mat4(0.21475963, -0.018211678, -0.5711054, -0.09235345, -0.20367791, -0.23041399, 0.16346097, 0.007901888, 0.12542121, 0.16807431, 0.09862575, 0.16968751, 0.28490388, 0.40945014, -0.22364445, 0.14460565) * go_0(0.0, 0.0);
  result += mat4(0.27512726, 0.14046481, -0.17684339, 0.102218024, -0.10503195, 0.3080809, 0.03681373, 0.2668656, -0.093752496, -0.07476867, 0.19900662, 0.06028286, -0.19815882, -0.0584525, 0.027984729, -0.02143819) * go_0(0.0, 1.0);
  result += mat4(-0.16829525, -0.06818115, 0.0006509334, 0.01163159, 0.18918815, -0.10731989, -0.008126929, -0.47991323, -0.11022971, 0.19150843, 0.05272113, -0.34417602, 0.022882428, 0.1774031, 0.062597334, -0.09915319) * go_0(1.0, -1.0);
  result += mat4(0.32131585, 0.05668815, -0.34203658, 0.05542482, -0.008077225, 0.009148517, 0.10953332, -0.050969962, 0.09904077, 0.46938205, -0.5148919, -0.22275375, -0.10536104, -0.23662373, 0.002147416, -0.14256701) * go_0(1.0, 0.0);
  result += mat4(-0.19335353, -0.103732094, 0.17156832, 0.0059756916, -0.118641876, 0.14529023, -0.18662338, 0.0447326, 0.026719248, 0.042491894, 0.026437795, 0.05601309, 0.08645617, 0.08365193, -0.039582565, 0.16612953) * go_0(1.0, 1.0);
  result += mat4(-0.014315469, 0.012588422, 0.037587024, 0.08707526, -0.08064868, -0.28149533, 0.27326405, 0.21468583, -0.04278333, 0.29369017, 0.18653142, 0.035729136, 0.079363555, 0.30725953, 0.0147137, 0.08527481) * go_1(-1.0, -1.0);
  result += mat4(0.06659263, 0.03452449, -0.33752796, 0.0066543026, 0.48697233, 0.019602561, -0.32033685, -0.20538871, 0.3089118, 0.4315903, -0.13524854, -0.10791581, 0.3315688, 0.13135147, -0.26904663, 0.142365) * go_1(-1.0, 0.0);
  result += mat4(0.13619833, 0.045271892, -0.029841429, 0.010704955, -0.29257727, -0.10563375, 0.35345638, -0.06734038, -0.043791633, -0.0056891907, -0.078411415, 0.075443126, -0.05746597, -0.19959894, -0.12797245, 0.18837726) * go_1(-1.0, 1.0);
  result += mat4(0.25673476, 0.120482095, -0.23827696, -0.13557845, 0.300447, -0.3008584, -0.13834439, 0.5459493, -0.26155484, 0.06905137, 0.16247983, 0.039960653, -0.023218757, 0.07977591, -0.11354706, -0.25831422) * go_1(0.0, -1.0);
  result += mat4(0.0842605, 0.282916, 0.14062001, 0.06356874, 0.55912817, 0.1743876, -0.30324093, 0.052068707, -0.20756413, 0.27321506, -0.26560605, -0.27695876, -0.3927334, -0.5439608, 0.39293098, -0.001130203) * go_1(0.0, 0.0);
  result += mat4(-0.021890296, -0.12703396, 0.06660714, -0.03164527, 0.0018722567, -0.26552317, 0.06978973, -0.24030049, 0.46008193, 0.5595346, 0.081981994, -0.038414747, -0.010446991, -0.56102365, -0.079274766, -0.01851302) * go_1(0.0, 1.0);
  result += mat4(0.052988984, 0.030581746, -0.06868741, 0.21545182, -0.5706256, -0.0034910638, 0.48361364, 0.9020033, -0.02242781, -0.13256042, 0.08997955, 0.21001706, -0.059571438, -0.040119104, -0.05029196, -0.127414) * go_1(1.0, -1.0);
  result += mat4(-0.08275339, -0.05999088, 0.11068767, 0.014646892, -0.041986465, 0.1028236, -0.17218924, 0.026559748, -0.17412743, -0.38364175, 0.17410514, 0.13038695, 0.23155633, 0.2655843, 0.045085523, 0.13005458) * go_1(1.0, 0.0);
  result += mat4(-0.013383197, -0.064526096, 0.049046878, 0.015992291, 0.123987064, 0.0104690585, 0.07065378, -0.009824511, -0.036109775, 0.13384768, 0.29676288, -0.39475223, -0.009368096, -0.05666906, -0.09132696, -0.082638375) * go_1(1.0, 1.0);
  result += vec4(-0.106538564, -0.065693766, -0.03790106, 0.04776706);
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
#define go_1(x_off, y_off) (max(-(conv2d_1_tf_texOff(vec2(x_off, y_off))), 0.0))
void main() {
  vec4 result = mat4(0.024004154, -0.26474997, -0.5256586, 0.051624652, -0.16621786, 0.2964122, 0.6044247, -0.14335106, 0.17002718, -0.2679876, -0.30162668, 0.1273794, -0.17601459, -0.1782376, 0.104725115, -0.16351137) * go_0(-1.0, -1.0);
  result += mat4(-0.121676154, 0.047741555, -0.06738679, -0.056402843, 0.004424971, -0.35099635, -0.073440626, 0.039784692, 0.15204315, -0.1165704, 0.11231046, -0.27369732, 0.33737272, -0.11880767, 0.09637475, -0.14709689) * go_0(-1.0, 0.0);
  result += mat4(-0.017987821, -0.08798823, -0.062515825, -0.046803873, -0.05871703, 0.27013004, 0.19397618, -0.052147817, 0.003271283, -0.0029015478, -0.07390092, -0.09348337, -0.1574738, 0.06750957, -0.07661155, 0.054327156) * go_0(-1.0, 1.0);
  result += mat4(-0.15215784, -0.72508365, -0.3202069, 0.20295432, -0.19125701, 0.021401431, -0.051837035, -0.025939213, 0.25565025, -0.12872623, 0.13169816, 0.27377388, -0.008718429, -0.05864064, 0.028844763, 0.1144993) * go_0(0.0, -1.0);
  result += mat4(-0.30012092, -0.1322455, -0.11868545, 0.09857058, 0.082795605, -0.075334676, -0.3752773, -0.02918163, -0.67764, -0.38598236, -0.21023573, 0.38274166, -0.07398165, -0.07213789, -0.28427607, 0.1266569) * go_0(0.0, 0.0);
  result += mat4(-0.37507388, 0.18809201, -0.21982779, 0.27208912, 0.022066567, -0.27627763, 0.12345216, -0.30041683, 0.017002959, -0.091398515, -0.25207692, -0.29253414, -0.08231422, -0.14665812, -0.07868529, -0.24562219) * go_0(0.0, 1.0);
  result += mat4(0.08686712, 0.080837384, 0.20736577, 0.008233064, 0.14957365, 0.21801959, -0.04870689, 0.42149112, 0.27255878, 0.33320278, -0.08467146, 0.10381615, 0.055278245, 0.085710146, 0.009097151, 0.29092705) * go_0(1.0, -1.0);
  result += mat4(0.0012207404, -0.023874281, -0.027035477, 0.005157451, 0.19330226, 0.33711615, -0.16495204, 0.549021, 0.44879642, 0.1978837, -0.20492741, 0.28099406, 0.2631811, 0.40786585, -0.055340275, 0.2575511) * go_0(1.0, 0.0);
  result += mat4(0.29127392, -0.06287165, 0.12715077, 0.14784902, -0.3183704, 0.42057636, -0.11483724, -0.3019506, 0.010730576, 0.29091576, -0.046116166, -0.23528357, -0.0037143505, 0.1191774, -0.06084074, 0.011641706) * go_0(1.0, 1.0);
  result += mat4(-0.2579205, 0.036545023, 0.11691888, 0.04996418, 0.21318026, 0.21370813, -0.14114271, 0.031217605, -0.06979331, -0.0690704, 0.04618086, 0.025164584, -0.10994228, 0.109930746, 0.103678934, 0.12193115) * go_1(-1.0, -1.0);
  result += mat4(-0.19843774, -0.11237926, 0.007291354, 0.16480611, -0.15669724, 0.46283355, 0.077065215, 0.112273656, 0.17143534, -0.19934891, -0.25481275, 0.034591813, -0.27032652, -0.2702769, 0.04816228, -0.031614583) * go_1(-1.0, 0.0);
  result += mat4(-0.16307239, -0.11295217, 0.05861256, 0.14225823, -0.015648091, 0.11741865, 0.113366075, 0.023935538, 0.19560932, -0.10553561, -0.042583376, -0.048160724, -0.3116519, 0.13957061, -0.0044852323, -0.015472912) * go_1(-1.0, 1.0);
  result += mat4(-0.15629178, 0.06463271, -0.13176678, 0.025518289, -0.021733627, 0.22236359, 0.019508492, -0.11629477, 0.10801276, -0.021957984, -0.11272639, -0.03615053, -0.121420704, 0.2520835, 0.043395765, 0.1699031) * go_1(0.0, -1.0);
  result += mat4(0.2886654, 0.21755892, 0.21757497, 0.08442575, -0.109903164, -0.67295986, 0.22886126, -0.027185453, 0.3761606, 0.23199768, 0.05908783, -0.1496158, 0.10832971, -0.3530352, 0.20234483, -0.07615918) * go_1(0.0, 0.0);
  result += mat4(0.11043024, 0.18943349, 0.42394367, 0.029350199, -0.15085667, 0.020204183, -0.081609115, 0.07907012, 0.33805525, 0.0066280114, 0.0018284445, 0.022983696, 0.004984607, 0.0429299, -0.14568979, -0.29143327) * go_1(0.0, 1.0);
  result += mat4(-0.16376027, -0.20387048, 0.06522074, 0.17484841, -0.13885716, -0.04380927, -0.03535832, -0.16978237, -0.004799155, -0.25407305, -0.039976966, -0.011992087, -0.22535577, -0.09583549, 0.0334331, 0.016292758) * go_1(1.0, -1.0);
  result += mat4(-0.38688713, -0.20232083, 0.23887886, -0.10438324, -0.24170811, -0.074868314, 0.03977399, -0.22810821, -0.08257971, -0.11902456, 0.106009185, -0.078289054, -0.11932821, 0.024207884, 0.10070917, 0.79348284) * go_1(1.0, 0.0);
  result += mat4(-0.4018743, 0.050456528, 0.035341598, -0.03788609, 0.12964934, -0.44461823, 0.029031694, 0.29604837, -0.102386944, -0.13805065, 0.0055692918, 0.14659804, -0.22499937, 0.14680648, -0.3443954, -0.06994176) * go_1(1.0, 1.0);
  result += vec4(-0.0063428865, 0.0057986965, -0.12526293, -0.059240736);
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

uniform sampler2D conv2d_2_tf;
#define conv2d_2_tf_pos (v_texture_coord)
#define conv2d_2_tf_tex(pos) (texture2D(conv2d_2_tf, pos))
#define conv2d_2_tf_size (u_texture_size)
#define conv2d_2_tf_pt (1.0 / conv2d_2_tf_size)
#define conv2d_2_tf_texOff(offset) (conv2d_2_tf_tex(conv2d_2_tf_pos + conv2d_2_tf_pt * offset))

#define go_0(x_off, y_off) (max((conv2d_2_tf_texOff(vec2(x_off, y_off))), 0.0))
#define go_1(x_off, y_off) (max(-(conv2d_2_tf_texOff(vec2(x_off, y_off))), 0.0))
void main() {
  vec4 result = mat4(0.08631539, 0.09499331, 0.065609254, 0.0, -0.023760278, -0.027293118, -0.022839671, 0.0, -0.012447854, -0.008565141, -0.012041815, 0.0, -0.033292875, -0.031266093, -0.02874347, 0.0) * go_0(-1.0, -1.0);
  result += mat4(0.08709062, 0.09760889, 0.08988583, 0.0, -0.09099671, -0.102120616, -0.098076016, 0.0, 0.057814583, 0.06999608, 0.05961344, 0.0, 0.12246188, 0.1319784, 0.12254915, 0.0) * go_0(-1.0, 0.0);
  result += mat4(0.07694916, 0.0822054, 0.07549296, 0.0, -0.046808865, -0.051509347, -0.035890795, 0.0, 0.01599848, 0.014677793, 0.0086143715, 0.0, 0.033142705, 0.0426565, 0.035911378, 0.0) * go_0(-1.0, 1.0);
  result += mat4(-0.0008269902, 0.0009082343, 0.014101725, 0.0, 0.0006387551, 0.005079344, -0.013034868, 0.0, 0.013909732, 0.011026747, 0.012485332, 0.0, 0.027028518, 0.022164145, 0.03183532, 0.0) * go_0(0.0, -1.0);
  result += mat4(-0.33575395, -0.36700967, -0.34140685, 0.0, 0.35850254, 0.37535715, 0.34613726, 0.0, -0.12680013, -0.1256115, -0.112494245, 0.0, -0.061541136, -0.059120018, -0.06552594, 0.0) * go_0(0.0, 0.0);
  result += mat4(-0.047570463, -0.050335366, -0.04665491, 0.0, -0.110970475, -0.12363716, -0.11072252, 0.0, 0.041563414, 0.059771337, 0.045290247, 0.0, -0.17999935, -0.19700716, -0.17459513, 0.0) * go_0(0.0, 1.0);
  result += mat4(0.078488424, 0.07483357, 0.08347933, 0.0, -0.0063715233, 0.00035415235, -0.010886946, 0.0, 0.031237155, 0.02512343, 0.034399323, 0.0, -0.023146842, -0.026732154, -0.027644241, 0.0) * go_0(1.0, -1.0);
  result += mat4(-0.05906883, -0.06784104, -0.04506148, 0.0, -0.003939601, -0.0011749315, -0.006256036, 0.0, -0.1662408, -0.16871658, -0.16598499, 0.0, 0.051277652, 0.04837499, 0.05120855, 0.0) * go_0(1.0, 0.0);
  result += mat4(0.08158806, 0.08674548, 0.07437206, 0.0, -0.05765347, -0.06196418, -0.057311118, 0.0, 0.26747537, 0.2668808, 0.2389857, 0.0, -0.010376844, -0.01690028, -0.008414153, 0.0) * go_0(1.0, 1.0);
  result += mat4(0.030539425, 0.02415435, 0.039969034, 0.0, 0.006491679, 0.014436586, 0.005435709, 0.0, -0.0058292216, -0.013982021, -0.011243379, 0.0, 0.025942149, 0.015361476, 0.019134998, 0.0) * go_1(-1.0, -1.0);
  result += mat4(-0.06322247, -0.07146787, -0.06673042, 0.0, 0.028702464, 0.039047733, 0.039646607, 0.0, -0.072553575, -0.08046175, -0.07027197, 0.0, -0.1447189, -0.1539398, -0.1466465, 0.0) * go_1(-1.0, 0.0);
  result += mat4(-0.046430312, -0.054549117, -0.048076343, 0.0, 0.032971155, 0.02980819, 0.029172963, 0.0, -0.017612953, -0.015100736, -0.01202649, 0.0, -0.026717246, -0.028401854, -0.034548033, 0.0) * go_1(-1.0, 1.0);
  result += mat4(-0.0020459262, -0.0008748501, -0.012601956, 0.0, 0.0054226154, 0.008867029, 0.018921215, 0.0, -0.0021330053, -0.0036601655, -0.0022091097, 0.0, -0.08636891, -0.10203159, -0.09741449, 0.0) * go_1(0.0, -1.0);
  result += mat4(0.07306159, 0.08245483, 0.06548199, 0.0, -0.1933229, -0.20326294, -0.19189309, 0.0, 0.107496604, 0.11584994, 0.10907522, 0.0, 0.30877885, 0.31297725, 0.30890995, 0.0) * go_1(0.0, 0.0);
  result += mat4(0.03192904, 0.035112645, 0.033732817, 0.0, 0.074100636, 0.08349646, 0.06659352, 0.0, -0.1136165, -0.12470947, -0.11192198, 0.0, 0.14465587, 0.16328491, 0.13984151, 0.0) * go_1(0.0, 1.0);
  result += mat4(-0.05098033, -0.053096622, -0.05533725, 0.0, 0.0045651463, -0.007682458, 0.0026934785, 0.0, -0.021199327, -0.016210148, -0.030939564, 0.0, -0.031621892, -0.046702545, -0.02647333, 0.0) * go_1(1.0, -1.0);
  result += mat4(0.055801813, 0.06430485, 0.05052402, 0.0, 0.0241233, 0.013879883, 0.017344628, 0.0, 0.08707151, 0.10031039, 0.095042154, 0.0, -0.109053336, -0.11414017, -0.111838564, 0.0) * go_1(1.0, 0.0);
  result += mat4(0.030582374, 0.03604719, 0.040417343, 0.0, 0.038665913, 0.036998056, 0.030004544, 0.0, 0.09209076, 0.10010001, 0.08389406, 0.0, -0.014655714, -0.0074866647, -0.012227013, 0.0) * go_1(1.0, 1.0);
  result += vec4(-0.008303841, -0.008251826, -0.0069884053, 0.0);
  gl_FragColor = result + MAIN_tex(MAIN_pos);
}
`;

export default class Anime4K_Restore_CNN_Soft_S extends Anime4KShader {
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
  private program_3_conv2d_2_tf_TextureLocation: WebGLUniformLocation | null


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
    this.program_3_conv2d_2_tf_TextureLocation = gl.getUniformLocation(this.program_3, "conv2d_2_tf")
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
        textures.set('conv2d_2_tf', { texture: output, width: conv2d_1_tf.width, height: conv2d_1_tf.height});
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
      const conv2d_2_tf = textures.get('conv2d_2_tf');
      if (!conv2d_2_tf) { return; }
     {
        const output = this.program_3_intermediate_texture;
        fillEmptyTexture(gl, output, conv2d_2_tf.width, conv2d_2_tf.height);
        gl.viewport(0, 0, conv2d_2_tf.width, conv2d_2_tf.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, conv2d_2_tf.width, conv2d_2_tf.height)!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_3_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_3_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_3_u_resolution_location, conv2d_2_tf.width, conv2d_2_tf.height);
        gl.uniform2f(this.program_3_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_3_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, conv2d_2_tf.texture);
        gl.uniform1i(this.program_3_conv2d_2_tf_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('MAIN', { texture: output, width: conv2d_2_tf.width, height: conv2d_2_tf.height});
      }
    }
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;

  }
}
