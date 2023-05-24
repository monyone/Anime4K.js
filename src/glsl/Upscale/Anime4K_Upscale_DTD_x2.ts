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

float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}
void main() {
  gl_FragColor = vec4(get_luma(MAIN_tex(MAIN_pos)), 0.0, 0.0, 0.0);
}
`;
const fragment_1_shader = `
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

uniform sampler2D LINELUMA;
#define LINELUMA_pos (v_texture_coord)
#define LINELUMA_tex(pos) (texture2D(LINELUMA, pos))
#define LINELUMA_size (u_texture_size)
#define LINELUMA_pt (1.0 / LINELUMA_size)
#define LINELUMA_texOff(offset) (LINELUMA_tex(LINELUMA_pos + LINELUMA_pt * offset))

#define L_tex LINELUMA_tex
#define SIGMA 1.0
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float s = SIGMA * MAIN_size.y / 1080.0;
  float kernel_size = s * 2.0 + 1.0;
  float g = (L_tex(pos).x) * gaussian(0.0, s, 0.0);
  float gn = gaussian(0.0, s, 0.0);
  g += (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, s, 0.0);
  gn += gaussian(1.0, s, 0.0) * 2.0;
  for (int i=2; float(i)<kernel_size; i++) {
    g += (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), s, 0.0);
    gn += gaussian(float(i), s, 0.0) * 2.0;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(lumGaussian(MAIN_pos, vec2(MAIN_pt.x, 0)));
}
`;
const fragment_2_shader = `
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

uniform sampler2D LINELUMA;
#define LINELUMA_pos (v_texture_coord)
#define LINELUMA_tex(pos) (texture2D(LINELUMA, pos))
#define LINELUMA_size (u_texture_size)
#define LINELUMA_pt (1.0 / LINELUMA_size)
#define LINELUMA_texOff(offset) (LINELUMA_tex(LINELUMA_pos + LINELUMA_pt * offset))

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define L_tex MMKERNEL_tex
#define SIGMA 1.0
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float s = SIGMA * MAIN_size.y / 1080.0;
  float kernel_size = s * 2.0 + 1.0;
  float g = (L_tex(pos).x) * gaussian(0.0, s, 0.0);
  float gn = gaussian(0.0, s, 0.0);
  g += (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, s, 0.0);
  gn += gaussian(1.0, s, 0.0) * 2.0;
  for (int i=2; float(i)<kernel_size; i++) {
    g += (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), s, 0.0);
    gn += gaussian(float(i), s, 0.0) * 2.0;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(min(LINELUMA_tex(MAIN_pos).x - lumGaussian(MAIN_pos, vec2(0, MAIN_pt.y)), 0.0));
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

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define L_tex MMKERNEL_tex
#define SIGMA 0.4
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float s = SIGMA * MAIN_size.y / 1080.0;
  float kernel_size = s * 2.0 + 1.0;
  float g = (L_tex(pos).x) * gaussian(0.0, s, 0.0);
  float gn = gaussian(0.0, s, 0.0);
  g += (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, s, 0.0);
  gn += gaussian(1.0, s, 0.0) * 2.0;
  for (int i=2; float(i)<kernel_size; i++) {
    g += (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), s, 0.0);
    gn += gaussian(float(i), s, 0.0) * 2.0;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(lumGaussian(MAIN_pos, vec2(MAIN_pt.x, 0)));
}
`;
const fragment_4_shader = `
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

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define L_tex MMKERNEL_tex
#define SIGMA 0.4
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float s = SIGMA * MAIN_size.y / 1080.0;
  float kernel_size = s * 2.0 + 1.0;
  float g = (L_tex(pos).x) * gaussian(0.0, s, 0.0);
  float gn = gaussian(0.0, s, 0.0);
  g += (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, s, 0.0);
  gn += gaussian(1.0, s, 0.0) * 2.0;
  for (int i=2; float(i)<kernel_size; i++) {
    g += (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), s, 0.0);
    gn += gaussian(float(i), s, 0.0) * 2.0;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(lumGaussian(MAIN_pos, vec2(0, MAIN_pt.y)));
}
`;
const fragment_5_shader = `
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

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define STRENGTH 1.8 //Line darken proportional strength, higher is darker.
void main() {
  float c = (MMKERNEL_tex(MAIN_pos).x) * STRENGTH;
  //This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
  //Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  gl_FragColor = MAIN_tex(MAIN_pos) + c;
}
`;
const fragment_6_shader = `
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

