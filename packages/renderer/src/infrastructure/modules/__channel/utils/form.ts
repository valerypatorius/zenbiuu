/**
 * Returns text content of specified HTML element.
 * Note: images alt-attributes' values are treated as text
 */
export function getPlainTextFromHtml (element: HTMLElement): string {
  return [...element.childNodes].reduce<string[]>((result, node) => {
    if (node instanceof Image) {
      result.push(...[' ', node.alt, ' ']);
    } else if (node.textContent !== null) {
      result.push(node.textContent);
    }

    return result;
  }, []).join('').replace(/\s+/g, ' ').trim();
}
