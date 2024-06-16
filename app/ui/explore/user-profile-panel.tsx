import React, { useState } from "react";
import SelectInputWrapper from "@/app/ui/explore/input/select-input-wrapper";
import TextInputWrapper from "@/app/ui/explore/input/text-input-wrapper";

export default function UserProfilePanel() {
  const [currentUserProfile, setCurrentUserProfile] = useState();

  return (
    <div className="flex flex-col space-y-5 w-full max-w-full overflow-auto">
      <div className="flex justify-center text-lg">User Profile</div>
      <SelectInputWrapper />
      <TextInputWrapper />
    </div>
  );
}