float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}
void main() {
  gl_FragColor = vec4(get_luma(MAIN_tex(MAIN_pos)), 0.0, 0.0, 0.0);
}
`;
const fragment_7_shader = `
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

uniform sampler2D LINELUMA;
#define LINELUMA_pos (v_texture_coord)
#define LINELUMA_tex(pos) (texture2D(LINELUMA, pos))
#define LINELUMA_size (u_texture_size)
#define LINELUMA_pt (1.0 / LINELUMA_size)
#define LINELUMA_texOff(offset) (LINELUMA_tex(LINELUMA_pos + LINELUMA_pt * offset))

#define L_tex LINELUMA_tex
void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l c r]
  //[bl b br]
  float l = L_tex(MAIN_pos + vec2(-d.x, 0)).x;
  float c = L_tex(MAIN_pos).x;
  float r = L_tex(MAIN_pos + vec2(d.x, 0)).x;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (-l + r);
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (l + c + c + r);
  //Computes the luminance's gradient
  gl_FragColor = vec4(xgrad, ygrad, 0, 0);
}
`;
const fragment_8_shader = `
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l cc r]
  //[bl b br]
  float tx = LUMAD_tex(MAIN_pos + vec2(0, -d.y)).x;
  float cx = LUMAD_tex(MAIN_pos).x;
  float bx = LUMAD_tex(MAIN_pos + vec2(0, d.y)).x;
  float ty = LUMAD_tex(MAIN_pos + vec2(0, -d.y)).y;
  //float cy = LUMAD_tex(MAIN_pos).y;
  float by = LUMAD_tex(MAIN_pos + vec2(0, d.y)).y;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (tx + cx + cx + bx) / 8.0;
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (-ty + by) / 8.0;
  //Computes the luminance's gradient
  float norm = sqrt(xgrad * xgrad + ygrad * ygrad);
  gl_FragColor = vec4(pow(norm, 0.7));
}
`;
const fragment_9_shader = `
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

#define L_tex LUMAD_tex
#define SIGMA (MAIN_size.y / 1080.0) * 2.0
#define KERNELSIZE (SIGMA * 2.0 + 1.0)
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float g = (L_tex(pos).x) * gaussian(0.0, SIGMA, 0.0);
  g = g + (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, SIGMA, 0.0);
  for (int i=2; float(i)<KERNELSIZE; i++) {
    g = g + (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), SIGMA, 0.0);
  }
  return g;
}
void main() {
  gl_FragColor = vec4(lumGaussian(MAIN_pos, vec2(MAIN_pt.x, 0)));
}
`;
const fragment_10_shader = `
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

uniform sampler2D LUMADG;
#define LUMADG_pos (v_texture_coord)
#define LUMADG_tex(pos) (texture2D(LUMADG, pos))
#define LUMADG_size (u_texture_size)
#define LUMADG_pt (1.0 / LUMADG_size)
#define LUMADG_texOff(offset) (LUMADG_tex(LUMADG_pos + LUMADG_pt * offset))

#define L_tex LUMADG_tex
#define SIGMA (MAIN_size.y / 1080.0) * 2.0
#define KERNELSIZE (SIGMA * 2.0 + 1.0)
float gaussian(float x, float s, float m) {
  return (1.0 / (s * sqrt(2.0 * 3.14159))) * exp(-0.5 * pow(abs(x - m) / s, 2.0));
}
float lumGaussian(vec2 pos, vec2 d) {
  float g = (L_tex(pos).x) * gaussian(0.0, SIGMA, 0.0);
  g = g + (L_tex(pos - d).x + L_tex(pos + d).x) * gaussian(1.0, SIGMA, 0.0);
  for (int i=2; float(i)<KERNELSIZE; i++) {
    g = g + (L_tex(pos - (d * float(i))).x + L_tex(pos + (d * float(i))).x) * gaussian(float(i), SIGMA, 0.0);
  }
  return g;
}
void main() {
  float g = lumGaussian(MAIN_pos, vec2(0, MAIN_pt.y));
  gl_FragColor = vec4(g);
}
`;
const fragment_11_shader = `
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l c r]
  //[bl b br]
  float l = LUMAD_tex(MAIN_pos + vec2(-d.x, 0)).x;
  float c = LUMAD_tex(MAIN_pos).x;
  float r = LUMAD_tex(MAIN_pos + vec2(d.x, 0)).x;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (-l + r);
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (l + c + c + r);
  //Computes the luminance's gradient
  gl_FragColor = vec4(xgrad, ygrad, 0, 0);
}
`;
const fragment_12_shader = `
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

