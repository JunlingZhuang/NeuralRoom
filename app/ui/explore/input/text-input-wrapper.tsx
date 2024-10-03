import React from "react";
import { Textarea } from "@nextui-org/react";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
interface TextInputWrapperProps {
  userProfile: UserProfile;
  onProfileChange: (field: keyof UserProfile, value: string) => void;
}

export default function TextInputWrapper({
  userProfile,
  onProfileChange,
}: TextInputWrapperProps) {
  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-1 gap-4">
      <Textarea
        isInvalid={false}
        key="important-info"
        variant="bordered"
        label="Important Information"
        labelPlacement="inside"
        placeholder="Describe the occupations of your family members that you think is important to the design"
        errorMessage="The description should be at least 255 characters long."
        classNames={{
          base: "w-full",
          input: "resize-y min-h-[100px]",
        }}
        value={userProfile.famliyInfoPrompt ?? ""}
        onChange={(e) => onProfileChange("famliyInfoPrompt", e.target.value)}
      />

      <Textarea
        isInvalid={false}
        key="social-relationships"
        variant="bordered"
        label="Social Relationships"
        labelPlacement="inside"
        placeholder="Describe some social relationships that would matter in the design"
        errorMessage="The description should be at least 255 characters long."
        classNames={{
          base: "w-full",
          input: "resize-y min-h-[100px]",
        }}
        value={userProfile.socialInfoPrompt ?? ""}
        onChange={(e) => onProfileChange("socialInfoPrompt", e.target.value)}
      />
    </div>
  );
}
