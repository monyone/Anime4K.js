import PassThrough from "../glsl/passthrough";
import type Anime4KShader from "../glsl/shader";
import { type Anime4KShaderConstructor } from "../glsl/shader";
import { createTexture, type TextureData } from "../utils/index";

const useVideoFrameCallback = (media?: HTMLVideoElement, fps?: number) => {
  if (fps != null) { return false; }
  return typeof media?.requestVideoFrameCallback === 'function';
};

const requestFrame = (callback: () => void, media?: HTMLVideoElement, fps?: number): number => {
  if (media?.requestVideoFrameCallback && useVideoFrameCallback(media, fps)) {
    return media.requestVideoFrameCallback(callback);
  }
  return requestAnimationFrame(callback);
}
const cancelFrame = (handle: number, media?: HTMLVideoElement, fps?: number): void => {
  if (media?.cancelVideoFrameCallback && useVideoFrameCallback(media, fps)) {
    media.cancelVideoFrameCallback(handle);
    return;
  }
  cancelAnimationFrame(handle);
}

export default class VideoUpscaler {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;

  private scale: number | null = null;
  private config: Anime4KShaderConstructor[];

  private textures = new Map<string, TextureData>();
  private in_texture: WebGLTexture | null = null;
  private native_texture: WebGLTexture | null = null;
  private output_texture: WebGLTexture | null = null;

  private framebuffer: WebGLFramebuffer | null = null;
  private programs: Anime4KShader[] | null = null;
  private passthrough: PassThrough | null = null;

  private readonly upscaleHandler: () => void = this.upscale.bind(this);
  private upscaleTimer: number | null = null;
  private running: boolean = false;
  private upscaleTime: number = 0;
  private fps: number | undefined;
  private supported: boolean;

  public constructor(config: Anime4KShaderConstructor[], fps?: number) {
    this.supported = VideoUpscaler.isSupported();
    this.config = config;
    this.fps = fps;
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
    this.running = true;
    this.upscaleTime = 0;
    this.upscale();
  }
  public stop() {
    this.running = false;
    this.upscaleTime = 0;
    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }
    if (this.upscaleTimer == null) { return; }
    cancelFrame(this.upscaleTimer, this.video ?? undefined, this.fps);
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

    if (!this.running) { return; }
    this.adjustCanvasSize();

    const currentTime = performance.now();
    if (!useVideoFrameCallback(this.video, this.fps) && (currentTime - this.upscaleTime) * (this.fps ?? Number.POSITIVE_INFINITY) < 1000) {
      this.upscaleTimer = requestFrame(this.upscaleHandler, this.video, this.fps);
      return;
    }
    this.upscaleTime = currentTime;

    const gl = this.gl;
    const framebuffer = this.framebuffer;

    // init texture
    const in_texture = this.in_texture;
    if (!in_texture) { return; }
    gl.bindTexture(gl.TEXTURE_2D, in_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const native_texture = this.native_texture;
    if (!native_texture) { return; }

    const output_texture = this.output_texture;
    if (!output_texture) { return; }

    const in_width = this.video.videoWidth, in_height = this.video.videoHeight;
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
    this.canvas.style.visibility = 'visible';

    this.upscaleTimer = requestFrame(this.upscaleHandler, this.video, this.fps);
  }

  public attachVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl', {
      premultipliedAlpha: false,
      stencil: false,
      depth: false
    });
    if (this.gl && this.gl.getExtension("OES_texture_float") && this.gl.getExtension("OES_texture_float_linear") && this.gl.getExtension("EXT_color_buffer_half_float")) {
      const gl = this.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.framebuffer = gl.createFramebuffer()!;

      this.in_texture = createTexture(gl, gl.LINEAR);
      this.native_texture = createTexture(gl, gl.LINEAR);
      this.output_texture = createTexture(gl, gl.LINEAR);

      this.programs = this.config.map((constuctor) => new constuctor(gl));
      this.scale = null;
      this.passthrough = new PassThrough(gl);
      this.adjustCanvasSize();
    } else {
      this.detachVideo();
    }
  }
  public detachVideo() {
    this.stop();

    (this.programs ?? []).forEach((program) => program.destroy());
    this.gl?.deleteFramebuffer(this.framebuffer);
    this.gl?.deleteTexture(this.in_texture);
    this.gl?.deleteTexture(this.native_texture);
    this.gl?.deleteTexture(this.output_texture);
    this.in_texture = this.native_texture = this.output_texture = null;

    this.gl = null;
    this.framebuffer = null;
    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }
    this.video = null;
    this.canvas = null;
  }
  private adjustCanvasSize() {
    if (!this.video) { return; }
    if (!this.canvas) { return; }

    if (this.scale == null) {
      this.scale = (this.programs ?? []).reduce((scale, program) => scale * program.magnification(), 1);
    }

    const width = this.video.videoWidth * this.scale;
    const height = this.video.videoHeight * this.scale;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.canvas.style.pointerEvents = 'none';
  }
}