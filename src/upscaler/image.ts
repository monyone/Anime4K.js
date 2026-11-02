import PassThrough from "../glsl/passthrough";
import type Anime4KShader from "../glsl/shader";
import { type Anime4KShaderConstructor } from "../glsl/shader";
import { createTexture, TextureData } from "../utils/index";

const isFloatLinearTextureSupported = (gl: WebGLRenderingContext): boolean => {
  const half_float = gl.getExtension("OES_texture_half_float") != null && gl.getExtension("OES_texture_half_float_linear") != null && gl.getExtension("EXT_color_buffer_half_float") != null;
  const float = gl.getExtension("OES_texture_float") != null && gl.getExtension("OES_texture_float_linear") != null && gl.getExtension("WEBGL_color_buffer_float") != null;
  return half_float || float;
};

const texSourceResolution = (source: TexImageSource): [number, number] => {
  const ImageBitmap = self.ImageBitmap ?? (class{});
  const HTMLVideoElement = self.HTMLVideoElement ?? (class{});
  const VideoFrame = self.VideoFrame ?? (class{});
  if (source instanceof ImageBitmap) { return [source.width, source.height]; }
  if (source instanceof HTMLVideoElement) { return [source.videoWidth, source.videoHeight]; }
  if (source instanceof VideoFrame) { return [source.displayWidth, source.displayHeight]; }
  return [source.width, source.height];
};

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
const isDOM = (canvas: CanvasLike): canvas is HTMLCanvasElement => {
  const HTMLCanvasElement = self.HTMLCanvasElement ?? (class{});
  return canvas instanceof HTMLCanvasElement;
}
const getContext = (canvas: CanvasLike | null | undefined, options: WebGLContextAttributes): WebGLRenderingContext | null => {
  if (canvas == null) { return null; }
  if (isDOM(canvas)) {
    return canvas.getContext('webgl', options);
  } else {
    return canvas.getContext('webgl', options);
  }
}

export default class ImageUpscaler {
  private source: TexImageSource | null = null;
  private canvas: CanvasLike | null = null;
  private gl: WebGLRenderingContext | null = null;

  private scale: [number, number] | null = null;
  private config: Anime4KShaderConstructor[];

  private textures = new Map<string, TextureData>();
  private in_texture: WebGLTexture | null = null;
  private native_texture: WebGLTexture | null = null;
  private output_texture: WebGLTexture | null = null;
  private framebuffer: WebGLFramebuffer | null = null;
  private programs: Anime4KShader[] | null = null;
  private passthrough: PassThrough | null = null;

  private supported: boolean;

  public constructor(config: Anime4KShaderConstructor[]) {
    this.supported = ImageUpscaler.isSupported();
    this.config = config;
  }

  public static isSupported(): boolean {
    const canvas = new OffscreenCanvas(0,0)
    const gl = canvas.getContext('webgl');
    if (!gl) { return false; }
    return isFloatLinearTextureSupported(gl);
  }

  public upscale() {
    if (!this.supported) { return; }
    if (!this.source) { return; }
    if (!this.canvas) { return; }
    if (!this.gl) { return; }
    if (!this.framebuffer) { return; }
    if (!this.programs) { return; }
    if (!this.passthrough) { return; }

    const gl = this.gl;
    const framebuffer = this.framebuffer;

    // init texture
    const in_texture = this.in_texture;
    if (!in_texture) { return; }
    gl.bindTexture(gl.TEXTURE_2D, in_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const native_texture = this.native_texture;
    if (!native_texture) { return; }

    const output_texture = this.output_texture;
    if (!output_texture) { return; }

    const [in_width, in_height] = texSourceResolution(this.source);
    const out_width = this.canvas.width, out_height = this.canvas.height;

    // use Texture
    {
      const native = this.textures.get('NATIVE')
      if (native == null || native.width !== in_width || native.height !== in_height) {
        this.textures.set('NATIVE', { texture: native_texture, width: in_width, height: in_height });
      }
    }
    {
      const output = this.textures.get('OUTPUT')
      if (output == null || output.width !== out_width || output.height !== out_height) {
        this.textures.set('OUTPUT', { texture: output_texture, width: out_width, height: out_height });
      }
    }
    {
      const main = this.textures.get('MAIN');
      if (main == null || main.width !== in_width || main.height !== in_height) {
        this.textures.set('MAIN', { texture: in_texture, width: in_width, height: in_height });
      }
    }

    this.programs.forEach((program) => program.hook_MAIN(this.textures, framebuffer!));

    if (this.textures.has('MAIN')){
      const MAIN = this.textures.get('MAIN')!;
      this.textures.set('PREKERNEL', MAIN);
      this.textures.delete('MAIN');
      this.programs.forEach((program) => program.hook_PREKERNEL(this.textures, framebuffer));
    }

    this.passthrough.render(this.textures.get('PREKERNEL')!, out_width, out_height);

    gl.flush();

    if (isDOM(this.canvas)) {
      this.canvas.style.visibility = 'visible';
    }
  }

  public attachSource(source: TexImageSource, canvas: CanvasLike) {
    this.detachSource(); // force detach for already attached resources

    this.source = source;
    this.canvas = canvas;
    this.gl = getContext(canvas, {
      premultipliedAlpha: false,
      stencil: false,
      depth: false
    });
    if (this.gl && isFloatLinearTextureSupported(this.gl)) {
      const gl = this.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.in_texture = createTexture(gl, gl.LINEAR);
      this.native_texture = createTexture(gl, gl.LINEAR);
      this.output_texture = createTexture(gl, gl.LINEAR);

      this.framebuffer = gl.createFramebuffer()!;

      this.programs = this.config.map((constuctor) => new constuctor(gl));
      this.scale = null;
      this.passthrough = new PassThrough(gl);
      this.adjustCanvasSize();
    } else {
      this.detachSource();
    }
  }
  public detachSource() {
    (this.programs ?? []).forEach((program) => program.destroy());
    this.programs = null;
    this.passthrough?.destroy();
    this.passthrough = null;

    this.gl?.deleteFramebuffer(this.framebuffer);
    this.framebuffer = null;

    this.gl?.deleteTexture(this.in_texture);
    this.gl?.deleteTexture(this.native_texture);
    this.gl?.deleteTexture(this.output_texture);
    this.in_texture = this.native_texture = this.output_texture = null;
    this.textures.clear();

    this.gl = null;
    if (this.canvas && isDOM(this.canvas)) {
      this.canvas.style.visibility = 'hidden';
    }
    this.source = null;
    this.canvas = null;
  }
  private adjustCanvasSize() {
    if (!this.source) { return; }
    if (!this.canvas) { return; }

    if (this.scale == null) {
      let w = 1, h = 1;
      for (const program of this.programs ?? []) {
        const [x, y] = program.magnification();
        w *= x;
        h *= y;
      }
      this.scale = [w, h];
    }

    const [in_width, in_height] = texSourceResolution(this.source);
    this.canvas.width = in_width * this.scale[0];
    this.canvas.height = in_height * this.scale[1];

    if (isDOM(this.canvas)) {
      this.canvas.style.pointerEvents = 'none';
    }
  }
}