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

uniform sampler2D GAUSS_X2;
#define GAUSS_X2_pos (v_texture_coord)
#define GAUSS_X2_tex(pos) (texture2D(GAUSS_X2, pos))
#define GAUSS_X2_size (u_texture_size)
#define GAUSS_X2_pt (1.0 / GAUSS_X2_size)
#define GAUSS_X2_texOff(offset) (GAUSS_X2_tex(GAUSS_X2_pos + GAUSS_X2_pt * offset))

#define L_tex GAUSS_X2_tex
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

uniform sampler2D LINELUMA;
#define LINELUMA_pos (v_texture_coord)
#define LINELUMA_tex(pos) (texture2D(LINELUMA, pos))
#define LINELUMA_size (u_texture_size)
#define LINELUMA_pt (1.0 / LINELUMA_size)
#define LINELUMA_texOff(offset) (LINELUMA_tex(LINELUMA_pos + LINELUMA_pt * offset))

uniform sampler2D GAUSS_X2;
#define GAUSS_X2_pos (v_texture_coord)
#define GAUSS_X2_tex(pos) (texture2D(GAUSS_X2, pos))
#define GAUSS_X2_size (u_texture_size)
#define GAUSS_X2_pt (1.0 / GAUSS_X2_size)
#define GAUSS_X2_texOff(offset) (GAUSS_X2_tex(GAUSS_X2_pos + GAUSS_X2_pt * offset))

#define STRENGTH 0.6 //De-blur proportional strength, higher is sharper. However, it is better to tweak BLUR_CURVE instead to avoid ringing.
#define BLUR_CURVE 0.6 //De-blur power curve, lower is sharper. Good values are between 0.3 - 1. Values greater than 1 softens the image;
#define BLUR_THRESHOLD 0.1 //Value where curve kicks in, used to not de-blur already sharp edges. Only de-blur values that fall below this threshold.
#define NOISE_THRESHOLD 0.001 //Value where curve stops, used to not sharpen noise. Only de-blur values that fall above this threshold.
#define L_tex LINELUMA_tex
void main() {
  float c = (L_tex(MAIN_pos).x - GAUSS_X2_tex(MAIN_pos).x) * STRENGTH;
  float t_range = BLUR_THRESHOLD - NOISE_THRESHOLD;
  float c_t = abs(c);
  if (c_t > NOISE_THRESHOLD && c_t < BLUR_THRESHOLD) {
    c_t = (c_t - NOISE_THRESHOLD) / t_range;
    c_t = pow(c_t, BLUR_CURVE);
    c_t = c_t * t_range + NOISE_THRESHOLD;
    c_t = c_t * sign(c);
  } else {
    c_t = c;
  }
  float cc = clamp(c_t + L_tex(MAIN_pos).x, GAUSS_X2_tex(MAIN_pos).y, GAUSS_X2_tex(MAIN_pos).z) - L_tex(MAIN_pos).x;
  //This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
  //Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  gl_FragColor = MAIN_tex(MAIN_pos) + cc;
}
`;

export default class Anime4K_Upscale_Deblur_DoG_x2 extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_3: WebGLProgram;

  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_3 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_3_shader)!)!;
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
        if (textures.has('GAUSS_X2')) {
          gl.deleteTexture(textures.get('GAUSS_X2')!.texture);
        }
        textures.set('GAUSS_X2', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const GAUSS_X2 = textures.get('GAUSS_X2');
      if (!GAUSS_X2) { return; }
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
        gl.bindTexture(gl.TEXTURE_2D, GAUSS_X2.texture);
        const GAUSS_X2_TextureLocation = gl.getUniformLocation(this.program_2, "GAUSS_X2");
        gl.uniform1i(GAUSS_X2_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('GAUSS_X2')) {
          gl.deleteTexture(textures.get('GAUSS_X2')!.texture);
        }
        textures.set('GAUSS_X2', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
    {
      const HOOKED = textures.get('MAIN');
      if (!HOOKED) { return; }
      const GAUSS_X2 = textures.get('GAUSS_X2');
      if (!GAUSS_X2) { return; }
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
        gl.bindTexture(gl.TEXTURE_2D, LINELUMA.texture);
        const LINELUMA_TextureLocation = gl.getUniformLocation(this.program_3, "LINELUMA");
        gl.uniform1i(LINELUMA_TextureLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, GAUSS_X2.texture);
        const GAUSS_X2_TextureLocation = gl.getUniformLocation(this.program_3, "GAUSS_X2");
        gl.uniform1i(GAUSS_X2_TextureLocation, 2);
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
