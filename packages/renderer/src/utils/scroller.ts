/**
 * Helps to optimize scroll performance.
 * Pretty useless at the moment, as scroll stops sometimes
 */
export default class Scroller {
  element: HTMLElement;
  isScrolling: boolean;
  scrollTimeout: ReturnType<typeof setTimeout> | null;
  delay: number;
  scrollHandler: () => void;

  constructor (element: HTMLElement) {
    this.element = element;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.delay = 200;

    this.scrollHandler = this.onScroll.bind(this);

    this.element.addEventListener('scroll', this.scrollHandler);
  }

  /**
   * Remove event listener and clear timeout
   */
  destroy (): void {
    if (this.scrollTimeout != null) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = null;
    this.isScrolling = false;

    this.element.removeEventListener('scroll', this.scrollHandler);
  }

  /**
   * Debounce scroll finish via setTimeout
   */
  onScroll (): void {
    this.onScrollStarted();

    if (this.scrollTimeout != null) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.onScrollFinished();
    }, this.delay);
  }

  /**
   * Disable pointer events, when scroll is active
   */
  onScrollStarted (): void {
    if (this.isScrolling) {
      return;
    }

    this.isScrolling = true;

    /**
     * Temporarily disabled, because scroll sometimes stops working
     */
    // const firstChild = this.element.firstChild as HTMLElement;

    // if (firstChild) {
    //   firstChild.style.pointerEvents = 'none';
    // }
  }

  /**
   * Enable pointer events back, when scroll is ended
   */
  onScrollFinished (): void {
    if (!this.isScrolling) {
      return;
    }

    this.isScrolling = false;

    /**
     * Temporarily disabled, because scroll sometimes stops working
     */
    // const firstChild = this.element.firstChild as HTMLElement;

    // if (firstChild) {
    //   firstChild.style.pointerEvents = '';
    // }
  }
}
