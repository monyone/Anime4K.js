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

#define KERNELSIZE 5 //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE 2 //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}
void main() {
  float gmax = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float g = get_luma(MAIN_texOff(vec2(i - KERNELHALFSIZE, 0)));
    gmax = max(g, gmax);
  }
  gl_FragColor = vec4(gmax, 0.0, 0.0, 0.0);
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

uniform sampler2D STATSMAX;
#define STATSMAX_pos (v_texture_coord)
#define STATSMAX_tex(pos) (texture2D(STATSMAX, pos))
#define STATSMAX_size (u_texture_size)
#define STATSMAX_pt (1.0 / STATSMAX_size)
#define STATSMAX_texOff(offset) (STATSMAX_tex(STATSMAX_pos + STATSMAX_pt * offset))

#define KERNELSIZE 5 //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE 2 //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
void main() {
  float gmax = 0.0;
  for (int i=0; i<KERNELSIZE; i++) {
    float g = STATSMAX_texOff(vec2(0, i - KERNELHALFSIZE)).x;
    gmax = max(g, gmax);
  }
  gl_FragColor = vec4(gmax, 0.0, 0.0, 0.0);
}
`;
const fragment_2_shader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_texture_size;
varying vec2 v_texture_coord;
uniform sampler2D PREKERNEL;
#define PREKERNEL_pos (v_texture_coord)
#define PREKERNEL_tex(pos) (texture2D(PREKERNEL, pos))
#define PREKERNEL_size (u_texture_size)
#define PREKERNEL_pt (1.0 / PREKERNEL_size)
#define PREKERNEL_texOff(offset) (PREKERNEL_tex(PREKERNEL_pos + PREKERNEL_pt * offset))

uniform sampler2D STATSMAX;
#define STATSMAX_pos (v_texture_coord)
#define STATSMAX_tex(pos) (texture2D(STATSMAX, pos))
#define STATSMAX_size (u_texture_size)
#define STATSMAX_pt (1.0 / STATSMAX_size)
#define STATSMAX_texOff(offset) (STATSMAX_tex(STATSMAX_pos + STATSMAX_pt * offset))

float get_luma(vec4 rgba) {
  return dot(vec4(0.299, 0.587, 0.114, 0.0), rgba);
}
void main() {
  float current_luma = get_luma(PREKERNEL_tex(PREKERNEL_pos));
  float new_luma = min(current_luma, STATSMAX_tex(PREKERNEL_pos).x);
  //This trick is only possible if the inverse Y->RGB matrix has 1 for every row... (which is the case for BT.709)
  //Otherwise we would need to convert RGB to YUV, modify Y then convert back to RGB.
  gl_FragColor = vec4((PREKERNEL_tex(PREKERNEL_pos) - (current_luma - new_luma)).rgb, 1);
}
`;

