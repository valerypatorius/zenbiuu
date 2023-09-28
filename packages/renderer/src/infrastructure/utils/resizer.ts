interface ResizerParams {
  axis: Axis;
  value: number;
  limit: {
    min: number;
    max: number;
  };
  multiplier?: number;
  onResize: (value: number) => void;
  onStop: (value: number) => void;
}

/**
 * Available resize axes
 */
export enum Axis {
  X = 'x',
  Y = 'y',
}

/**
 * Helps with resizing of DOM-elements
 */
export default class Resizer {
  axis: Axis;
  value: number;

  limit: {
    min: number;
    max: number;
  };

  multiplier: number;
  prevClientValue: number;
  isResizing: boolean;
  onResize: (value: number) => void;
  onStop: (value: number) => void;
  processHandler: (event: MouseEvent) => void;
  stopHandler: () => void;

  constructor (params: ResizerParams) {
    this.axis = params.axis;
    this.value = params.value;
    this.limit = params.limit;
    this.multiplier = params.multiplier ?? 1;
    this.prevClientValue = 0;
    this.isResizing = false;

    this.onResize = params.onResize;
    this.onStop = params.onStop;

    this.processHandler = this.process.bind(this);
    this.stopHandler = this.stop.bind(this);
  }

  /**
   * Remove events listeners and reset body cursor
   */
  destroy (): void {
    this.prevClientValue = 0;
    this.isResizing = false;

    document.removeEventListener('mousemove', this.processHandler);
    document.removeEventListener('mouseup', this.stopHandler);

    document.body.style.cursor = '';
  }

  /**
   * Start chat resize
   */
  start (clientValue: number): void {
    if (this.isResizing) {
      return;
    }

    this.isResizing = true;
    this.prevClientValue = clientValue;

    document.addEventListener('mousemove', this.processHandler);
    document.addEventListener('mouseup', this.stopHandler);

    document.body.style.cursor = this.axis === Axis.Y ? 'ns-resize' : 'ew-resize';
  }

  /**
   * Stop chat resize
   */
  stop (): void {
    if (!this.isResizing) {
      return;
    }

    this.prevClientValue = 0;
    this.isResizing = false;

    document.removeEventListener('mousemove', this.processHandler);
    document.removeEventListener('mouseup', this.stopHandler);

    document.body.style.cursor = '';

    if (typeof this.onStop === 'function') {
      this.onStop(this.value);
    }
  }

  /**
   * Process chat resize
   */
  process (event: MouseEvent): void {
    if (!this.isResizing) {
      return;
    }

    const clientValue = this.axis === Axis.Y ? event.clientY : event.clientX;
    const change = (this.prevClientValue - clientValue) * this.multiplier;
    const newWidth = this.value + change;

    if (newWidth > this.limit.max) {
      this.value = this.limit.max;

      return;
    }

    if (newWidth < this.limit.min) {
      this.value = this.limit.min;

      return;
    }

    this.value = newWidth;

    if (typeof this.onResize === 'function') {
      this.onResize(this.value);
    }

    this.prevClientValue = clientValue;
  }
}
