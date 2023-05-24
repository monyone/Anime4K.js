import PassThrough from "./glsl/passthrough";
import Anime4K_Clamp_Highlights from "./glsl/Restore/Anime4K_Clamp_Highlights";
import Anime4K_Restore_CNN_M from "./glsl/Restore/Anime4K_Restore_CNN_M";
import Anime4K_Restore_CNN_VL from "./glsl/Restore/Anime4K_Restore_CNN_VL";
import Anime4KShader from "./glsl/shader";
import Anime4K_AutoDownscalePre_x2 from "./glsl/Upscale/Anime4K_AutoDownscalePre_x2";
import Anime4K_AutoDownscalePre_x4 from "./glsl/Upscale/Anime4K_AutoDownscalePre_x4";
import Anime4K_Upscale_CNN_x2_M from "./glsl/Upscale/Anime4K_Upscale_CNN_x2_M";
import Anime4K_Upscale_CNN_x2_S from "./glsl/Upscale/Anime4K_Upscale_CNN_x2_S";
import Anime4K_Upscale_CNN_x2_VL from "./glsl/Upscale/Anime4K_Upscale_CNN_x2_VL";
import { createTexture, TextureData } from "./utils/index";

export const useWebGL = (source: TexImageSource, canvas: HTMLCanvasElement): void => {
  const in_width = (source instanceof HTMLVideoElement) ? source.videoWidth : source.width;
  const in_height = (source instanceof HTMLVideoElement) ? source.videoHeight : source.height;

  const out_width = in_width * 2, out_height = in_height * 2;
  //const out_width = in_width, out_height = in_height;
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

  /*
  const programs = [
    new Anime4K_Clamp_Highlights(gl),
    new Anime4K_Restore_CNN_VL(gl),
    new Anime4K_AutoDownscalePre_x2(gl),
    new Anime4K_AutoDownscalePre_x4(gl),
    new Anime4K_Upscale_CNN_x2_VL(gl),
  ];
  */
  const programs: Anime4KShader[] = [
    new Anime4K_Clamp_Highlights(gl),
    new Anime4K_Restore_CNN_M(gl),
    new Anime4K_Upscale_CNN_x2_M(gl),
    new Anime4K_AutoDownscalePre_x2(gl),
    new Anime4K_AutoDownscalePre_x4(gl),
    new Anime4K_Upscale_CNN_x2_S(gl),
  ];

  const passthrough = new PassThrough(gl);

  // ignore build
  const pref_start = performance.now();


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

  const native_texture = createTexture(gl, gl.LINEAR);
  if (!native_texture) { return; }
  gl.bindTexture(gl.TEXTURE_2D, in_texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, source);
  gl.bindTexture(gl.TEXTURE_2D, null);

  const output_texture = createTexture(gl, gl.LINEAR);
  if (!output_texture) { return; }

  const framebuffer = gl.createFramebuffer()!;
  const textures = new Map<string, TextureData>();
  {
    if (textures.has('NATIVE')) {
      gl.deleteTexture(textures.get('NATIVE')!.texture);
      textures.delete('NATIVE');
    }
    textures.set('NATIVE', { texture: native_texture, width: in_width, height: in_height });
  }
  {
    if (textures.has('OUTPUT')) {
      gl.deleteTexture(textures.get('OUTPUT')!.texture);
      textures.delete('OUTPUT');
    }
    textures.set('OUTPUT', { texture: output_texture, width: out_width, height: out_height });
  }
  {
    if (textures.has('MAIN')) {
      gl.deleteTexture(textures.get('MAIN')!.texture);
      textures.delete('MAIN');
    }
    textures.set('MAIN', { texture: in_texture, width: in_width, height: in_height });
  }
  programs.forEach((program) => program.hook_MAIN(textures, framebuffer));

  if (textures.has('MAIN')){
    const MAIN = textures.get('MAIN')!;
    textures.set('PREKERNEL', MAIN);
    textures.delete('MAIN');
    programs.forEach((program) => program.hook_PREKERNEL(textures, framebuffer));
  }

  //texture = clamp.render({ texture: in_texture, width: in_width, height: in_height }, texture);

  passthrough.render(textures.get('PREKERNEL')!, out_width, out_height);
  gl.flush();

  const pref_end = performance.now();
  //console.log(pref_end - pref_start);
};