"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { BoxSize, BoxSizeManager } from "@/app/lib/definition/box-definition";

type BoxSizeContextProps = {
  boxSizeManager: BoxSizeManager;
  model: string | null;
  setModel: (model: string | null) => void;
};

const BoxSizeContext = createContext<BoxSizeContextProps | undefined>(
  undefined
);

export const useBoxSize = () => {
  const context = useContext(BoxSizeContext);
  if (!context) {
    throw new Error("useBoxSize must be used within a BoxSizeProvider");
  }
  return context;
};

type BoxSizeProviderProps = {
  children: ReactNode;
};

export const BoxSizeProvider: React.FC<BoxSizeProviderProps> = ({
  children,
}) => {
  const [boxSize, setBoxSize] = useState<BoxSize>({
    length: 20,
    width: 20,
    height: 1,
  });
  const [model, setModel] = useState<string | null>(null);
  const boxSizeManager = new BoxSizeManager(boxSize, setBoxSize);

  return (
    <BoxSizeContext.Provider value={{ boxSizeManager, model, setModel }}>
      {children}
    </BoxSizeContext.Provider>
  );
};
