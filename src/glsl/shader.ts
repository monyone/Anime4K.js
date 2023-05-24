export default abstract class Anime4KShader {
  public hook_MAIN(textures: Map<string, WebGLTexture>, framebuffer: WebGLFramebuffer) {}
  public hook_PREKERNEL(textures: Map<string, WebGLTexture>, framebuffer: WebGLFramebuffer) {}
}