export default class Anime4K_Clamp_Highlights extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;
  private program_1: WebGLProgram;
  private program_2: WebGLProgram;
  private program_0_a_position_location: number;
  private program_1_a_position_location: number;
  private program_2_a_position_location: number;
  private program_0_a_texture_coord_location: number;
  private program_1_a_texture_coord_location: number;
  private program_2_a_texture_coord_location: number;
  private program_0_u_resolution_location: WebGLUniformLocation | null;
  private program_1_u_resolution_location: WebGLUniformLocation | null;
  private program_2_u_resolution_location: WebGLUniformLocation | null;
  private program_0_u_texture_size_location: WebGLUniformLocation | null;
  private program_1_u_texture_size_location: WebGLUniformLocation | null;
  private program_2_u_texture_size_location: WebGLUniformLocation | null;
  private program_0_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_1_MAIN_TextureLocation: WebGLUniformLocation | null
  private program_1_STATSMAX_TextureLocation: WebGLUniformLocation | null
  private program_2_PREKERNEL_TextureLocation: WebGLUniformLocation | null
  private program_2_STATSMAX_TextureLocation: WebGLUniformLocation | null


  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
    this.program_1 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_1_shader)!)!;
    this.program_2 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_2_shader)!)!;
    this.program_0_a_position_location = gl.getAttribLocation(this.program_0, "a_position");
    gl.enableVertexAttribArray(this.program_0_a_position_location);
    this.program_1_a_position_location = gl.getAttribLocation(this.program_1, "a_position");
    gl.enableVertexAttribArray(this.program_1_a_position_location);
    this.program_2_a_position_location = gl.getAttribLocation(this.program_2, "a_position");
    gl.enableVertexAttribArray(this.program_2_a_position_location);
    this.program_0_a_texture_coord_location = gl.getAttribLocation(this.program_0, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_0_a_texture_coord_location);
    this.program_1_a_texture_coord_location = gl.getAttribLocation(this.program_1, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_1_a_texture_coord_location);
    this.program_2_a_texture_coord_location = gl.getAttribLocation(this.program_2, "a_texture_coord");
    gl.enableVertexAttribArray(this.program_2_a_texture_coord_location);
    this.program_0_u_resolution_location = gl.getUniformLocation(this.program_0, "u_resolution");
    this.program_1_u_resolution_location = gl.getUniformLocation(this.program_1, "u_resolution");
    this.program_2_u_resolution_location = gl.getUniformLocation(this.program_2, "u_resolution");
    this.program_0_u_texture_size_location = gl.getUniformLocation(this.program_0, "u_texture_size");
    this.program_1_u_texture_size_location = gl.getUniformLocation(this.program_1, "u_texture_size");
    this.program_2_u_texture_size_location = gl.getUniformLocation(this.program_2, "u_texture_size");
    this.program_0_MAIN_TextureLocation = gl.getUniformLocation(this.program_0, "MAIN")
    this.program_1_MAIN_TextureLocation = gl.getUniformLocation(this.program_1, "MAIN")
    this.program_1_STATSMAX_TextureLocation = gl.getUniformLocation(this.program_1, "STATSMAX")
    this.program_2_PREKERNEL_TextureLocation = gl.getUniformLocation(this.program_2, "PREKERNEL")
    this.program_2_STATSMAX_TextureLocation = gl.getUniformLocation(this.program_2, "STATSMAX")
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
        if (textures.has('STATSMAX')) {
          gl.deleteTexture(textures.get('STATSMAX')!.texture);
        }
        textures.set('STATSMAX', { texture: output, width: (MAIN.width), height: (MAIN.height)});
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
      const STATSMAX = textures.get('STATSMAX');
      if (!STATSMAX) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (MAIN.width), (MAIN.height));
        gl.viewport(0, 0, (MAIN.width), (MAIN.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_1);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (MAIN.width), (MAIN.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_1_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_1_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_1_u_resolution_location, (MAIN.width), (MAIN.height));
        gl.uniform2f(this.program_1_u_texture_size_location, MAIN.width, MAIN.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, MAIN.texture);
        gl.uniform1i(this.program_1_MAIN_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, STATSMAX.texture);
        gl.uniform1i(this.program_1_STATSMAX_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('STATSMAX')) {
          gl.deleteTexture(textures.get('STATSMAX')!.texture);
        }
        textures.set('STATSMAX', { texture: output, width: (MAIN.width), height: (MAIN.height)});
      }
    }
  }

  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {
    const gl = this.gl;
    {
      const HOOKED = textures.get('PREKERNEL');
      if (!HOOKED) { return; }
      const NATIVE = textures.get('NATIVE');
      if (!NATIVE) { return; }
      const OUTPUT = textures.get('OUTPUT');
      if (!OUTPUT) { return; }
      const PREKERNEL = textures.get('PREKERNEL');
      if (!PREKERNEL) { return; }
      const STATSMAX = textures.get('STATSMAX');
      if (!STATSMAX) { return; }
     {
        const output = createTexture(gl, gl.NEAREST)!;
        fillEmptyTexture(gl, output, (PREKERNEL.width), (PREKERNEL.height));
        gl.viewport(0, 0, (PREKERNEL.width), (PREKERNEL.height));
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output, 0);

        gl.useProgram(this.program_2);

        const positionBuffer = createRectangleBuffer(gl, 0, 0, (PREKERNEL.width), (PREKERNEL.height))!;
        const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

        enableVertexAttribArray(gl, this.program_2_a_position_location, positionBuffer);
        enableVertexAttribArray(gl, this.program_2_a_texture_coord_location, texcoordBuffer);

        gl.uniform2f(this.program_2_u_resolution_location, (PREKERNEL.width), (PREKERNEL.height));
        gl.uniform2f(this.program_2_u_texture_size_location, PREKERNEL.width, PREKERNEL.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, PREKERNEL.texture);
        gl.uniform1i(this.program_2_PREKERNEL_TextureLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, STATSMAX.texture);
        gl.uniform1i(this.program_2_STATSMAX_TextureLocation, 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texcoordBuffer);
        if (textures.has('PREKERNEL')) {
          gl.deleteTexture(textures.get('PREKERNEL')!.texture);
        }
        textures.set('PREKERNEL', { texture: output, width: (PREKERNEL.width), height: (PREKERNEL.height)});
      }
    }
  }
}
