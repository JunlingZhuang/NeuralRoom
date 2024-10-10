"use client";
import { useState } from "react";

export type BoundingBoxSize = {
  length: number;
  width: number;
  height: number;
};

export type BottomCenterPoint = {
  x: number;
  y: number;
  z: number;
};

export type ModelManager = {
  currentImage: string | null;
  updateCurrentImage: (image: string | null) => void;
  model: Blob | null;
  boundingBoxSize: BoundingBoxSize;
  floorNum: number;
  bottomCenterPoint: BottomCenterPoint;
  updateModel: (model: Blob | null) => void;
  updateBoundingBoxSize: (boundingBoxSize: BoundingBoxSize) => void;
  updateFloorNum: (floorNum: number) => void;
  updateBottomCenterPoint: (bottomCenterPoint: BottomCenterPoint) => void;
};

export const createModelManager = (
  initialModel: Blob | null,
  initialBoundingBoxSize: BoundingBoxSize,
  initialFloorNum: number,
  initialBottomCenterPoint: BottomCenterPoint,
  initialCurrentImage: string | null = null
): ModelManager => {
  const [model, setModel] = useState<Blob | null>(initialModel);
  const [boundingBoxSize, setBoundingBoxSize] = useState<BoundingBoxSize>(
    initialBoundingBoxSize
  );
  const [floorNum, setFloorNum] = useState<number>(initialFloorNum);
  const [bottomCenterPoint, setBottomCenterPoint] = useState<BottomCenterPoint>(
    initialBottomCenterPoint
  );
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const updateModel = (newModel: Blob | null) => {
    setModel(newModel);
  };

  const updateBoundingBoxSize = (
    partialBoundingBoxSize: Partial<BoundingBoxSize>
  ) => {
    setBoundingBoxSize((prevBoundingBoxSize) => ({
      ...prevBoundingBoxSize,
      ...partialBoundingBoxSize,
    }));
  };

  const updateFloorNum = (newFloorNum: number) => {
    setFloorNum(newFloorNum);
  };

  const updateBottomCenterPoint = (newBottomCenterPoint: BottomCenterPoint) => {
    setBottomCenterPoint(newBottomCenterPoint);
  };

  const updateCurrentImage = (image: string | null) => {
    setCurrentImage(image);
  };

  return {
    model,
    boundingBoxSize,
    floorNum,
    bottomCenterPoint,
    currentImage,
    updateModel,
    updateBoundingBoxSize,
    updateFloorNum,
    updateBottomCenterPoint,
    updateCurrentImage,
  };
};
