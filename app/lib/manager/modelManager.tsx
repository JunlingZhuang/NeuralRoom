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
  model: string | null;
  boundingBoxSize: BoundingBoxSize;
  floorNum: number;
  bottomCenterPoint: BottomCenterPoint;
  updateModel: (model: string | null) => void;  
  updateBoundingBoxSize: (boundingBoxSize: BoundingBoxSize) => void;
  updateFloorNum: (floorNum: number) => void;
  updateBottomCenterPoint: (bottomCenterPoint: BottomCenterPoint) => void;
};

export const createModelManager = (
  initialModel: string | null,
  initialBoundingBoxSize: BoundingBoxSize,
  initialFloorNum: number,
  initialBottomCenterPoint: BottomCenterPoint
): ModelManager => {
  const [boundingBoxSize, setBoundingBoxSize] = useState<BoundingBoxSize>(
    initialBoundingBoxSize
  );

  const [model, setModel] = useState<string | null>(initialModel);
  const [floorNum, setFloorNum] = useState<number>(initialFloorNum);
  const [bottomCenterPoint, setBottomCenterPoint] = useState<BottomCenterPoint>(
    initialBottomCenterPoint
  );

  const updateModel = (model: string | null) => {
    setModel(model);
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

  return {
    model,
    boundingBoxSize,
    floorNum,
    bottomCenterPoint,
    updateModel,
    updateBoundingBoxSize,
    updateFloorNum,
    updateBottomCenterPoint,
  };
};
