import { createVertexShader, createFragmentShader, createRectangleBuffer, createTexture, createProgram, enableVertexAttribArray, TextureData, fillEmptyTexture } from "../../../utils/index";
import noflip from '../../no_flip.glsl';
import conv2d_tf from './conv2d_tf.glsl';
import conv2d_tf1 from './conv2d_tf1.glsl';
import conv2d_1_tf from './conv2d_1_tf.glsl';
import conv2d_1_tf1 from './conv2d_1_tf1.glsl';
import conv2d_2_tf from './conv2d_2_tf.glsl';
import conv2d_2_tf1 from './conv2d_2_tf1.glsl';
import conv2d_3_tf from './conv2d_3_tf.glsl';
import conv2d_3_tf1 from './conv2d_3_tf1.glsl';
import conv2d_4_tf from './conv2d_4_tf.glsl';
import conv2d_4_tf1 from './conv2d_4_tf1.glsl';
import conv2d_5_tf from './conv2d_5_tf.glsl';
import conv2d_5_tf1 from './conv2d_5_tf1.glsl';
import conv2d_6_tf from './conv2d_6_tf.glsl';
import conv2d_6_tf1 from './conv2d_6_tf1.glsl';
import conv2d_7_tf from './conv2d_7_tf.glsl';
import conv2d_7_tf1 from './conv2d_7_tf1.glsl';
import main from './MAIN.glsl';

export default class Anime4K_Restore_CNN_VL {
  #gl: WebGLRenderingContext;
  #framebuffer: WebGLFramebuffer;
  #conv2d_tf: WebGLProgram;
  #conv2d_tf1: WebGLProgram;
  #conv2d_1_tf: WebGLProgram;
  #conv2d_1_tf1: WebGLProgram;
  #conv2d_2_tf: WebGLProgram;
  #conv2d_2_tf1: WebGLProgram;
  #conv2d_3_tf: WebGLProgram;
  #conv2d_3_tf1: WebGLProgram;
  #conv2d_4_tf: WebGLProgram;
  #conv2d_4_tf1: WebGLProgram;
  #conv2d_5_tf: WebGLProgram;
  #conv2d_5_tf1: WebGLProgram;
  #conv2d_6_tf: WebGLProgram;
  #conv2d_6_tf1: WebGLProgram;
  #conv2d_7_tf: WebGLProgram;
  #conv2d_7_tf1: WebGLProgram;
  #main: WebGLProgram;

  #conv2d_tf_tex: WebGLTexture;
  #conv2d_tf1_tex: WebGLTexture;
  #conv2d_1_tf_tex: WebGLTexture;
  #conv2d_1_tf1_tex: WebGLTexture;
  #conv2d_2_tf_tex: WebGLTexture;
  #conv2d_2_tf1_tex: WebGLTexture;
  #conv2d_3_tf_tex: WebGLTexture;
  #conv2d_3_tf1_tex: WebGLTexture;
  #conv2d_4_tf_tex: WebGLTexture;
  #conv2d_4_tf1_tex: WebGLTexture;
  #conv2d_5_tf_tex: WebGLTexture;
  #conv2d_5_tf1_tex: WebGLTexture;
  #conv2d_6_tf_tex: WebGLTexture;
  #conv2d_6_tf1_tex: WebGLTexture;
  #conv2d_7_tf_tex: WebGLTexture;
  #conv2d_7_tf1_tex: WebGLTexture;
  #main_tex: WebGLTexture;

