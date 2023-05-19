import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../utils/index";
import flip from './flip.glsl';
import yuv from './to_yuv.glsl';

export default class ConvertRGBtoYUV {
  #gl: WebGLRenderingContext;
  #framebuffer: WebGLFramebuffer;
  #program: WebGLProgram;
  #program_tex: WebGLTexture;

  public constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
    this.#framebuffer = gl.createFramebuffer()!;
    this.#program = createProgram(gl,
      createVertexShader(gl, flip)!,
      createFragmentShader(gl, yuv)!,
    )!;
    this.#program_tex = createTexture(gl, gl.NEAREST)!;
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

  public render(info: TextureData): TextureData {
    const gl = this.#gl;

    const { width: in_width, height: in_height } = info;

    {
      this.#setupCommonSetting(this.#program,
        { texture: info.texture, width: in_width, height: in_height },
        { texture: this.#program_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);

      const sourceTextureLocation = gl.getUniformLocation(this.#program, "u_image");
      gl.uniform1i(sourceTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return {
      texture: this.#program_tex,
      width: in_width,
      height: in_height
    };
  }
}