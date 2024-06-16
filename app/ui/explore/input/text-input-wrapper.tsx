import React from "react";
import { Textarea } from "@nextui-org/react";

export default function TextInputWrapper() {
  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-1 gap-4">
      <Textarea
        isInvalid={false}
        key="bordered"
        variant="bordered"
        label="Important Information"
        labelPlacement="inside"
        placeholder="Describe the occupations of your family members that you think is important to the design"
        errorMessage="The description should be at least 255 characters long."
        className="w-full"
      />

      <Textarea
        isInvalid={false}
        key="bordered"
        variant="bordered"
        label="Social Relationships"
        labelPlacement="inside"
        placeholder="Describe some social relationships that would matter in the design"
        errorMessage="The description should be at least 255 characters long."
        className="w-full"
      />
    </div>
  );
}
