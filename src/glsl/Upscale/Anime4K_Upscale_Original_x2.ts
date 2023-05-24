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

void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l c r]
  //[bl b br]
  float l = LINELUMA_tex(MAIN_pos + vec2(-d.x, 0.0)).x;
  float c = LINELUMA_tex(MAIN_pos).x;
  float r = LINELUMA_tex(MAIN_pos + vec2(d.x, 0.0)).x;
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
  gl_FragColor = vec4(xgrad, ygrad, 0.0, 0.0);
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

/* --------------------- SETTINGS --------------------- */
//Strength of edge refinement, good values are between 0.2 and 4
#define REFINE_STRENGTH 0.5
/* --- MODIFY THESE SETTINGS BELOW AT YOUR OWN RISK --- */
//Bias of the refinement function, good values are between 0 and 1
#define REFINE_BIAS 0.0
//Polynomial fit obtained by minimizing MSE error on image
#define P5 ( 11.68129591)
#define P4 (-42.46906057)
#define P3 ( 60.28286266)
#define P2 (-41.84451327)
#define P1 ( 14.05517353)
#define P0 (-1.081521930)
/* ----------------- END OF SETTINGS ----------------- */
float power_function(float x) {
  float x2 = x * x;
  float x3 = x2 * x;
  float x4 = x2 * x2;
  float x5 = x2 * x3;
  return P5*x5 + P4*x4 + P3*x3 + P2*x2 + P1*x + P0;
}
void main() {
  vec2 d = MAIN_pt;
  //[tl t tr]
  //[ l cc r]
  //[bl b br]
  float tx = LUMAD_tex(MAIN_pos + vec2(0.0, -d.y)).x;
  float cx = LUMAD_tex(MAIN_pos).x;
  float bx = LUMAD_tex(MAIN_pos + vec2(0.0, d.y)).x;
  float ty = LUMAD_tex(MAIN_pos + vec2(0.0, -d.y)).y;
  //float cy = LUMAD_tex(MAIN_pos).y;
  float by = LUMAD_tex(MAIN_pos + vec2(0.0, d.y)).y;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (tx + cx + cx + bx);
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (-ty + by);
  //Computes the luminance's gradient
  float sobel_norm = clamp(sqrt(xgrad * xgrad + ygrad * ygrad), 0.0, 1.0);
  float dval = clamp(power_function(clamp(sobel_norm, 0.0, 1.0)) * REFINE_STRENGTH + REFINE_BIAS, 0.0, 1.0);
  gl_FragColor = vec4(sobel_norm, dval, 0.0, 0.0);
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  if (LUMAD_tex(MAIN_pos).y < 0.1) {
    return vec4(0.0);
  }
  //[tl t tr]
  //[ l c r]
  //[bl b br]
  float l = LUMAD_tex(MAIN_pos + vec2(-d.x, 0.0)).x;
  float c = LUMAD_tex(MAIN_pos).x;
  float r = LUMAD_tex(MAIN_pos + vec2(d.x, 0.0)).x;
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
  gl_FragColor = vec4(xgrad, ygrad, 0.0, 0.0);
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

uniform sampler2D LUMAMM;
#define LUMAMM_pos (v_texture_coord)
#define LUMAMM_tex(pos) (texture2D(LUMAMM, pos))
#define LUMAMM_size (u_texture_size)
#define LUMAMM_pt (1.0 / LUMAMM_size)
#define LUMAMM_texOff(offset) (LUMAMM_tex(LUMAMM_pos + LUMAMM_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  if (LUMAD_tex(MAIN_pos).y < 0.1) {
    return vec4(0.0);
  }
  //[tl t tr]
  //[ l cc r]
  //[bl b br]
  float tx = LUMAMM_tex(MAIN_pos + vec2(0.0, -d.y)).x;
  float cx = LUMAMM_tex(MAIN_pos).x;
  float bx = LUMAMM_tex(MAIN_pos + vec2(0.0, d.y)).x;
  float ty = LUMAMM_tex(MAIN_pos + vec2(0.0, -d.y)).y;
  //float cy = LUMAMM_tex(MAIN_pos).y;
  float by = LUMAMM_tex(MAIN_pos + vec2(0.0, d.y)).y;
  //Horizontal Gradient
  //[-1 0 1]
  //[-2 0 2]
  //[-1 0 1]
  float xgrad = (tx + cx + cx + bx);
  //Vertical Gradient
  //[-1 -2 -1]
  //[ 0 0 0]
  //[ 1 2 1]
  float ygrad = (-ty + by);
  float norm = sqrt(xgrad * xgrad + ygrad * ygrad);
  if (norm <= 0.001) {
    xgrad = 0.0;
    ygrad = 0.0;
    norm = 1.0;
  }
  gl_FragColor = vec4(xgrad/norm, ygrad/norm, 0.0, 0.0);
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

