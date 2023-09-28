import Color from 'color';

/**
 * Returns destaurated rgb value for chat message author.
 * Do not allow clear white or black colors for readability
 */
export function getColorForChatAuthor (hex?: string): string {
  if (hex === undefined || hex.length === 0) {
    return '';
  }

  const color = Color(hex).desaturate(0.6).lighten(0.1);
  const restrictedColors = ['#000000', '#FFFFFF'];

  return !restrictedColors.includes(color.hex()) ? color.rgb().string() : '';
}
