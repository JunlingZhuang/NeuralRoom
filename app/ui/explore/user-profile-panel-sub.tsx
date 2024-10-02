import React, { useState } from "react";
import SelectInputWrapper from "@/app/ui/explore/input/select-input-wrapper";
import TextInputWrapper from "@/app/ui/explore/input/text-input-wrapper";
import UserProfileButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { IoSaveOutline } from "react-icons/io5";
import { RiRestartLine } from "react-icons/ri";

export default function UserProfileSubPanel() {
  const [userProfile, setUserProfile] = useState({
    persona: "",
    bedroomNumber: "",  
    bathroomNumber: "",
    livingRoomNumber: "",
    familyOccupations: "",
    socialRelationships: "",
  });

  const handleProfileChange = (field: string, value: string | number) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
    console.log(`Selected ${field}:`, value); // For debugging
  };

  const handleSaveAndGenerateGraph = () => {
    console.log("Click on Save");
  };
  const handleRestart = () => {
    setUserProfile({
      persona: "",
      bedroomNumber: "",
      bathroomNumber: "",
      livingRoomNumber: "",
      familyOccupations: "",
      socialRelationships: "",
    });
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
          userProfile={userProfile}
          onProfileChange={handleProfileChange}
        />
        <TextInputWrapper
          userProfile={userProfile}
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
