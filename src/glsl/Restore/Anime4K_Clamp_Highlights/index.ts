import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../../../utils/index";
import noflip from '../../no_flip.glsl';
import main from './MAIN.glsl';
import statsmax from './STATSMAX.glsl';
import prekernel from './PREKERNEL.glsl';

export default class Anime4K_Clamp_Highlight {
  #gl: WebGLRenderingContext;
  #framebuffer: WebGLFramebuffer;
  #main: WebGLProgram;
  #statsmax: WebGLProgram;
  #prekernel: WebGLProgram;

  #main_tex: WebGLTexture;
  #statsmax_tex: WebGLTexture;
  #prekernel_tex: WebGLTexture;

  public constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
    this.#framebuffer = gl.createFramebuffer()!;
    this.#main = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, main)!,
    )!;
    this.#statsmax = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, statsmax)!,
    )!;
    this.#prekernel = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, prekernel)!,
    )!;
    this.#main_tex = createTexture(gl, gl.NEAREST)!;
    this.#statsmax_tex = createTexture(gl, gl.NEAREST)!;
    this.#prekernel_tex = createTexture(gl, gl.NEAREST)!;
  }

  #setupCommonSetting(program: WebGLProgram, src: TextureData, dst: TextureData) {
    const gl = this.#gl;

    gl.viewport(0, 0, dst.width, dst.height);

    fillEmptyTexture(gl, dst.texture, dst.width, dst.height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dst.texture, 0);

    gl.useProgram(program);
    const positionBuffer = createRectangleBuffer(gl, 0, 0, dst.width, dst.height)!;
    const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

    enableVertexAttribArray(gl, 'a_position', program, positionBuffer);
    enableVertexAttribArray(gl, 'a_texture_coord', program, texcoordBuffer);
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, dst.width, dst.height);
    const textureSizeLocation = gl.getUniformLocation(program, "u_texture_size");
    gl.uniform2f(textureSizeLocation, src.width, src.height);
  }

  public render(source: TextureData, upscaled: TextureData): TextureData {
    const gl = this.#gl;

    const { width: in_width, height: in_height } = source;
    const { width: out_width, height: out_height} = upscaled;

    {
      this.#setupCommonSetting(this.#main,
        { texture: source.texture, width: in_width, height: in_height },
        { texture: this.#main_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, source.texture);

      const sourceTextureLocation = gl.getUniformLocation(this.#main, "MAIN");
      gl.uniform1i(sourceTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#statsmax,
        { texture: this.#main_tex, width: in_width, height: in_height },
        { texture: this.#statsmax_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#main_tex);

      const mainTextureLocation = gl.getUniformLocation(this.#statsmax, "STATSMAX");
      gl.uniform1i(mainTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#prekernel,
        { texture: this.#statsmax_tex, width: in_width, height: in_height },
        { texture: this.#prekernel_tex, width: out_width, height: out_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, upscaled.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#statsmax_tex);

      const prekernelTextureLocation = gl.getUniformLocation(this.#prekernel, "PREKERNEL");
      gl.uniform1i(prekernelTextureLocation, 0);
      const statsmaxTextureLocation = gl.getUniformLocation(this.#prekernel, "STATSMAX");
      gl.uniform1i(statsmaxTextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return {
      texture: this.#prekernel_tex,
      width: out_width,
      height: out_height
    };
  }
}