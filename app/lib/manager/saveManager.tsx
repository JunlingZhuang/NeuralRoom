import { Graph } from "@/app/lib/manager/graphManager";
import {
  BoundingBoxSize,
  BottomCenterPoint,
} from "@/app/lib/manager/modelManager";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
import { v4 as uuidv4 } from "uuid"; // 需要安装 uuid 包

export type SavedState = {
  id: string;
  currentImage: string | null;
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
  deleteState: (id: string) => Promise<void>;
};

const MAX_SAVED_STATES = 10;
const SAVED_STATES_KEY = "savedStates";

export const createSaveManager = (): SaveManager => {

  const saveState = async (state: Omit<SavedState, "id" | "timestamp">) => {
    try {
      const savedStates = await getAllStates();
      const newState: SavedState = {
        ...state,
        id: uuidv4(), // 生成唯一 id
        timestamp: Date.now(),
      };
      savedStates.unshift(newState);

      if (savedStates.length > MAX_SAVED_STATES) {
        savedStates.pop();
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
      console.log("Get all states:", serializedStates);
      return serializedStates ? JSON.parse(serializedStates) : [];
    } catch (error) {
      console.error("Error getting all states:", error);
      return [];
    }
  };

  const deleteState = async (id: string): Promise<void> => {
    try {
      const savedStates = await getAllStates();
      const updatedStates = savedStates.filter(state => state.id !== id);
      localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(updatedStates));
    } catch (error) {
      console.error("Error deleting state:", error);
    }
  };

  return {
    saveState,
    loadState,
    getAllStates,
    deleteState, // 添加 deleteState 到返回对象中
  };
};
