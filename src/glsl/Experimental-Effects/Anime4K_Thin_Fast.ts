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
uniform sampler2D LINELUMA;
#define LINELUMA_pos (v_texture_coord)
#define LINELUMA_tex(pos) (texture2D(LINELUMA, pos))
#define LINELUMA_size (u_texture_size)
#define LINELUMA_pt (1.0 / LINELUMA_size)
#define LINELUMA_texOff(offset) (LINELUMA_tex(LINELUMA_pos + LINELUMA_pt * offset))

void main() {
  float l = LINELUMA_texOff(vec2(-1.0, 0.0)).x;
  float c = LINELUMA_tex(LINELUMA_pos).x;
  float r = LINELUMA_texOff(vec2(1.0, 0.0)).x;
  float xgrad = (-l + r);
  float ygrad = (l + c + c + r);
  gl_FragColor = vec4(xgrad, ygrad, 0.0, 0.0);
}
`;
const fragment_2_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

void main() {
  float tx = LINESOBEL_texOff(vec2(0.0, -0.5)).x;
  float cx = LINESOBEL_tex(LINESOBEL_pos).x;
  float bx = LINESOBEL_texOff(vec2(0.0, 0.5)).x;
  float ty = LINESOBEL_texOff(vec2(0.0, -0.5)).y;
  float by = LINESOBEL_texOff(vec2(0.0, 0.5)).y;
  float xgrad = (tx + cx + cx + bx) / 8.0;
  float ygrad = (-ty + by) / 8.0;
  //Computes the luminance's gradient
  float norm = sqrt(xgrad * xgrad + ygrad * ygrad);
  gl_FragColor = vec4(pow(norm, 0.7));
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

uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

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
    g = g + LINESOBEL_texOff(vec2(di, 0.0)).x * gf;
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

uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

#define SPATIAL_SIGMA (1.0 * float(MAIN_size.y) / 1080.0) //Spatial window size, must be a positive real number.
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
    g = g + LINESOBEL_texOff(vec2(0.0, di)).x * gf;
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
uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

void main() {
  float l = LINESOBEL_texOff(vec2(-0.5, 0.0)).x;
  float c = LINESOBEL_tex(LINESOBEL_pos).x;
  float r = LINESOBEL_texOff(vec2(0.5, 0.0)).x;
  float xgrad = (-l + r);
  float ygrad = (l + c + c + r);
  gl_FragColor = vec4(xgrad, ygrad, 0.0, 0.0);
}
`;
const fragment_6_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

void main() {
  float tx = LINESOBEL_texOff(vec2(0.0, -0.5)).x;
  float cx = LINESOBEL_tex(LINESOBEL_pos).x;
  float bx = LINESOBEL_texOff(vec2(0.0, 0.5)).x;
  float ty = LINESOBEL_texOff(vec2(0.0, -0.5)).y;
  float by = LINESOBEL_texOff(vec2(0.0, 0.5)).y;
  float xgrad = (tx + cx + cx + bx) / 8.0;
  float ygrad = (-ty + by) / 8.0;
  //Computes the luminance's gradient
  gl_FragColor = vec4(xgrad, ygrad, 0.0, 0.0);
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

uniform sampler2D LINESOBEL;
#define LINESOBEL_pos (v_texture_coord)
#define LINESOBEL_tex(pos) (texture2D(LINESOBEL, pos))
#define LINESOBEL_size (u_texture_size)
#define LINESOBEL_pt (1.0 / LINESOBEL_size)
#define LINESOBEL_texOff(offset) (LINESOBEL_tex(LINESOBEL_pos + LINESOBEL_pt * offset))

#define STRENGTH 0.6 //Strength of warping for each iteration
#define ITERATIONS 1 //Number of iterations for the forwards solver, decreasing strength and increasing iterations improves quality at the cost of speed.
void main() {
  vec2 d = MAIN_pt;
  float relstr = MAIN_size.y / 1080.0 * STRENGTH;
  vec2 pos = MAIN_pos;
  for (int i=0; i<ITERATIONS; i++) {
    vec2 dn = LINESOBEL_tex(pos).xy;
    vec2 dd = (dn / (length(dn) + 0.01)) * d * relstr; //Quasi-normalization for large vectors, avoids divide by zero
    pos -= dd;
  }
  gl_FragColor = MAIN_tex(pos);
}
`;

export default class Anime4K_Thin_Fast extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;
  private program_4: WebGLProgram;
  private program_5: WebGLProgram;
  private program_6: WebGLProgram;
  private program_7: WebGLProgram;

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
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_1, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_1, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_1, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_1, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        const LINELUMA_TextureLocation = gl.getUniformLocation(this.program_1, "LINELUMA");
        gl.uniform1i(LINELUMA_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_2, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_2, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_2, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_2, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_2, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_3, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_3, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_3, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_3, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_3, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_3, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_4);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_4, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_4, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_4, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_4, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_4, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_4, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_5);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_5, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_5, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_5, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_5, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_5, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.viewport(0, 0, (HOOKED.width / 2), (HOOKED.height / 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_6);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (HOOKED.width / 2), (HOOKED.height / 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_6, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_6, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_6, "u_resolution");
        gl.uniform2f(resolutionLocation, (HOOKED.width / 2), (HOOKED.height / 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_6, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_6, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LINESOBEL')) {
          gl.deleteTexture(textures.get('LINESOBEL')!.texture);
        }
        textures.set('LINESOBEL', { texture: output, width: (HOOKED.width / 2), height: (HOOKED.height / 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LINESOBEL = textures.get('LINESOBEL');
      if (!LINESOBEL) { return; }
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
        gl.bindTexture(gl.TEXTURE_2D, LINESOBEL.texture);
        const LINESOBEL_TextureLocation = gl.getUniformLocation(this.program_7, "LINESOBEL");
        gl.uniform1i(LINESOBEL_TextureLocation, 1);
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
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;

  }
}
