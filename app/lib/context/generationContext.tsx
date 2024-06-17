"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { ModelManager, createModelManager } from "@/app/lib/class/modelManager";
import { GraphManager, createGraphManager } from "@/app/lib/class/graphManager";

type GenerationManager = {
  modelManager: ModelManager;
  graphManager: GraphManager;
};

const GenerationManagerContext = createContext<GenerationManager | undefined>(
  undefined
);

export const GenerationManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const initialBoundingBoxSize = { length: 10, width: 5, height: 3 };
  const initialFloorNum = 1;
  const initialBottomCenterPoint = { x: 0, y: 0, z: 0 };
  const initialModel = null;

  const modelManager = createModelManager(
    initialModel,
    initialBoundingBoxSize,
    initialFloorNum,
    initialBottomCenterPoint
  );

  const initialGraph = {
    Nodes: [{ id: "node1" }],
    Edges: [],
  };

  const graphManager = createGraphManager(initialGraph);

  const generationManager = { modelManager, graphManager };

  return (
    <GenerationManagerContext.Provider value={generationManager}>
      {children}
    </GenerationManagerContext.Provider>
  );
};

export const useGenerationManager = (): GenerationManager => {
  const context = useContext(GenerationManagerContext);
  if (context === undefined) {
    throw new Error(
      "useGenerationManager must be used within a GenerationManagerProvider"
    );
  }
  return context;
};