uniform sampler2D LUMAD;
#define LUMAD_pos (v_texture_coord)
#define LUMAD_tex(pos) (texture2D(LUMAD, pos))
#define LUMAD_size (u_texture_size)
#define LUMAD_pt (1.0 / LUMAD_size)
#define LUMAD_texOff(offset) (LUMAD_tex(LUMAD_pos + LUMAD_pt * offset))

uniform sampler2D LUMAMM;
#define LUMAMM_pos (v_texture_coord)
#define LUMAMM_tex(pos) (texture2D(LUMAMM, pos))
#define LUMAMM_size (u_texture_size)
#define LUMAMM_pt (1.0 / LUMAMM_size)
#define LUMAMM_texOff(offset) (LUMAMM_tex(LUMAMM_pos + LUMAMM_pt * offset))

void main() {
  vec2 d = MAIN_pt;
  float dval = LUMAD_tex(MAIN_pos).y;
  if (dval < 0.1) {
    return MAIN_tex(MAIN_pos);
  }
  vec4 dc = LUMAMM_tex(MAIN_pos);
  if (abs(dc.x + dc.y) <= 0.0001) {
    return MAIN_tex(MAIN_pos);
  }
  float xpos = -sign(dc.x);
  float ypos = -sign(dc.y);
  vec4 xval = MAIN_tex(MAIN_pos + vec2(d.x * xpos, 0.0));
  vec4 yval = MAIN_tex(MAIN_pos + vec2(0.0, d.y * ypos));
  float xyratio = abs(dc.x) / (abs(dc.x) + abs(dc.y));
  vec4 avg = xyratio * xval + (1.0 - xyratio) * yval;
  gl_FragColor = avg * dval + MAIN_tex(MAIN_pos) * (1.0 - dval);
}
`;

export default class Anime4K_Upscale_Original_x2 extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;
  private program_4: WebGLProgram;
  private program_5: WebGLProgram;

  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_3 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_3_shader)!)!;
    this.program_4 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_4_shader)!)!;
    this.program_5 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_5_shader)!)!;
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
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_1, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_1, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_1, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
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
        if (textures.has('LUMAD')) {
          gl.deleteTexture(textures.get('LUMAD')!.texture);
        }
        textures.set('LUMAD', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
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
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_2, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_2, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_2, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_2, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_2, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_2, "LUMAD");
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
        textures.set('LUMAD', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
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
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width * 2), (MAIN.height * 2));
        gl.viewport(0, 0, (MAIN.width * 2), (MAIN.height * 2));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_3);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_3, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_3, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_3, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_3, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_3, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_3, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAMM')) {
          gl.deleteTexture(textures.get('LUMAMM')!.texture);
        }
        textures.set('LUMAMM', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const LUMAMM = textures.get('LUMAMM');
      if (!LUMAMM) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
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

        gl.useProgram(this.program_4);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_4, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_4, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_4, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_4, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_4, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_4, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, LUMAMM.texture);
        const LUMAMM_TextureLocation = gl.getUniformLocation(this.program_4, "LUMAMM");
        gl.uniform1i(LUMAMM_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('LUMAMM')) {
          gl.deleteTexture(textures.get('LUMAMM')!.texture);
        }
        textures.set('LUMAMM', { texture: output, width: (MAIN.width * 2), height: (MAIN.height * 2)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const LUMAD = textures.get('LUMAD');
      if (!LUMAD) { return; }
      const LUMAMM = textures.get('LUMAMM');
      if (!LUMAMM) { return; }
      const MAIN = textures.get('MAIN');
      if (!MAIN) { return; }
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

        gl.useProgram(this.program_5);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width * 2), (MAIN.height * 2))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, 'a_position', this.program_5, positionBuffer);
        enableVertexAttribArray(gl, 'a_texture_coord', this.program_5, texcoordBuffer);

        const resolutionLocation = gl.getUniformLocation(this.program_5, "u_resolution");
        gl.uniform2f(resolutionLocation, (MAIN.width * 2), (MAIN.height * 2));
        const textureSizeLocation = gl.getUniformLocation(this.program_5, "u_texture_size");
        gl.uniform2f(textureSizeLocation, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        const MAIN_TextureLocation = gl.getUniformLocation(this.program_5, "MAIN");
        gl.uniform1i(MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, LUMAD.texture);
        const LUMAD_TextureLocation = gl.getUniformLocation(this.program_5, "LUMAD");
        gl.uniform1i(LUMAD_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, LUMAMM.texture);
        const LUMAMM_TextureLocation = gl.getUniformLocation(this.program_5, "LUMAMM");
        gl.uniform1i(LUMAMM_TextureLocation, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE2);
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
