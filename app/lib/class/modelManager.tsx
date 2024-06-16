
"use client";

import { BoundingBoxSize } from "@/app/lib/definition/general-definition";

export class ModelManager {
  private boundingboxSize: BoundingBoxSize;
  private updateCallback: (boundingboxSize: BoundingBoxSize) => void;

  constructor(
    initialSize: BoundingBoxSize,
    updateCallback: (boxSize: BoundingBoxSize) => void
  ) {
    this.boundingboxSize = initialSize;
    this.updateCallback = updateCallback;
  }

  updateSize(newPartialBoundingBoxSize: Partial<BoundingBoxSize>) {
    this.boundingboxSize = {
      ...this.boundingboxSize,
      ...newPartialBoundingBoxSize,
    };
    this.updateCallback(this.boundingboxSize);
  }

  getSize() {
    return this.boundingboxSize;
  }
}
