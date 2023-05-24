import PassThrough from "../glsl/passthrough";
import Anime4KShader from "../glsl/shader";
import { createTexture, TextureData } from "../utils/index";

export default class VideoUpscaler {
  private source: TexImageSource | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;

  private config: (new (gl: WebGLRenderingContext) => Anime4KShader)[];

  private textures = new Map<string, TextureData>();
  private framebuffer: WebGLFramebuffer | null = null;
  private programs: Anime4KShader[] | null = null;
  private passthrough: PassThrough | null = null;

  private supported: boolean;

  public constructor(config: (new (gl: WebGLRenderingContext) => Anime4KShader)[]) {
    this.supported = VideoUpscaler.isSupported();
    this.config = config;
  }

  public static isSupported(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) { return false; }
    if (gl.getExtension("OES_texture_float") == null) { return false; }
    if (gl.getExtension("OES_texture_float_linear") == null) { return false; }
    return true;
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
    const in_texture = createTexture(gl, gl.LINEAR);
    if (!in_texture) { return; }
    gl.bindTexture(gl.TEXTURE_2D, in_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, this.source);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const native_texture = createTexture(gl, gl.LINEAR);
    if (!native_texture) { return; }
    gl.bindTexture(gl.TEXTURE_2D, in_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, this.source);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const output_texture = createTexture(gl, gl.LINEAR);
    if (!output_texture) { return; }

    const in_width = this.source instanceof HTMLVideoElement ? this.source.videoWidth : this.source.width;
    const in_height = this.source instanceof HTMLVideoElement ? this.source.videoHeight : this.source.height;
    const out_width = this.canvas.width, out_height = this.canvas.height;

    // use Texture
    {
      if (this.textures.has('NATIVE')) {
        gl.deleteTexture(this.textures.get('NATIVE')!.texture);
        this.textures.delete('NATIVE');
      }
      this.textures.set('NATIVE', { texture: native_texture, width: in_width, height: in_height });
    }
    {
      if (this.textures.has('OUTPUT')) {
        gl.deleteTexture(this.textures.get('OUTPUT')!.texture);
        this.textures.delete('OUTPUT');
      }
      this.textures.set('OUTPUT', { texture: output_texture, width: out_width, height: out_height });
    }
    {
      if (this.textures.has('MAIN')) {
        gl.deleteTexture(this.textures.get('MAIN')!.texture);
        this.textures.delete('MAIN');
      }
      this.textures.set('MAIN', { texture: in_texture, width: in_width, height: in_height });
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

    this.canvas.style.visibility = 'visible';
  }

  public attachSource(source: TexImageSource, canvas: HTMLCanvasElement) {
    this.source = source;
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl', {
      premultipliedAlpha: false,
      stencil: false,
      depth: false
    });
    if (this.gl && this.gl.getExtension("OES_texture_float") && this.gl.getExtension("OES_texture_float_linear")) {
      const gl = this.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.framebuffer = gl.createFramebuffer()!;

      this.programs = this.config.map((constuctor) => new constuctor(gl));
      this.passthrough = new PassThrough(gl);
      this.adjustCanvasSize();
    } else {
      this.detachSource();
    }
  }
  public detachSource() {
    this.gl = null;
    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }
    this.source = null;
    this.canvas = null;
  }
  private adjustCanvasSize() {
    if (!this.source) { return; }
    if (!this.canvas) { return; }

    const in_width = this.source instanceof HTMLVideoElement ? this.source.videoWidth : this.source.width;
    const in_height = this.source instanceof HTMLVideoElement ? this.source.videoHeight : this.source.height;
    this.canvas.width = in_width * 2;
    this.canvas.height = in_height * 2;
    this.canvas.style.pointerEvents = 'none';
  }
}