uniform sampler2D LUMAD2;
#define LUMAD2_pos (v_texture_coord)
#define LUMAD2_tex(pos) (texture2D(LUMAD2, pos))
#define LUMAD2_size (u_texture_size)
#define LUMAD2_pt (1.0 / LUMAD2_size)
#define LUMAD2_texOff(offset) (LUMAD2_tex(LUMAD2_pos + LUMAD2_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l cc r]
  //[bl b br]
  float tx = LUMAD2_tex(MAIN_pos + vec2(0, -d.y)).x;
  float cx = LUMAD2_tex(MAIN_pos).x;
  float bx = LUMAD2_tex(MAIN_pos + vec2(0, d.y)).x;
  float ty = LUMAD2_tex(MAIN_pos + vec2(0, -d.y)).y;
  //float cy = LUMAD2_tex(MAIN_pos).y;
  float by = LUMAD2_tex(MAIN_pos + vec2(0, d.y)).y;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (tx + cx + cx + bx) / 8.0;
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (-ty + by) / 8.0;
  //Computes the luminance's gradient
  gl_FragColor = vec4(xgrad, ygrad, 0, 0);
}
`;
const fragment_13_shader = `
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

uniform sampler2D LUMAD2;
#define LUMAD2_pos (v_texture_coord)
#define LUMAD2_tex(pos) (texture2D(LUMAD2, pos))
#define LUMAD2_size (u_texture_size)
#define LUMAD2_pt (1.0 / LUMAD2_size)
#define LUMAD2_texOff(offset) (LUMAD2_tex(LUMAD2_pos + LUMAD2_pt * offset))

#define STRENGTH 0.4 //Strength of warping for each iteration
#define ITERATIONS 1 //Number of iterations for the forwards solver, decreasing strength and increasing iterations improves quality at the cost of speed.
#define L_tex MAIN_tex
void main() {
  vec2 d = MAIN_pt;
  float relstr = MAIN_size.y / 1080.0 * STRENGTH;
  vec2 pos = MAIN_pos;
  for (int i=0; i<ITERATIONS; i++) {
    vec2 dn = LUMAD2_tex(pos).xy;
    vec2 dd = (dn / (length(dn) + 0.01)) * d * relstr; //Quasi-normalization for large vectors, avoids divide by zero
    pos -= dd;
  }
  gl_FragColor = L_tex(pos);
}
`;
const fragment_14_shader = `
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

uniform sampler2D MAINTEMPTHIN;
#define MAINTEMPTHIN_pos (v_texture_coord)
#define MAINTEMPTHIN_tex(pos) (texture2D(MAINTEMPTHIN, pos))
#define MAINTEMPTHIN_size (u_texture_size)
#define MAINTEMPTHIN_pt (1.0 / MAINTEMPTHIN_size)
#define MAINTEMPTHIN_texOff(offset) (MAINTEMPTHIN_tex(MAINTEMPTHIN_pos + MAINTEMPTHIN_pt * offset))

float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}
void main() {
  gl_FragColor = vec4(get_luma(MAINTEMPTHIN_tex(MAIN_pos)), 0.0, 0.0, 0.0);
}
`;
const fragment_15_shader = `
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

uniform sampler2D MAINTEMP;
#define MAINTEMP_pos (v_texture_coord)
#define MAINTEMP_tex(pos) (texture2D(MAINTEMP, pos))
#define MAINTEMP_size (u_texture_size)
#define MAINTEMP_pt (1.0 / MAINTEMP_size)
#define MAINTEMP_texOff(offset) (MAINTEMP_tex(MAINTEMP_pos + MAINTEMP_pt * offset))

