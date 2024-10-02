import React from "react";
import { Textarea } from "@nextui-org/react";

interface TextInputWrapperProps {
  userProfile: {
    familyOccupations: string | null;
    socialRelationships: string | null;
  };
  onProfileChange: (field: string, value: string) => void;
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
        value={userProfile.familyOccupations ?? ""}
        onChange={(e) => onProfileChange("familyOccupations", e.target.value)}
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
        value={userProfile.socialRelationships ?? ""}
        onChange={(e) => onProfileChange("socialRelationships", e.target.value)}
      />
    </div>
  );
}