  public constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
    this.#framebuffer = gl.createFramebuffer()!;
    this.#conv2d_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_tf)!,
    )!;
    this.#conv2d_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_tf1)!,
    )!;
    this.#conv2d_1_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_1_tf)!,
    )!;
    this.#conv2d_1_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_1_tf1)!,
    )!;
    this.#conv2d_2_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_2_tf)!,
    )!;
    this.#conv2d_2_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_2_tf1)!,
    )!;
    this.#conv2d_3_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_3_tf)!,
    )!;
    this.#conv2d_3_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_3_tf1)!,
    )!;
    this.#conv2d_4_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_4_tf)!,
    )!;
    this.#conv2d_4_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_4_tf1)!,
    )!;
    this.#conv2d_5_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_5_tf)!,
    )!;
    this.#conv2d_5_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_5_tf1)!,
    )!;
    this.#conv2d_6_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_6_tf)!,
    )!;
    this.#conv2d_6_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_6_tf1)!,
    )!;
    this.#conv2d_7_tf = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_7_tf)!,
    )!;
    this.#conv2d_7_tf1 = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, conv2d_7_tf1)!,
    )!;
    this.#main = createProgram(gl,
      createVertexShader(gl, noflip)!,
      createFragmentShader(gl, main)!,
    )!;
    this.#conv2d_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_1_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_1_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_2_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_2_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_3_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_3_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_4_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_4_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_5_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_5_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_6_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_6_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_7_tf_tex = createTexture(gl, gl.NEAREST)!;
    this.#conv2d_7_tf1_tex = createTexture(gl, gl.NEAREST)!;
    this.#main_tex = createTexture(gl, gl.NEAREST)!;
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
    const out_width = in_width, out_height = in_height;

    {
      this.#setupCommonSetting(this.#conv2d_tf,
        { texture: info.texture, width: in_width, height: in_height },
        { texture: this.#conv2d_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);

      const mainTextureLocation = gl.getUniformLocation(this.#conv2d_tf, "MAIN");
      gl.uniform1i(mainTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_tf1,
        { texture: info.texture, width: in_width, height: in_height },
        { texture: this.#conv2d_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);

      const mainTextureLocation = gl.getUniformLocation(this.#conv2d_tf1, "MAIN");
      gl.uniform1i(mainTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_1_tf,
        { texture: this.#conv2d_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_1_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf1_tex);

      const conv2d_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_1_tf, "conv2d_tf");
      gl.uniform1i(conv2d_tf_TextureLocation, 0);
      const conv2d_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_1_tf, "conv2d_tf1");
      gl.uniform1i(conv2d_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_1_tf1,
        { texture: this.#conv2d_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_1_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf1_tex);

      const conv2d_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_1_tf1, "conv2d_tf");
      gl.uniform1i(conv2d_tf_TextureLocation, 0);
      const conv2d_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_1_tf1, "conv2d_tf1");
      gl.uniform1i(conv2d_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_2_tf,
        { texture: this.#conv2d_1_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_2_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf1_tex);

      const conv2d_1_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_2_tf, "conv2d_1_tf");
      gl.uniform1i(conv2d_1_tf_TextureLocation, 0);
      const conv2d_1_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_2_tf, "conv2d_1_tf1");
      gl.uniform1i(conv2d_1_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_2_tf1,
        { texture: this.#conv2d_1_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_2_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf1_tex);

      const conv2d_1_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_2_tf1, "conv2d_1_tf");
      gl.uniform1i(conv2d_1_tf_TextureLocation, 0);
      const conv2d_1_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_2_tf1, "conv2d_1_tf1");
      gl.uniform1i(conv2d_1_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_3_tf,
        { texture: this.#conv2d_2_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_3_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf1_tex);

      const conv2d_2_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_3_tf, "conv2d_2_tf");
      gl.uniform1i(conv2d_2_tf_TextureLocation, 0);
      const conv2d_2_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_3_tf, "conv2d_2_tf1");
      gl.uniform1i(conv2d_2_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_3_tf1,
        { texture: this.#conv2d_2_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_3_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf1_tex);

      const conv2d_2_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_3_tf1, "conv2d_2_tf");
      gl.uniform1i(conv2d_2_tf_TextureLocation, 0);
      const conv2d_2_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_3_tf1, "conv2d_2_tf1");
      gl.uniform1i(conv2d_2_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_4_tf,
        { texture: this.#conv2d_3_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_4_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf1_tex);

      const conv2d_3_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_4_tf, "conv2d_3_tf");
      gl.uniform1i(conv2d_3_tf_TextureLocation, 0);
      const conv2d_3_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_4_tf, "conv2d_3_tf1");
      gl.uniform1i(conv2d_3_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_4_tf1,
        { texture: this.#conv2d_3_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_4_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf1_tex);

      const conv2d_3_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_4_tf1, "conv2d_3_tf");
      gl.uniform1i(conv2d_3_tf_TextureLocation, 0);
      const conv2d_3_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_4_tf1, "conv2d_3_tf1");
      gl.uniform1i(conv2d_3_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_5_tf,
        { texture: this.#conv2d_4_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_5_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf1_tex);

      const conv2d_4_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_5_tf, "conv2d_4_tf");
      gl.uniform1i(conv2d_4_tf_TextureLocation, 0);
      const conv2d_4_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_5_tf, "conv2d_4_tf1");
      gl.uniform1i(conv2d_4_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_5_tf1,
        { texture: this.#conv2d_4_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_5_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf1_tex);

      const conv2d_4_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_5_tf1, "conv2d_4_tf");
      gl.uniform1i(conv2d_4_tf_TextureLocation, 0);
      const conv2d_4_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_5_tf1, "conv2d_4_tf1");
      gl.uniform1i(conv2d_4_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_6_tf,
        { texture: this.#conv2d_5_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_6_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf1_tex);

      const conv2d_5_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_6_tf, "conv2d_5_tf");
      gl.uniform1i(conv2d_5_tf_TextureLocation, 0);
      const conv2d_5_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_6_tf, "conv2d_5_tf1");
      gl.uniform1i(conv2d_5_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_6_tf1,
        { texture: this.#conv2d_5_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_6_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf1_tex);

      const conv2d_5_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_6_tf1, "conv2d_5_tf");
      gl.uniform1i(conv2d_5_tf_TextureLocation, 0);
      const conv2d_5_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_6_tf1, "conv2d_5_tf1");
      gl.uniform1i(conv2d_5_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_7_tf,
        { texture: this.#conv2d_6_tf_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_7_tf_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf1_tex);

      const conv2d_6_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_7_tf, "conv2d_6_tf");
      gl.uniform1i(conv2d_6_tf_TextureLocation, 0);
      const conv2d_6_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_7_tf, "conv2d_6_tf1");
      gl.uniform1i(conv2d_6_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#conv2d_7_tf1,
        { texture: this.#conv2d_6_tf1_tex, width: in_width, height: in_height },
        { texture: this.#conv2d_7_tf1_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf1_tex);

      const conv2d_6_tf_TextureLocation = gl.getUniformLocation(this.#conv2d_7_tf1, "conv2d_6_tf");
      gl.uniform1i(conv2d_6_tf_TextureLocation, 0);
      const conv2d_6_tf1_TextureLocation = gl.getUniformLocation(this.#conv2d_7_tf1, "conv2d_6_tf1");
      gl.uniform1i(conv2d_6_tf1_TextureLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    {
      this.#setupCommonSetting(this.#main,
        { texture: this.#conv2d_7_tf_tex, width: in_width, height: in_height },
        { texture: this.#main_tex, width: in_width, height: in_height },
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf_tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_tf1_tex);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf_tex);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_1_tf1_tex);
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf_tex);
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_2_tf1_tex);
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf_tex);
      gl.activeTexture(gl.TEXTURE7);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_3_tf1_tex);
      gl.activeTexture(gl.TEXTURE8);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf_tex);
      gl.activeTexture(gl.TEXTURE9);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_4_tf1_tex);
      gl.activeTexture(gl.TEXTURE10);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf_tex);
      gl.activeTexture(gl.TEXTURE11);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_5_tf1_tex);
      gl.activeTexture(gl.TEXTURE12);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf_tex);
      gl.activeTexture(gl.TEXTURE13);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_6_tf1_tex);
      gl.activeTexture(gl.TEXTURE14);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_7_tf_tex);
      gl.activeTexture(gl.TEXTURE15);
      gl.bindTexture(gl.TEXTURE_2D, this.#conv2d_7_tf1_tex);
      gl.activeTexture(gl.TEXTURE16);
      gl.bindTexture(gl.TEXTURE_2D, info.texture);

      const conv2d_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_tf");
      gl.uniform1i(conv2d_tf_TextureLocation, 0);
      const conv2d_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_tf1");
      gl.uniform1i(conv2d_tf1_TextureLocation, 1);
      const conv2d_1_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_1_tf");
      gl.uniform1i(conv2d_1_tf_TextureLocation, 2);
      const conv2d_1_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_1_tf1");
      gl.uniform1i(conv2d_1_tf1_TextureLocation, 3);
      const conv2d_2_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_2_tf");
      gl.uniform1i(conv2d_2_tf_TextureLocation, 4);
      const conv2d_2_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_2_tf1");
      gl.uniform1i(conv2d_2_tf1_TextureLocation, 5);
      const conv2d_3_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_3_tf");
      gl.uniform1i(conv2d_3_tf_TextureLocation, 6);
      const conv2d_3_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_3_tf1");
      gl.uniform1i(conv2d_3_tf1_TextureLocation, 7);
      const conv2d_4_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_4_tf");
      gl.uniform1i(conv2d_4_tf_TextureLocation, 8);
      const conv2d_4_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_4_tf1");
      gl.uniform1i(conv2d_4_tf1_TextureLocation, 9);
      const conv2d_5_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_5_tf");
      gl.uniform1i(conv2d_5_tf_TextureLocation, 10);
      const conv2d_5_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_5_tf1");
      gl.uniform1i(conv2d_5_tf1_TextureLocation, 11);
      const conv2d_6_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_6_tf");
      gl.uniform1i(conv2d_6_tf_TextureLocation, 12);
      const conv2d_6_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_6_tf1");
      gl.uniform1i(conv2d_6_tf1_TextureLocation, 13);
      const conv2d_7_tf_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_7_tf");
      gl.uniform1i(conv2d_7_tf_TextureLocation, 14);
      const conv2d_7_tf1_TextureLocation = gl.getUniformLocation(this.#main, "conv2d_7_tf1");
      gl.uniform1i(conv2d_7_tf1_TextureLocation, 15);
      const mainTextureLocation = gl.getUniformLocation(this.#main, "MAIN");
      gl.uniform1i(mainTextureLocation, 16);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    return {
      texture: this.#main_tex,
      width: out_width,
      height: out_height
    };
  }
}