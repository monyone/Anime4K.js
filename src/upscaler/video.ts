import PassThrough from "../glsl/passthrough";
import Anime4KShader from "../glsl/shader";
import { createTexture, TextureData } from "../utils/index";

export default class VideoUpscaler {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;

  private config: (new (gl: WebGLRenderingContext) => Anime4KShader)[];

  private textures = new Map<string, TextureData>();
  private framebuffer: WebGLFramebuffer | null = null;
  private programs: Anime4KShader[] | null = null;
  private passthrough: PassThrough | null = null;

  private readonly upscaleHandler: () => void = this.upscale.bind(this);
  private upscaleTimer: number | null = null;
  private upscaleTime: number = 0;
  private fps: number;
  private supported: boolean;

  public constructor(fps: number, config: (new (gl: WebGLRenderingContext) => Anime4KShader)[]) {
    this.supported = VideoUpscaler.isSupported();
    this.fps = fps;
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

  public start() {
    this.upscaleTimer = requestAnimationFrame(this.upscaleHandler);
    this.upscaleTime = performance.now();
  }
  public stop() {
    this.upscaleTime = 0;
    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }
    if (this.upscaleTimer == null) { return; }
    cancelAnimationFrame(this.upscaleTimer);
    this.upscaleTimer = null;
  }

  private upscale() {
    if (!this.supported) { return; }
    if (!this.video) { return; }
    if (!this.canvas) { return; }
    if (!this.gl) { return; }
    if (!this.framebuffer) { return; }
    if (!this.programs) { return; }
    if (!this.passthrough) { return; }

    const currentTime = performance.now();
    if ((currentTime - this.upscaleTime) * this.fps < 1000) {
      requestAnimationFrame(this.upscaleHandler);
      return;
    }
    this.upscaleTime = currentTime;

    const gl = this.gl;
    const framebuffer = this.framebuffer;
    const ext = gl.getExtension("OES_texture_half_float_linear") && gl.getExtension("OES_texture_half_float");

    // init texture
    const in_texture = createTexture(gl, gl.LINEAR);
    if (!in_texture) { return; }
    gl.bindTexture(gl.TEXTURE_2D, in_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, ext?.HALF_FLOAT_OES ?? gl.FLOAT, this.video);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const native_texture = createTexture(gl, gl.LINEAR);
    if (!native_texture) { return; }

    const output_texture = createTexture(gl, gl.LINEAR);
    if (!output_texture) { return; }

    const in_width = this.video.videoWidth, in_height = this.video.videoHeight;
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

    this.upscaleTimer = requestAnimationFrame(this.upscaleHandler);
  }

  public attachVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
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
      this.detachVideo();
    }
  }
  public detachVideo() {
    this.stop();
    this.gl = null;
    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }
    this.video = null;
    this.canvas = null;
  }
  private adjustCanvasSize() {
    if (!this.video) { return; }
    if (!this.canvas) { return; }

    this.canvas.width = this.video.videoWidth * 2;
    this.canvas.height = this.video.videoHeight * 2;
    this.canvas.style.pointerEvents = 'none';
  }
}