import React, { useState } from "react";
import SelectInputWrapper from "@/app/ui/explore/input/select-input-wrapper";
import TextInputWrapper from "@/app/ui/explore/input/text-input-wrapper";
import UserProfileButtonGroup from "@/app/ui/explore/buttonGroup/input-panel-button-group";
import { IoSaveOutline } from "react-icons/io5";
import { RiRestartLine } from "react-icons/ri";
export default function UserProfileSubPanel() {
  const [currentUserProfile, setCurrentUserProfile] = useState();
  const handleSave = () => {
    console.log("Click on Save");
  };
  const handleRestart = () => {
    console.log("Click On Restart");
  };
  return (
    <div className="flex flex-col h-full space-y-5 w-full max-w-full justify-between">
      <div className="UserProfileContaniner flex-col space-y-5">
        <div className="flex justify-center text-lg">User Profile</div>
        <SelectInputWrapper />
        <TextInputWrapper />
      </div>
      <UserProfileButtonGroup
        isRandomButtonVisible={false}
        LeftContentButtonLabel="Restart"
        LeftContentButtonOnClick={handleRestart}
        LeftContentButtonIcon={<RiRestartLine />}
        RightContentButtonLabel="Save"
        RightContentButtonOnClick={handleSave}
        RightContentButtonIcon={<IoSaveOutline />}
      />
    </div>
  );
}
