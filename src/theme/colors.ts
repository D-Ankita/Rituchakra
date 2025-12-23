import { Phase } from '../types/phase';

export const colors = {
  phase: {
    menstrual: '#c88181', // primary-container
    follicular: '#ceeacd', // secondary-container
    ovulation: '#ffddb9', // tertiary-fixed
    luteal: '#4c644e', // secondary
  } as Record<Phase, string>,

  phaseLight: {
    menstrual: '#ffb3b2', // inverse-primary / dim
    follicular: '#e5f3e4', // lighter tint
    ovulation: '#ffeedb', // lighter tint
    luteal: '#829a84', // lighter secondary
  } as Record<Phase, string>,

  hormone: {
    estrogen: '#c88181',
    progesterone: '#4c644e',
    energy: '#c18942', // tertiary-container
  },

  background: '#fdf9f3',
  surface: '#ffffff',
  surfaceAlt: '#f7f3ed', // surface-container-low

  text: {
    primary: '#1c1c18', // on-surface
    secondary: '#422700', // on-tertiary-container
    tertiary: '#857372', // outline
    inverse: '#ffffff',
  },

  border: '#d7c2c1', // outline-variant
  divider: '#e6e2dc', // surface-variant
  error: '#ba1a1a',
  success: '#ceeacd',
  predicted: '#dddad4',
};
