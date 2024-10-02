import { Graph } from "@/app/lib/manager/graphManager";
import {
  BoundingBoxSize,
  BottomCenterPoint,
} from "@/app/lib/manager/modelManager";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
export type SavedState = {
  graph: Graph;
  model: Blob | null;
  boundingBoxSize: BoundingBoxSize;
  floorNum: number;
  bottomCenterPoint: BottomCenterPoint;
  userProfile: UserProfile | null;
  timestamp: number; 
};

export type SaveManager = {
  saveState: (state: SavedState) => Promise<void>;
  loadState: (index?: number) => Promise<SavedState | null>;
  getAllStates: () => Promise<SavedState[]>;
};

const MAX_SAVED_STATES = 10;
const SAVED_STATES_KEY = "savedStates";

export const createSaveManager = (): SaveManager => {
  const saveState = async (state: SavedState) => {
    try {
      const savedStates = await getAllStates();
      state.timestamp = Date.now(); // 添加时间戳
      savedStates.unshift(state); // 在数组开头添加新状态

      if (savedStates.length > MAX_SAVED_STATES) {
        savedStates.pop(); // 如果超过10个，删除最后一个（最旧的）
      }

      localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(savedStates));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  const loadState = async (index: number = 0): Promise<SavedState | null> => {
    try {
      const savedStates = await getAllStates();
      return savedStates[index] || null;
    } catch (error) {
      console.error("Error loading state:", error);
    }
    return null;
  };

  const getAllStates = async (): Promise<SavedState[]> => {
    try {
      const serializedStates = localStorage.getItem(SAVED_STATES_KEY);
      return serializedStates ? JSON.parse(serializedStates) : [];
    } catch (error) {
      console.error("Error getting all states:", error);
      return [];
    }
  };

  return {
    saveState,
    loadState,
    getAllStates,
  };
};
