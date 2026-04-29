import { type TextureData } from "../utils";

export type Anime4KShaderConstructor = new (gl: WebGLRenderingContext) => Anime4KShader;

export default abstract class Anime4KShader {
  public abstract destroy(): void;
  public magnification(): [number, number] { return [1, 1]; };
  public hook_MAIN(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {}
  public hook_PREKERNEL(textures: Map<string, TextureData>, framebuffer: WebGLFramebuffer) {}
}