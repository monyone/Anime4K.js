import PassThrough from "./glsl/passthrough";
import Anime4K_Clamp_Highlight from "./glsl/Restore/Anime4K_Clamp_Highlights/index";
import Anime4K_Restore_CNN_VL from "./glsl/Restore/Anime4K_Restore_CNN_VL/index";
import ConvertSRGBGamma from "./glsl/srgb_gamma";
import Anime4K_UpscaleDenoise_CNN_x2_M from "./glsl/Upscale+Denoise/Anime4K_Upscale_Denoise_CNN_x2_M/index";
import Anime4K_AutoDownscale from "./glsl/Upscale/Anime4K_AutoDownscale/index";
import Anime4K_Upscale_CNN_x2_VL from "./glsl/Upscale/Anime4K_Upscale_CNN_x2_VL/index";
import { createTexture, TextureData } from "./utils/index";

export const useWebGL = (source: TexImageSource, canvas: HTMLCanvasElement): void => {
  const in_width = (source instanceof HTMLVideoElement) ? source.videoWidth : source.width;
  const in_height = (source instanceof HTMLVideoElement) ? source.videoHeight : source.height;

  //const out_width = in_width * 2, out_height = in_height * 2;
  const out_width = in_width, out_height = in_height;
  canvas.width = out_width;
  canvas.height = out_height;

  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: false,
    stencil: false,
    depth: false
  });
  if (!gl) { return; }

  if (gl.getExtension("OES_texture_float") == null) { return; }
  if (gl.getExtension("OES_texture_float_linear") == null) { return; }

  const restore = new Anime4K_Restore_CNN_VL(gl);
  const upscale = new Anime4K_Upscale_CNN_x2_VL(gl);
  const downscale = new Anime4K_AutoDownscale(gl);
  const clamp = new Anime4K_Clamp_Highlight(gl);
  const passthrough = new PassThrough(gl);

  //
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);

  // BEGIN LOOP

  //
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //
  const in_texture = createTexture(gl, gl.LINEAR);
  if (!in_texture) { return; }
  gl.bindTexture(gl.TEXTURE_2D, in_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, source);
  gl.bindTexture(gl.TEXTURE_2D, null);


  let texture: TextureData = { texture: in_texture, width: in_width, height: in_height };
  texture = restore.render(texture);
  //texture = upscale.render(texture);
  //texture = clamp.render({ texture: in_texture, width: in_width, height: in_height }, texture);

  //
  passthrough.render(texture, out_width, out_height);

  gl.flush();
};