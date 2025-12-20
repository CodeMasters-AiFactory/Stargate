/**
 * Design Tokens Type System
 * Merlin 7.0 - Design System Engine 2.0
 */

export interface DesignTokens {
  typography: TypographyScale;
  colors: ColorPalette;
  shadows: ShadowSystem;
  spacing: SpacingScale;
  components: ComponentTokens;
  theme: ThemeTokens;
}

export interface TypographyScale {
  fontFamilies: {
    heading: string;
    body: string;
    mono?: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  contrast: {
    aa: boolean; // WCAG AA compliance
    aaa: boolean; // WCAG AAA compliance
    ratios: {
      primaryText: number;
      secondaryText: number;
      linkText: number;
    };
  };
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ShadowSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface ComponentTokens {
  button: {
    primary: ComponentVariant;
    secondary: ComponentVariant;
    outline: ComponentVariant;
    ghost: ComponentVariant;
  };
  card: {
    default: ComponentVariant;
    elevated: ComponentVariant;
  };
  input: ComponentVariant;
  badge: ComponentVariant;
}

export interface ComponentVariant {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
  shadow?: string;
}

export interface ThemeTokens {
  mode: 'light' | 'dark' | 'auto';
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  zIndex: {
    base: number;
    dropdown: number;
    sticky: number;
    fixed: number;
    modal: number;
    popover: number;
    tooltip: number;
  };
}

