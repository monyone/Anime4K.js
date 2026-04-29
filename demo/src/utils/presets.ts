import type { Anime4KShaderConstructor } from 'anime4k.js'
import {
  ignoreAutoDownscalePre,
  ANIME4KJS_SIMPLE_S_2X,
  ANIME4KJS_SIMPLE_M_2X,
  ANIME4KJS_SIMPLE_L_2X,
  ANIME4KJS_SIMPLE_VL_2X,
  ANIME4KJS_SIMPLE_UL_2X,
  ANIME4K_LOWEREND_MODE_A,
  ANIME4K_LOWEREND_MODE_B,
  ANIME4K_LOWEREND_MODE_C,
  ANIME4K_LOWEREND_MODE_A_FAST,
  ANIME4K_LOWEREND_MODE_B_FAST,
  ANIME4K_LOWEREND_MODE_C_FAST,
  ANIME4K_HIGHEREND_MODE_A,
  ANIME4K_HIGHEREND_MODE_B,
  ANIME4K_HIGHEREND_MODE_C,
  ANIME4K_HIGHEREND_MODE_A_FAST,
  ANIME4K_HIGHEREND_MODE_B_FAST,
  ANIME4K_HIGHEREND_MODE_C_FAST,
} from 'anime4k.js'

export type PresetEntry = {
  label: string
  value: string
  config: Anime4KShaderConstructor[]
}

export default [
  { label: 'Simple S (2x)', value: 'simple-s', config: ANIME4KJS_SIMPLE_S_2X },
  { label: 'Simple M (2x)', value: 'simple-m', config: ANIME4KJS_SIMPLE_M_2X },
  { label: 'Simple L (2x)', value: 'simple-l', config: ANIME4KJS_SIMPLE_L_2X },
  { label: 'Simple VL (2x)', value: 'simple-vl', config: ANIME4KJS_SIMPLE_VL_2X },
  { label: 'Simple UL (2x)', value: 'simple-ul', config: ANIME4KJS_SIMPLE_UL_2X },
  { label: 'Higher-End Mode A', value: 'higher-a', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_A) },
  { label: 'Higher-End Mode B', value: 'higher-b', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_B) },
  { label: 'Higher-End Mode C', value: 'higher-c', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_C) },
  { label: 'Higher-End Mode A (Fast)', value: 'higher-a-fast', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_A_FAST) },
  { label: 'Higher-End Mode B (Fast)', value: 'higher-b-fast', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_B_FAST) },
  { label: 'Higher-End Mode C (Fast)', value: 'higher-c-fast', config: ignoreAutoDownscalePre(ANIME4K_HIGHEREND_MODE_C_FAST) },
  { label: 'Lower-End Mode A', value: 'lower-a', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_A) },
  { label: 'Lower-End Mode B', value: 'lower-b', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_B) },
  { label: 'Lower-End Mode C', value: 'lower-c', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_C) },
  { label: 'Lower-End Mode A (Fast)', value: 'lower-a-fast', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_A_FAST) },
  { label: 'Lower-End Mode B (Fast)', value: 'lower-b-fast', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_B_FAST) },
  { label: 'Lower-End Mode C (Fast)', value: 'lower-c-fast', config: ignoreAutoDownscalePre(ANIME4K_LOWEREND_MODE_C_FAST) },
] satisfies PresetEntry[];
