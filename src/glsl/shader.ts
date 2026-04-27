export type Anime4KShaderConstructor = new (gl: WebGLRenderingContext) => Anime4KShader;

export default abstract class Anime4KShader {
  public abstract destroy(): void;
  public hook_MAIN(textures: Map<string, WebGLTexture>, framebuffer: WebGLFramebuffer) {}
  public hook_PREKERNEL(textures: Map<string, WebGLTexture>, framebuffer: WebGLFramebuffer) {}
}