import React, { useState, useEffect } from "react";
import SelectInputWrapper from "@/app/ui/explore/input/select-input-wrapper";
import TextInputWrapper from "@/app/ui/explore/input/text-input-wrapper";
import UserProfileButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { IoSaveOutline } from "react-icons/io5";
import { RiRestartLine } from "react-icons/ri";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
// import { gen, useGenerationManager } from "@/app/lib/manager/";
import { useGenerationManager } from "@/app/lib/context/generationContext";


export default function UserProfileSubPanel() {
  const { userProfileManager } = useGenerationManager();

  useEffect(() => {
    if (!userProfileManager.currentProfile) {
      userProfileManager.createDefaultProfile();
    }
  }, [userProfileManager]);

  const handleProfileChange = (field: keyof UserProfile, value: string | number) => {
    userProfileManager.updateCurrentUserProfileField(field, value);
  };

  const handleSaveAndGenerateGraph = () => {
    console.log("Click on Save");
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
        isLoading={false}
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
