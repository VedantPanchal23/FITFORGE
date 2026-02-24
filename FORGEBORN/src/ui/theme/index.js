/**
 * FORGEBORN THEME — INDEX
 * 
 * Central export for all theme values.
 */

import colors from './colors';
import typography, { textStyles, fontFamily, fontSize } from './typography';
import spacing, { screen, radius, shadows, zIndex } from './spacing';

export const theme = {
    colors,
    typography,
    textStyles,
    fontFamily,
    fontSize,
    spacing: spacing.spacing,
    screen,
    radius,
    shadows,
    zIndex,
};

export { colors, typography, textStyles, fontFamily, fontSize, screen, radius, shadows, zIndex };
export default theme;
