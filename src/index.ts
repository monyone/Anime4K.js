import Anime4K_Clamp_Highlights from './glsl/Restore/Anime4K_Clamp_Highlights';
import Anime4K_Restore_CNN_M from './glsl/Restore/Anime4K_Restore_CNN_M';
import Anime4K_AutoDownscalePre_x2 from './glsl/Upscale/Anime4K_AutoDownscalePre_x2';
import Anime4K_AutoDownscalePre_x4 from './glsl/Upscale/Anime4K_AutoDownscalePre_x4';
import Anime4K_Upscale_CNN_x2_M from './glsl/Upscale/Anime4K_Upscale_CNN_x2_M';
import Anime4K_Upscale_CNN_x2_S from './glsl/Upscale/Anime4K_Upscale_CNN_x2_S';

export { default as VideoUpscaler } from './upscaler/video'
export { default as ImageUpscaler } from './upscaler/image'

export const ANIME4K_MAC_FAST_A = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_M,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_S
];

export const ANIME4KJS_SIMPLE = [
  Anime4K_Upscale_CNN_x2_M
];