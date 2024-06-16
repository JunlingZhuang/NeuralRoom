// BoxSize.ts
export type BoxSize = {
  length: number;
  width: number;
  height: number;
};

export class BoxSizeManager {
  private boxSize: BoxSize;
  private updateCallback: (boxSize: BoxSize) => void;

  constructor(
    initialSize: BoxSize,
    updateCallback: (boxSize: BoxSize) => void
  ) {
    this.boxSize = initialSize;
    this.updateCallback = updateCallback;
  }

  updateSize(newSize: Partial<BoxSize>) {
    this.boxSize = { ...this.boxSize, ...newSize };
    this.updateCallback(this.boxSize);
  }

  getSize() {
    return this.boxSize;
  }
}
