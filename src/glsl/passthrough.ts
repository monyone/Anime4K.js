import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData } from "../utils/index";

const flip = `
precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texture_coord;

uniform vec2 u_resolution;

varying vec2 v_texture_coord;

void main() {
  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texture_coord = a_texture_coord;
}
`;

const pass = `
precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texture_coord;

void main() {
  gl_FragColor = texture2D(u_image, v_texture_coord);
}
`

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