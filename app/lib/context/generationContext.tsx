"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import {
  ModelManager,
  createModelManager,
} from "@/app/lib/manager/modelManager";
import {
  GraphManager,
  createGraphManager,
} from "@/app/lib/manager/graphManager";
import { fetchSamplePrompts } from "@/app/lib/data";
import { SaveManager, createSaveManager, SavedState } from "@/app/lib/manager/saveManager";
import { UserProfileManager, createUserProfileManager } from "@/app/lib/manager/userProfileManager";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";

type GenerationManager = {
  modelManager: ModelManager;
  graphManager: GraphManager;
  userProfileManager: UserProfileManager; // 新增
  getSamplePrompts: () => Promise<string[]>;
  saveManager: SaveManager;
  saveCurrentState: () => Promise<void>;
  loadSavedState: (index?: number) => Promise<void>;
  getAllSavedStates: () => Promise<SavedState[]>;
};

const getSamplePrompts = async () => {
  try {
    const prompts = await fetchSamplePrompts();
    const promptList = prompts.map((prompt: { prompt: string }) => prompt.prompt);
    return promptList;
  } catch (error) {
    console.error("Error fetching sample prompts:", error);
    return [];
  }
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

  const graphManager = createGraphManager();

  const saveManager = createSaveManager();

  const userProfileManager = createUserProfileManager();

  const saveCurrentState = async () => {
    const currentState: SavedState = {
      graph: graphManager.graph,
      model: modelManager.model,
      boundingBoxSize: modelManager.boundingBoxSize,
      floorNum: modelManager.floorNum,
      bottomCenterPoint: modelManager.bottomCenterPoint,
      userProfile: userProfileManager.currentProfile,
      timestamp: Date.now(),
    };
    await saveManager.saveState(currentState);
  };

  const loadSavedState = async (index?: number) => {
    const savedState = await saveManager.loadState(index);
    if (savedState) {
      graphManager.updateGraph(savedState.graph);
      modelManager.updateModel(savedState.model);
      modelManager.updateBoundingBoxSize(savedState.boundingBoxSize);
      modelManager.updateFloorNum(savedState.floorNum);
      modelManager.updateBottomCenterPoint(savedState.bottomCenterPoint);
      if (savedState.userProfile) {
        userProfileManager.setCurrentProfile(savedState.userProfile);
      }
      setStateUpdated(true); // 通知状态已更新
    }
  };

  const getAllSavedStates = async () => {
    return await saveManager.getAllStates();
  };

  const [stateUpdated, setStateUpdated] = useState(false);

  const generationManager = {
    modelManager,
    graphManager,
    userProfileManager,
    getSamplePrompts,
    saveManager,
    saveCurrentState,
    loadSavedState,
    getAllSavedStates,
    stateUpdated,
    setStateUpdated,
  };

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