#define L_tex MAINTEMP_tex
float max3v(float a, float b, float c) {
  return max(max(a, b), c);
}
float min3v(float a, float b, float c) {
  return min(min(a, b), c);
}
vec2 minmax3(vec2 pos, vec2 d) {
  float a = L_tex(pos - d).x;
  float b = L_tex(pos).x;
  float c = L_tex(pos + d).x;
  return vec2(min3v(a, b, c), max3v(a, b, c));
}
float lumGaussian7(vec2 pos, vec2 d) {
  float g = (L_tex(pos - (d + d)).x + L_tex(pos + (d + d)).x) * 0.06136;
  g = g + (L_tex(pos - d).x + L_tex(pos + d).x) * 0.24477;
  g = g + (L_tex(pos).x) * 0.38774;
  return g;
}
void main() {
  gl_FragColor = vec4(lumGaussian7(MAIN_pos, vec2(MAIN_pt.x, 0)), minmax3(MAIN_pos, vec2(MAIN_pt.x, 0)), 0);
}
`;
const fragment_16_shader = `
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

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define L_tex MMKERNEL_tex
float max3v(float a, float b, float c) {
  return max(max(a, b), c);
}
float min3v(float a, float b, float c) {
  return min(min(a, b), c);
}
vec2 minmax3(vec2 pos, vec2 d) {
  float a0 = L_tex(pos - d).y;
  float b0 = L_tex(pos).y;
  float c0 = L_tex(pos + d).y;
  float a1 = L_tex(pos - d).z;
  float b1 = L_tex(pos).z;
  float c1 = L_tex(pos + d).z;
  return vec2(min3v(a0, b0, c0), max3v(a1, b1, c1));
}
float lumGaussian7(vec2 pos, vec2 d) {
  float g = (L_tex(pos - (d + d)).x + L_tex(pos + (d + d)).x) * 0.06136;
  g = g + (L_tex(pos - d).x + L_tex(pos + d).x) * 0.24477;
  g = g + (L_tex(pos).x) * 0.38774;
  return g;
}
void main() {
  gl_FragColor = vec4(lumGaussian7(MAIN_pos, vec2(0, MAIN_pt.y)), minmax3(MAIN_pos, vec2(0, MAIN_pt.y)), 0);
}
`;
const fragment_17_shader = `
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

uniform sampler2D MAINTEMPTHIN;
#define MAINTEMPTHIN_pos (v_texture_coord)
#define MAINTEMPTHIN_tex(pos) (texture2D(MAINTEMPTHIN, pos))
#define MAINTEMPTHIN_size (u_texture_size)
#define MAINTEMPTHIN_pt (1.0 / MAINTEMPTHIN_size)
#define MAINTEMPTHIN_texOff(offset) (MAINTEMPTHIN_tex(MAINTEMPTHIN_pos + MAINTEMPTHIN_pt * offset))

uniform sampler2D MAINTEMP;
#define MAINTEMP_pos (v_texture_coord)
#define MAINTEMP_tex(pos) (texture2D(MAINTEMP, pos))
#define MAINTEMP_size (u_texture_size)
#define MAINTEMP_pt (1.0 / MAINTEMP_size)
#define MAINTEMP_texOff(offset) (MAINTEMP_tex(MAINTEMP_pos + MAINTEMP_pt * offset))

uniform sampler2D MMKERNEL;
#define MMKERNEL_pos (v_texture_coord)
#define MMKERNEL_tex(pos) (texture2D(MMKERNEL, pos))
#define MMKERNEL_size (u_texture_size)
#define MMKERNEL_pt (1.0 / MMKERNEL_size)
#define MMKERNEL_texOff(offset) (MMKERNEL_tex(MMKERNEL_pos + MMKERNEL_pt * offset))

