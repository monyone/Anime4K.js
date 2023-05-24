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

#define INTENSITY_SIGMA 0.1 //Intensity window size, higher is stronger denoise, must be a positive real number
#define SPATIAL_SIGMA 1.0 //Spatial window size, higher is stronger denoise, must be a positive real number.
#define INTENSITY_POWER_CURVE 1.0 //Intensity window power curve. Setting it to 0 will make the intensity window treat all intensities equally, while increasing it will make the window narrower in darker intensities and wider in brighter intensities.
#define KERNELSIZE (max(int(ceil(SPATIAL_SIGMA * 2.0)), 1) * 2 + 1) //Kernel size, must be an positive odd integer.
#define KERNELHALFSIZE (int(KERNELSIZE/2)) //Half of the kernel size without remainder. Must be equal to trunc(KERNELSIZE/2).
#define KERNELLEN (KERNELSIZE * KERNELSIZE) //Total area of kernel. Must be equal to KERNELSIZE * KERNELSIZE.
#define GETOFFSET(i) vec2((i % KERNELSIZE) - KERNELHALFSIZE, (i / KERNELSIZE) - KERNELHALFSIZE)
vec4 gaussian_vec(vec4 x, vec4 s, vec4 m) {
  vec4 scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
float gaussian(float x, float s, float m) {
  float scaled = (x - m) / s;
  return exp(-0.5 * scaled * scaled);
}
void main() {
  vec4 sum = vec4(0.0);
  vec4 n = vec4(0.0);
  vec4 vc = MAIN_tex(MAIN_pos);
  vec4 is = pow(vc + 0.0001, vec4(INTENSITY_POWER_CURVE)) * INTENSITY_SIGMA;
  float ss = SPATIAL_SIGMA;
  for (int i=0; i<KERNELLEN; i++) {
    vec2 ipos = GETOFFSET(i);
    vec4 v = MAIN_texOff(ipos);
    vec4 d = gaussian_vec(v, is, vc) * gaussian(length(ipos), ss, 0.0);
    sum += d * v;
    n += d;
  }
  gl_FragColor = sum / n;
}
`;

export default class Anime4K_Denoise_Bilateral_Mean extends Anime4KShader {
  private gl: WebGLRenderingContext;
  private program_0: WebGLProgram;

  public constructor(gl: WebGLRenderingContext) {
    super();
    this.gl = gl;
    this.program_0 = createProgram(gl, createVertexShader(gl, vertex_shader)!, createFragmentShader(gl,  fragment_0_shader)!)!;
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
