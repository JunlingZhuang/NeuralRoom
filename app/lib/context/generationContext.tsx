"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { ModelManager } from "@/app/lib/class/modelManager";
import { BoundingBoxSize } from "@/app/lib/definition/general-definition";

type GenerationContextProps = {
  modelManager: ModelManager;
  model: string | null;
  setModel: (model: string | null) => void;
};

const GenerationContext = createContext<GenerationContextProps | undefined>(
  undefined
);

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error("useBoxSize must be used within a GenerationProvider");
  }
  return context;
};

type GenerationProviderProps = {
  children: ReactNode;
};

export const GenerationProvider: React.FC<GenerationProviderProps> = ({
  children,
}) => {
  const [boxSize, setBoxSize] = useState<BoundingBoxSize>({
    length: 20,
    width: 20,
    height: 1,
  });
  const [model, setModel] = useState<string | null>(null);
  const modelManager = new ModelManager(boxSize, setBoxSize);

  return (
    <GenerationContext.Provider
      value={{ modelManager: modelManager, model, setModel }}
    >
      {children}
    </GenerationContext.Provider>
  );
};
