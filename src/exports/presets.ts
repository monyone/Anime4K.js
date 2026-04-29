import Anime4K_Clamp_Highlights from '../glsl/Restore/Anime4K_Clamp_Highlights';
import Anime4K_Restore_CNN_L from '../glsl/Restore/Anime4K_Restore_CNN_L';
import Anime4K_Restore_CNN_M from '../glsl/Restore/Anime4K_Restore_CNN_M';
import Anime4K_Restore_CNN_S from '../glsl/Restore/Anime4K_Restore_CNN_S';
import Anime4K_Restore_CNN_Soft_M from '../glsl/Restore/Anime4K_Restore_CNN_Soft_M';
import Anime4K_Restore_CNN_Soft_S from '../glsl/Restore/Anime4K_Restore_CNN_Soft_S';
import Anime4K_Restore_CNN_Soft_VL from '../glsl/Restore/Anime4K_Restore_CNN_Soft_VL';
import Anime4K_Restore_CNN_UL from '../glsl/Restore/Anime4K_Restore_CNN_UL';
import Anime4K_Restore_CNN_VL from '../glsl/Restore/Anime4K_Restore_CNN_VL';
import Anime4K_Upscale_Denoise_CNN_x2_M from '../glsl/Upscale+Denoise/Anime4K_Upscale_Denoise_CNN_x2_M';
import Anime4K_Upscale_Denoise_CNN_x2_VL from '../glsl/Upscale+Denoise/Anime4K_Upscale_Denoise_CNN_x2_VL';
import Anime4K_AutoDownscalePre_x2 from '../glsl/Upscale/Anime4K_AutoDownscalePre_x2';
import Anime4K_AutoDownscalePre_x4 from '../glsl/Upscale/Anime4K_AutoDownscalePre_x4';
import Anime4K_Upscale_CNN_x2_L from '../glsl/Upscale/Anime4K_Upscale_CNN_x2_L';
import Anime4K_Upscale_CNN_x2_M from '../glsl/Upscale/Anime4K_Upscale_CNN_x2_M';
import Anime4K_Upscale_CNN_x2_S from '../glsl/Upscale/Anime4K_Upscale_CNN_x2_S';
import Anime4K_Upscale_CNN_x2_UL from '../glsl/Upscale/Anime4K_Upscale_CNN_x2_UL';
import Anime4K_Upscale_CNN_x2_VL from '../glsl/Upscale/Anime4K_Upscale_CNN_x2_VL';
import { type Anime4KShaderConstructor } from '../glsl/shader';

export const ignoreAutoDownscalePre = (config: Anime4KShaderConstructor[]): Anime4KShaderConstructor[] => {
  return config.filter((program) => program !== Anime4K_AutoDownscalePre_x2 && program !== Anime4K_AutoDownscalePre_x4);
}

export const ANIME4K_LOWEREND_MODE_A_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_M,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_LOWEREND_MODE_B_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_Soft_M,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_LOWEREND_MODE_C_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Upscale_Denoise_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_LOWEREND_MODE_A: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_M,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_Soft_S,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_LOWEREND_MODE_B: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_Soft_M,
  Anime4K_Upscale_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_Soft_S,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_LOWEREND_MODE_C: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Upscale_Denoise_CNN_x2_M,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_S,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4K_HIGHEREND_MODE_A_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_VL,
  Anime4K_Upscale_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4K_HIGHEREND_MODE_B_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_Soft_VL,
  Anime4K_Upscale_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4K_HIGHEREND_MODE_C_FAST: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Upscale_Denoise_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4K_HIGHEREND_MODE_A: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_VL,
  Anime4K_Upscale_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_Soft_M,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4K_HIGHEREND_MODE_B: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_Soft_VL,
  Anime4K_Upscale_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_Soft_M,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4K_HIGHEREND_MODE_C: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Upscale_Denoise_CNN_x2_VL,
  Anime4K_AutoDownscalePre_x2,
  Anime4K_AutoDownscalePre_x4,
  Anime4K_Restore_CNN_M,
  Anime4K_Upscale_CNN_x2_M
];


// For Original preset
export const ANIME4KJS_EMPTY: Anime4KShaderConstructor[] = [];
export const ANIME4KJS_SIMPLE_S_2X: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_S,
  Anime4K_Upscale_CNN_x2_S
];
export const ANIME4KJS_SIMPLE_M_2X: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_M,
  Anime4K_Upscale_CNN_x2_M
];
export const ANIME4KJS_SIMPLE_L_2X: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_L,
  Anime4K_Upscale_CNN_x2_L
];
export const ANIME4KJS_SIMPLE_VL_2X: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_VL,
  Anime4K_Upscale_CNN_x2_VL
];
export const ANIME4KJS_SIMPLE_UL_2X: Anime4KShaderConstructor[] = [
  Anime4K_Clamp_Highlights,
  Anime4K_Restore_CNN_UL,
  Anime4K_Upscale_CNN_x2_UL
];