#define STRENGTH 0.5 //De-blur proportional strength, higher is sharper. However, it is better to tweak BLUR_CURVE instead to avoid ringing.
#define BLUR_CURVE 0.8 //De-blur power curve, lower is sharper. Good values are between 0.3 - 1. Values greater than 1 softens the image;
#define BLUR_THRESHOLD 0.1 //Value where curve kicks in, used to not de-blur already sharp edges. Only de-blur values that fall below this threshold.
#define NOISE_THRESHOLD 0.004 //Value where curve stops, used to not sharpen noise. Only de-blur values that fall above this threshold.
#define L_tex MAINTEMP_tex
void main() {
  float c = (L_tex(MAIN_pos).x - MMKERNEL_tex(MAIN_pos).x) * STRENGTH;
  float t_range = BLUR_THRESHOLD - NOISE_THRESHOLD;
  float c_t = abs(c);
  if (c_t > NOISE_THRESHOLD) {
    c_t = (c_t - NOISE_THRESHOLD) / t_range;
    c_t = pow(c_t, BLUR_CURVE);
    c_t = c_t * t_range + NOISE_THRESHOLD;
    c_t = c_t * sign(c);
  } else {
    c_t = c;
  }
  float cc = clamp(c_t + L_tex(MAIN_pos).x, MMKERNEL_tex(MAIN_pos).y, MMKERNEL_tex(MAIN_pos).z) - L_tex(MAIN_pos).x;
  //This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
  //Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  gl_FragColor = MAINTEMPTHIN_tex(MAIN_pos) + cc;
}
`;

export default class Anime4K_Upscale_DTD_x2 extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;
  private program_4: WebGLProgram;
  private program_5: WebGLProgram;
  private program_6: WebGLProgram;
  private program_7: WebGLProgram;
  private program_8: WebGLProgram;
  private program_9: WebGLProgram;
  private program_10: WebGLProgram;
  private program_11: WebGLProgram;
  private program_12: WebGLProgram;
  private program_13: WebGLProgram;
  private program_14: WebGLProgram;
  private program_15: WebGLProgram;
  private program_16: WebGLProgram;
  private program_17: WebGLProgram;

  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_3 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_3_shader)!)!;
    this.program_4 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_4_shader)!)!;
    this.program_5 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_5_shader)!)!;
    this.program_6 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_6_shader)!)!;
    this.program_7 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_7_shader)!)!;
    this.program_8 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_8_shader)!)!;
    this.program_9 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_9_shader)!)!;
    this.program_10 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_10_shader)!)!;
    this.program_11 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_11_shader)!)!;
    this.program_12 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_12_shader)!)!;
    this.program_13 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_13_shader)!)!;
    this.program_14 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_14_shader)!)!;
    this.program_15 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_15_shader)!)!;
    this.program_16 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_16_shader)!)!;
    this.program_17 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_17_shader)!)!;
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
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_0);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_0, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_0, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_0, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_0, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_0, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINELUMA')) {
          gl.deleteTexture(textures.get('LINELUMA')!.texture);
        }
        textures.set('LINELUMA', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINELUMA = textures.get('LINELUMA');
      if (!LINELUMA) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_1, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_1, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_1, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_1, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_1, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        const LINELUMA_TextureLocation = gl.getUniformLocation(this.program_1, "LINELUMA");
        gl.uniform1i(LINELUMA_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINELUMA = textures.get('LINELUMA');
      if (!LINELUMA) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_2, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_2, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_2, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_2, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_2, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        const LINELUMA_TextureLocation = gl.getUniformLocation(this.program_2, "LINELUMA");
        gl.uniform1i(LINELUMA_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_2, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_3, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_3, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_3, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_3, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_3, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_3, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_4);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_4, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_4, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_4, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_4, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_4, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_4, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_5);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_5, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_5, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_5, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_5, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_5, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_5, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MAIN')) {
          gl.deleteTexture(textures.get('MAIN')!.texture);
        }
        textures.set('MAIN', { texture: output, width: (MAIN.width), height: (MAIN.height)});
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
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_6);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_6, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_6, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_6, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_6, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_6, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINELUMA')) {
          gl.deleteTexture(textures.get('LINELUMA')!.texture);
        }
        textures.set('LINELUMA', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINELUMA = textures.get('LINELUMA');
      if (!LINELUMA) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_7);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_7, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_7, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_7, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_7, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_7, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        const LINELUMA_TextureLocation = gl.getUniformLocation(this.program_7, "LINELUMA");
        gl.uniform1i(LINELUMA_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAD')) {
          gl.deleteTexture(textures.get('LUMAD')!.texture);
        }
        textures.set('LUMAD', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_8);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_8, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_8, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_8, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_8, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_8, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_8, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAD')) {
          gl.deleteTexture(textures.get('LUMAD')!.texture);
        }
        textures.set('LUMAD', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_9);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_9, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_9, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_9, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_9, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_9, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_9, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMADG')) {
          gl.deleteTexture(textures.get('LUMADG')!.texture);
        }
        textures.set('LUMADG', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const LUMADG = textures.get('LUMADG');
      if (!LUMADG) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_10);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_10, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_10, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_10, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_10, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_10, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_10, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, LUMADG.texture);
        const LUMADG_TextureLocation = gl.getUniformLocation(this.program_10, "LUMADG");
        gl.uniform1i(LUMADG_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAD')) {
          gl.deleteTexture(textures.get('LUMAD')!.texture);
        }
        textures.set('LUMAD', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_11);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_11, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_11, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_11, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_11, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_11, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_11, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAD2')) {
          gl.deleteTexture(textures.get('LUMAD2')!.texture);
        }
        textures.set('LUMAD2', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD2 = textures.get('LUMAD2');
      if (!LUMAD2) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_12);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_12, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_12, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_12, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_12, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_12, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD2.texture);
        const LUMAD2_TextureLocation = gl.getUniformLocation(this.program_12, "LUMAD2");
        gl.uniform1i(LUMAD2_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAD2')) {
          gl.deleteTexture(textures.get('LUMAD2')!.texture);
        }
        textures.set('LUMAD2', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const LUMAD2 = textures.get('LUMAD2');
      if (!LUMAD2) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_13);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_13, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_13, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_13, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_13, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_13, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_13, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD2.texture);
        const LUMAD2_TextureLocation = gl.getUniformLocation(this.program_13, "LUMAD2");
        gl.uniform1i(LUMAD2_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MAINTEMPTHIN')) {
          gl.deleteTexture(textures.get('MAINTEMPTHIN')!.texture);
        }
        textures.set('MAINTEMPTHIN', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MAINTEMPTHIN = textures.get('MAINTEMPTHIN');
      if (!MAINTEMPTHIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_14);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_14, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_14, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_14, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_14, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_14, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MAINTEMPTHIN.texture);
        const MAINTEMPTHIN_TextureLocation = gl.getUniformLocation(this.program_14, "MAINTEMPTHIN");
        gl.uniform1i(MAINTEMPTHIN_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MAINTEMP')) {
          gl.deleteTexture(textures.get('MAINTEMP')!.texture);
        }
        textures.set('MAINTEMP', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MAINTEMP = textures.get('MAINTEMP');
      if (!MAINTEMP) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_15);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_15, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_15, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_15, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_15, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_15, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MAINTEMP.texture);
        const MAINTEMP_TextureLocation = gl.getUniformLocation(this.program_15, "MAINTEMP");
        gl.uniform1i(MAINTEMP_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_16);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_16, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_16, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_16, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width), (MAIN.height));
        const textureSizeLocation = gl.getUniformLocation(this.program_16, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_16, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_16, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MMKERNEL')) {
          gl.deleteTexture(textures.get('MMKERNEL')!.texture);
        }
        textures.set('MMKERNEL', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const MAINTEMP = textures.get('MAINTEMP');
      if (!MAINTEMP) { return; }
      const MAINTEMPTHIN = textures.get('MAINTEMPTHIN');
      if (!MAINTEMPTHIN) { return; }
      const MMKERNEL = textures.get('MMKERNEL');
      if (!MMKERNEL) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      if ((((OUTPUT.width / MAIN.width) > 1.200) && ((OUTPUT.height / MAIN.height) > 1.200))) {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_17);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_17, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_17, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_17, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_17, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_17, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, MAINTEMPTHIN.texture);
        const MAINTEMPTHIN_TextureLocation = gl.getUniformLocation(this.program_17, "MAINTEMPTHIN");
        gl.uniform1i(MAINTEMPTHIN_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, MAINTEMP.texture);
        const MAINTEMP_TextureLocation = gl.getUniformLocation(this.program_17, "MAINTEMP");
        gl.uniform1i(MAINTEMP_TextureLocation, 2);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, MMKERNEL.texture);
        const MMKERNEL_TextureLocation = gl.getUniformLocation(this.program_17, "MMKERNEL");
        gl.uniform1i(MMKERNEL_TextureLocation, 3);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('MAIN')) {
          gl.deleteTexture(textures.get('MAIN')!.texture);
        }
        textures.set('MAIN', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
      }
    }
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;

  }
}
