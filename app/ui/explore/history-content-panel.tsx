"use client";

import React, { useState, useEffect } from "react";
import HistoryGenerationCard from "./card/historyGenerationCard";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { SavedState } from "@/app/lib/manager/saveManager";

export default function HistoryContentPanel() {
  const { getAllSavedStates, saveManager, stateUpdated, setStateUpdated } = useGenerationManager();
  const [allSavedStates, setAllSavedStates] = useState<SavedState[]>([]);

  const fetchSavedStates = async () => {
    const states = await getAllSavedStates();
    setAllSavedStates(states);
  };

  useEffect(() => {
    fetchSavedStates();
  }, [getAllSavedStates]);

  useEffect(() => {
    if (stateUpdated) {
      fetchSavedStates();
      setStateUpdated(false);
    }
  }, [stateUpdated, setStateUpdated]);

  const handleDelete = async (stateId: string) => {
    await saveManager.deleteState(stateId);
    fetchSavedStates(); // Refresh the list after deletion
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-webkit p-6 ">
      <div className="flex flex-col h-full space-y-5 w-full max-w-full justify-between">
        <div className="HistoryGenerationContainer flex-col space-y-5 pb-6">
          <div className="flex justify-center text-lg font-normal">
            History Generation
          </div>
          {allSavedStates.map((savedState) => (
            <HistoryGenerationCard 
              key={savedState.id} 
              savedState={savedState} 
              onDelete={() => handleDelete(savedState.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
