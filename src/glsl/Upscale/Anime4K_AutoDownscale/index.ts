import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../../../utils/index";
import noflip from '../../no_flip.glsl';
import pass from '../../pass.glsl';

export default class Anime4K_AutoDownscale {
  #gl: WebGLRenderingContext;
  #program: WebGLProgram;
  #framebuffer: WebGLFramebuffer;
  #program_tex: WebGLTexture;

  public constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
    this.#framebuffer = gl.createFramebuffer()!;
    this.#program = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, pass)!,
    )!;
    this.#program_tex = createTexture(gl, gl.NEAREST)!;
  }

  public render(info: TextureData):  TextureData {
    const gl = this.#gl;

    const { width: in_width, height: in_height } = info;
    const out_width = in_width / 2, out_height = in_height / 2;

    {
      gl.viewport(0, 0, out_width, out_height);
      fillEmptyTexture(gl, this.#program_tex, out_width, out_height);

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.#program_tex, 0);

      gl.useProgram(this.#program);
      const positionBuffer = createRectangleBuffer(gl, 0, 0, out_width, out_height)!;
      const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

      enableVertexAttribArray(gl, 'a_position', this.#program, positionBuffer);
      enableVertexAttribArray(gl, 'a_texture_coord', this.#program, texcoordBuffer);
      const resolutionLocation = gl.getUniformLocation(this.#program, "u_resolution");
      gl.uniform2f(resolutionLocation, out_width, out_height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return {
      texture: this.#program_tex,
      width: out_width,
      height: out_height
    };
  }
}