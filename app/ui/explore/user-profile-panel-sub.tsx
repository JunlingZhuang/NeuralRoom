import React, { useState, useEffect } from "react";
import SelectInputWrapper from "@/app/ui/explore/input/select-input-wrapper";
import TextInputWrapper from "@/app/ui/explore/input/text-input-wrapper";
import UserProfileButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { IoSaveOutline } from "react-icons/io5";
import { RiRestartLine } from "react-icons/ri";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
// import { gen, useGenerationManager } from "@/app/lib/manager/";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Graph } from "@/app/lib/manager/graphManager";
import { generateProfileGraph_Backend } from "@/app/lib/data";

interface UserProfileSubPanelProps {
  ifUserProfileFinishedLoading: boolean;
  setIfUserProfileFinishedLoading: (
    ifUserProfileFinishedLoading: boolean
  ) => void;
}

export default function UserProfileSubPanel({
  ifUserProfileFinishedLoading,
  setIfUserProfileFinishedLoading,
}: UserProfileSubPanelProps) {
  const { userProfileManager, graphManager } = useGenerationManager();
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userProfileManager.currentProfile) {
      userProfileManager.createDefaultProfile();
    }
  }, [userProfileManager]);

  const handleProfileChange = (
    field: keyof UserProfile,
    value: string | number
  ) => {
    userProfileManager.updateCurrentUserProfileField(field, value);
  };

  const handleSaveAndGenerateGraph = async () => {
    const isProfileUnchanged =
      JSON.stringify(userProfileManager.defaultProfile) ===
      JSON.stringify(userProfileManager.currentProfile);
    if (isProfileUnchanged) {
      setErrorMessage("User does not input anything in the profile");
      setIsInvalid(true);
      return;
    }
    setIfUserProfileFinishedLoading(false);
    setIsLoading(true);
    console.log("current profile", userProfileManager.currentProfile);
    try {
      const rawGraphData = await generateProfileGraph_Backend(
        userProfileManager.currentProfile
      );
      console.log("catched graph from backend", rawGraphData);
      const newGraph: Graph = await graphManager.handleGeneratedGraphData(
        rawGraphData
      );

      if (newGraph.Nodes.length !== 0 && newGraph.Edges.length !== 0) {
        graphManager.updateGraph(newGraph);
      } else {
        setIsInvalid(true);
        setErrorMessage("Please input a valid prompt.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIfUserProfileFinishedLoading(true);
    }
  };
  const handleRestart = () => {
    userProfileManager.createDefaultProfile();
    console.log("Click On Restart");
  };

  const handleRandomBtnClick = () => {
    console.log("Click on Random");
  };

  return (
    <div className="flex flex-col h-full space-y-5 w-full max-w-full justify-between">
      <div className="UserProfileContaniner flex-col space-y-5">
        <div className="flex justify-center text-lg">User Profile</div>
        <SelectInputWrapper
          userProfile={userProfileManager.currentProfile}
          onProfileChange={handleProfileChange}
        />
        <TextInputWrapper
          userProfile={userProfileManager.currentProfile}
          onProfileChange={handleProfileChange}
        />
      </div>
      <UserProfileButtonGroup //userprofile
        isLoading={isLoading}
        isRandomButtonVisible={false}
        randomButtonOnClick={handleRandomBtnClick}
        LeftContentButtonLabel="Restart"
        LeftContentButtonOnClick={handleRestart}
        LeftContentButtonIcon={<RiRestartLine />}
        RightContentButtonLabel="Save"
        RightContentButtonOnClick={handleSaveAndGenerateGraph}
        RightContentButtonIcon={<IoSaveOutline />}
      />
    </div>
  );
}
