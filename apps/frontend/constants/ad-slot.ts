export const AD_SLOT_TYPES = [
  'DISPLAY',
  'VIDEO',
  'NATIVE',
  'NEWSLETTER',
  'PODCAST',
] as const;

export const VALID_AD_SLOT_TYPES = [...AD_SLOT_TYPES] as string[];
