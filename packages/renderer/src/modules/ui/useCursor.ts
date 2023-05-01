import { useEventListener } from '@vueuse/core';
import { ref, type Ref } from 'vue';

const SPACE = ' ';

export function useCursor (target: Ref<HTMLElement | undefined>): {
  appendNodeAtCursor: (node: Node) => void;
} {
  const range = ref<Range>();

  function appendNodeAtCursor (node: Node): void {
    if (target.value === undefined) {
      return;
    }

    const postSpaceNode = document.createTextNode(SPACE);

    /**
     * If range is not present, simply append node at the end of the target
     */
    if (range.value === undefined) {
      target.value.appendChild(node);
      target.value.appendChild(postSpaceNode);

      return;
    }

    const preSpaceNode = document.createTextNode(SPACE);

    /**
     * Selected text will be deleted
     */
    range.value.deleteContents();

    /**
     * When nodes are not inserted at the start, append space before
     */
    if (range.value.startOffset > 0) {
      /**
       * Insert space node before
       */
      range.value.insertNode(preSpaceNode);

      /**
       * If space exists before, remove it
       */
      if (preSpaceNode.previousSibling?.textContent === SPACE) {
        preSpaceNode.previousSibling.remove();
      }

      /**
       * Set cursor after space node
       */
      range.value.setStartAfter(preSpaceNode);
    }

    /**
     * Insert new node
     */
    range.value.insertNode(node);

    /**
     * Set cursor after inserted node
     */
    range.value.setStartAfter(node);

    /**
     * Insert space node after
     */
    range.value.insertNode(postSpaceNode);

    /**
     * If space exists after, remove it
     */
    if (postSpaceNode.nextSibling?.textContent === SPACE) {
      postSpaceNode.nextSibling.remove();
    }

    /**
     * Set cursor after space node
     */
    range.value.setStartAfter(postSpaceNode);

    /**
     * Collapse range to a single point
     */
    range.value.collapse();

    /**
     * Remove all ranges just to be sure no mess will be made
     */
    document.getSelection()?.removeAllRanges();

    /**
     * Set focus to allow typing
     */
    document.getSelection()?.addRange(range.value);
  }

  function updateRange (): void {
    const sel = document.getSelection();

    /**
     * Do not proceed, if selection is not present
     */
    if (sel === null || sel.rangeCount === 0) {
      return;
    }

    const selectedRange = sel.getRangeAt(0);
    const isSelectionInTarget = target.value?.contains(selectedRange.commonAncestorContainer) === true;

    /**
     * Do not proceed, if selection was made outside the target element
     */
    if (!isSelectionInTarget) {
      return;
    }

    /**
     * Get first range (as Chrome does not support multiple selections),
     * clone it (as it is being updated when selection changes) and save
     */
    range.value = sel.getRangeAt(0).cloneRange();
  }

  useEventListener(document, 'selectionchange', updateRange);

  return {
    appendNodeAtCursor,
  };
}
