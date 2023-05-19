import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData } from "../utils/index";
import flip from './flip.glsl';
import pass from './pass.glsl';

export default class PassThrough {
  #gl: WebGLRenderingContext;
  #program: WebGLProgram;

  public constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
    this.#program = createProgram(gl,
      createVertexShader(gl, flip)!,
      createFragmentShader(gl, pass)!,
    )!;
  }

  public render(texture: TextureData, out_width: number, out_height: number): void {
    const gl = this.#gl;

    const { texture: in_texture } = texture;

    {
      gl.viewport(0, 0, out_width, out_height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, in_texture);

      gl.useProgram(this.#program);
      const positionBuffer = createRectangleBuffer(gl, 0, 0, out_width, out_height)!;
      const texcoordBuffer = createRectangleBuffer(gl, 0, 0, 1, 1)!;

      enableVertexAttribArray(gl, 'a_position', this.#program, positionBuffer);
      enableVertexAttribArray(gl, 'a_texture_coord', this.#program, texcoordBuffer);
      const resolutionLocation = gl.getUniformLocation(this.#program, "u_resolution");
      gl.uniform2f(resolutionLocation, out_width, out_height);

      const sourceTextureLocation = gl.getUniformLocation(this.#program, "u_image");
      gl.uniform1i(sourceTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
}