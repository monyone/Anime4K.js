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

#define SPATIAL_SIGMA (1.0 * float(MAIN_size.y) / 1080.0) //Spatial window size, must be a positive real number.
#define KERNELSIZE (max(int(ceil(SPATIAL_SIGMA * 2.0)), 1) * 2 + 1) //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE (int(KERNELSIZE/2)) //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
#define KERNELLEN (KERNELSIZE * KERNELSIZE) //Total area of kernel. Must be equal to KERNELSIZE * KERNELSIZE.
float gaussian(float x, float s, float m) {
  float scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
float comp_gaussian_x() {
  float g = 0.0;
  float gn = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float di = float(i - KERNELHALFSIZE);
    float gf = gaussian(di, SPATIAL_SIGMA, 0.0);
    g = g + LINELUMA_texOff(vec2(di, 0.0)).x * gf;
    gn = gn + gf;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(comp_gaussian_x(), 0.0, 0.0, 0.0);
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

uniform sampler2D LINEKERNEL;
#define LINEKERNEL_pos (v_texture_coord)
#define LINEKERNEL_tex(pos) (texture2D(LINEKERNEL, pos))
#define LINEKERNEL_size (u_texture_size)
#define LINEKERNEL_pt (1.0 / LINEKERNEL_size)
#define LINEKERNEL_texOff(offset) (LINEKERNEL_tex(LINEKERNEL_pos + LINEKERNEL_pt * offset))

#define SPATIAL_SIGMA (0.5 * float(MAIN_size.y) / 1080.0) //Spatial window size, must be a positive real number.
#define KERNELSIZE (max(int(ceil(SPATIAL_SIGMA * 2.0)), 1) * 2 + 1) //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE (int(KERNELSIZE/2)) //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
#define KERNELLEN (KERNELSIZE * KERNELSIZE) //Total area of kernel. Must be equal to KERNELSIZE * KERNELSIZE.
float gaussian(float x, float s, float m) {
  float scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
float comp_gaussian_y() {
  float g = 0.0;
  float gn = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float di = float(i - KERNELHALFSIZE);
    float gf = gaussian(di, SPATIAL_SIGMA, 0.0);
    g = g + LINEKERNEL_texOff(vec2(0.0, di)).x * gf;
    gn = gn + gf;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(min(LINELUMA_tex(MAIN_pos).x - comp_gaussian_y(), 0.0), 0.0, 0.0, 0.0);
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

uniform sampler2D LINEKERNEL;
#define LINEKERNEL_pos (v_texture_coord)
#define LINEKERNEL_tex(pos) (texture2D(LINEKERNEL, pos))
#define LINEKERNEL_size (u_texture_size)
#define LINEKERNEL_pt (1.0 / LINEKERNEL_size)
#define LINEKERNEL_texOff(offset) (LINEKERNEL_tex(LINEKERNEL_pos + LINEKERNEL_pt * offset))

#define SPATIAL_SIGMA (0.5 * float(MAIN_size.y) / 1080.0) //Spatial window size, must be a positive real number.
#define KERNELSIZE (max(int(ceil(SPATIAL_SIGMA * 2.0)), 1) * 2 + 1) //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE (int(KERNELSIZE/2)) //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
#define KERNELLEN (KERNELSIZE * KERNELSIZE) //Total area of kernel. Must be equal to KERNELSIZE * KERNELSIZE.
float gaussian(float x, float s, float m) {
  float scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
float comp_gaussian_x() {
  float g = 0.0;
  float gn = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float di = float(i - KERNELHALFSIZE);
    float gf = gaussian(di, SPATIAL_SIGMA, 0.0);
    g = g + LINEKERNEL_texOff(vec2(di, 0.0)).x * gf;
    gn = gn + gf;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(comp_gaussian_x(), 0.0, 0.0, 0.0);
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

uniform sampler2D LINEKERNEL;
#define LINEKERNEL_pos (v_texture_coord)
#define LINEKERNEL_tex(pos) (texture2D(LINEKERNEL, pos))
#define LINEKERNEL_size (u_texture_size)
#define LINEKERNEL_pt (1.0 / LINEKERNEL_size)
#define LINEKERNEL_texOff(offset) (LINEKERNEL_tex(LINEKERNEL_pos + LINEKERNEL_pt * offset))

#define SPATIAL_SIGMA (0.5 * float(MAIN_size.y) / 1080.0) //Spatial window size, must be a positive real number.
#define KERNELSIZE (max(int(ceil(SPATIAL_SIGMA * 2.0)), 1) * 2 + 1) //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE (int(KERNELSIZE/2)) //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
#define KERNELLEN (KERNELSIZE * KERNELSIZE) //Total area of kernel. Must be equal to KERNELSIZE * KERNELSIZE.
float gaussian(float x, float s, float m) {
  float scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
float comp_gaussian_y() {
  float g = 0.0;
  float gn = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float di = float(i - KERNELHALFSIZE);
    float gf = gaussian(di, SPATIAL_SIGMA, 0.0);
    g = g + LINEKERNEL_texOff(vec2(0.0, di)).x * gf;
    gn = gn + gf;
  }
  return g / gn;
}
void main() {
  gl_FragColor = vec4(comp_gaussian_y(), 0.0, 0.0, 0.0);
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

uniform sampler2D LINEKERNEL;
#define LINEKERNEL_pos (v_texture_coord)
#define LINEKERNEL_tex(pos) (texture2D(LINEKERNEL, pos))
#define LINEKERNEL_size (u_texture_size)
#define LINEKERNEL_pt (1.0 / LINEKERNEL_size)
#define LINEKERNEL_texOff(offset) (LINEKERNEL_tex(LINEKERNEL_pos + LINEKERNEL_pt * offset))

#define STRENGTH 1.5 //Line darken proportional strength, higher is darker.
void main() {
  //This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
  //Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  gl_FragColor = MAIN_tex(MAIN_pos) + (LINEKERNEL_tex(MAIN_pos).x * STRENGTH);
}
`;

export default class Anime4K_Darken_Fast extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;
  private program_4: WebGLProgram;
  private program_5: WebGLProgram;
  private program_0_intermediate_texture: WebGLProgram;
  private program_1_intermediate_texture: WebGLProgram;
  private program_2_intermediate_texture: WebGLProgram;
  private program_3_intermediate_texture: WebGLProgram;
  private program_4_intermediate_texture: WebGLProgram;
  private program_5_intermediate_texture: WebGLProgram;
  private program_0_a_position_location: number;
  private program_1_a_position_location: number;
  private program_2_a_position_location: number;
  private program_3_a_position_location: number;
  private program_4_a_position_location: number;
  private program_5_a_position_location: number;
  private program_0_a_texture_coord_location: number;
  private program_1_a_texture_coord_location: number;
  private program_2_a_texture_coord_location: number;
  private program_3_a_texture_coord_location: number;
  private program_4_a_texture_coord_location: number;
  private program_5_a_texture_coord_location: number;
  private program_0_u_resolution_location: WebGLUniformLocation | null;
  private program_1_u_resolution_location: WebGLUniformLocation | null;
  private program_2_u_resolution_location: WebGLUniformLocation | null;
  private program_3_u_resolution_location: WebGLUniformLocation | null;
  private program_4_u_resolution_location: WebGLUniformLocation | null;
  private program_5_u_resolution_location: WebGLUniformLocation | null;
  private program_0_u_texture_size_location: WebGLUniformLocation | null;
  private program_1_u_texture_size_location: WebGLUniformLocation | null;
  private program_2_u_texture_size_location: WebGLUniformLocation | null;
  private program_3_u_texture_size_location: WebGLUniformLocation | null;
  private program_4_u_texture_size_location: WebGLUniformLocation | null;
  private program_5_u_texture_size_location: WebGLUniformLocation | null;
  private program_0_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_1_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_1_LINELUMA_TextureLocation: WebGLUniformLocation | null
  private program_2_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_2_LINELUMA_TextureLocation: WebGLUniformLocation | null
  private program_2_LINEKERNEL_TextureLocation: WebGLUniformLocation | null
  private program_3_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_3_LINEKERNEL_TextureLocation: WebGLUniformLocation | null
  private program_4_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_4_LINEKERNEL_TextureLocation: WebGLUniformLocation | null
  private program_5_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_5_LINEKERNEL_TextureLocation: WebGLUniformLocation | null


  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_3 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_3_shader)!)!;
    this.program_4 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_4_shader)!)!;
    this.program_5 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_5_shader)!)!;
    this.program_0_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_1_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_2_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_3_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_4_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_5_intermediate_texture = createTexture(gl, gl.NEAREST)!;
    this.program_0_a_position_location = gl.getAttribLocation(this.program_0, "a_position");
    gl.enableVertexAttribArray(this.program_0_a_position_location);
    this.program_1_a_position_location = gl.getAttribLocation(this.program_1, "a_position");
    gl.enableVertexAttribArray(this.program_1_a_position_location);
    this.program_2_a_position_location = gl.getAttribLocation(this.program_2, "a_position");
    gl.enableVertexAttribArray(this.program_2_a_position_location);
    this.program_3_a_position_location = gl.getAttribLocation(this.program_3, "a_position");
    gl.enableVertexAttribArray(this.program_3_a_position_location);
    this.program_4_a_position_location = gl.getAttribLocation(this.program_4, "a_position");
    gl.enableVertexAttribArray(this.program_4_a_position_location);
    this.program_5_a_position_location = gl.getAttribLocation(this.program_5, "a_position");
    gl.enableVertexAttribArray(this.program_5_a_position_location);
    this.program_0_a_texture_coord_location = gl.getAttribLocation(this.program_0, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_0_a_texture_coord_location);
    this.program_1_a_texture_coord_location = gl.getAttribLocation(this.program_1, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_1_a_texture_coord_location);
    this.program_2_a_texture_coord_location = gl.getAttribLocation(this.program_2, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_2_a_texture_coord_location);
    this.program_3_a_texture_coord_location = gl.getAttribLocation(this.program_3, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_3_a_texture_coord_location);
    this.program_4_a_texture_coord_location = gl.getAttribLocation(this.program_4, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_4_a_texture_coord_location);
    this.program_5_a_texture_coord_location = gl.getAttribLocation(this.program_5, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_5_a_texture_coord_location);
    this.program_0_u_resolution_location = gl.getUniformLocation(this.program_0, "u_resolution");
    this.program_1_u_resolution_location = gl.getUniformLocation(this.program_1, "u_resolution");
    this.program_2_u_resolution_location = gl.getUniformLocation(this.program_2, "u_resolution");
    this.program_3_u_resolution_location = gl.getUniformLocation(this.program_3, "u_resolution");
    this.program_4_u_resolution_location = gl.getUniformLocation(this.program_4, "u_resolution");
    this.program_5_u_resolution_location = gl.getUniformLocation(this.program_5, "u_resolution");
    this.program_0_u_texture_size_location = gl.getUniformLocation(this.program_0, "u_texture_size");
    this.program_1_u_texture_size_location = gl.getUniformLocation(this.program_1, "u_texture_size");
    this.program_2_u_texture_size_location = gl.getUniformLocation(this.program_2, "u_texture_size");
    this.program_3_u_texture_size_location = gl.getUniformLocation(this.program_3, "u_texture_size");
    this.program_4_u_texture_size_location = gl.getUniformLocation(this.program_4, "u_texture_size");
    this.program_5_u_texture_size_location = gl.getUniformLocation(this.program_5, "u_texture_size");
    this.program_0_MAIN_TextureLocation = gl.getUniformLocation(this.program_0, "MAIN")
    this.program_1_MAIN_TextureLocation = gl.getUniformLocation(this.program_1, "MAIN")
    this.program_1_LINELUMA_TextureLocation = gl.getUniformLocation(this.program_1, "LINELUMA")
    this.program_2_MAIN_TextureLocation = gl.getUniformLocation(this.program_2, "MAIN")
    this.program_2_LINELUMA_TextureLocation = gl.getUniformLocation(this.program_2, "LINELUMA")
    this.program_2_LINEKERNEL_TextureLocation = gl.getUniformLocation(this.program_2, "LINEKERNEL")
    this.program_3_MAIN_TextureLocation = gl.getUniformLocation(this.program_3, "MAIN")
    this.program_3_LINEKERNEL_TextureLocation = gl.getUniformLocation(this.program_3, "LINEKERNEL")
    this.program_4_MAIN_TextureLocation = gl.getUniformLocation(this.program_4, "MAIN")
    this.program_4_LINEKERNEL_TextureLocation = gl.getUniformLocation(this.program_4, "LINEKERNEL")
    this.program_5_MAIN_TextureLocation = gl.getUniformLocation(this.program_5, "MAIN")
    this.program_5_LINEKERNEL_TextureLocation = gl.getUniformLocation(this.program_5, "LINEKERNEL")
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
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_0);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_0_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_0_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_0_u_resolution_location, (MAIN.width), (MAIN.height));
        gl.uniform2f(this.program_0_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_0_MAIN_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
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
     {
        const output = this.program_1_intermediate_texture;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_1_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_1_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_1_u_resolution_location, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.uniform2f(this.program_1_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_1_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        gl.uniform1i(this.program_1_LINELUMA_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('LINEKERNEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINEKERNEL = textures.get('LINEKERNEL');
      if (!LINEKERNEL) { return; }
      const LINELUMA = textures.get('LINELUMA');
      if (!LINELUMA) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = this.program_2_intermediate_texture;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_2_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_2_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_2_u_resolution_location, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.uniform2f(this.program_2_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_2_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        gl.uniform1i(this.program_2_LINELUMA_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, LINEKERNEL.texture);
        gl.uniform1i(this.program_2_LINEKERNEL_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('LINEKERNEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINEKERNEL = textures.get('LINEKERNEL');
      if (!LINEKERNEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = this.program_3_intermediate_texture;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_3_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_3_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_3_u_resolution_location, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.uniform2f(this.program_3_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_3_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINEKERNEL.texture);
        gl.uniform1i(this.program_3_LINEKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('LINEKERNEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINEKERNEL = textures.get('LINEKERNEL');
      if (!LINEKERNEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = this.program_4_intermediate_texture;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_4);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_4_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_4_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_4_u_resolution_location, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.uniform2f(this.program_4_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_4_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINEKERNEL.texture);
        gl.uniform1i(this.program_4_LINEKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('LINEKERNEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINEKERNEL = textures.get('LINEKERNEL');
      if (!LINEKERNEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = this.program_5_intermediate_texture;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_5);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_5_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_5_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_5_u_resolution_location, (MAIN.width), (MAIN.height));
        gl.uniform2f(this.program_5_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_5_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINEKERNEL.texture);
        gl.uniform1i(this.program_5_LINEKERNEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        textures.set('MAIN', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;

  }
}
