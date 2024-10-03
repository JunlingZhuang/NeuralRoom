import React, { useState, useEffect } from "react";
import { Select, SelectItem, Input } from "@nextui-org/react";
import { fetchUserProfilePersonaOptions } from "@/app/lib/data";
import { UserProfilePersonaOptionProps } from "@/app/lib/definition/user_profile_definition";
import { UserProfile } from "@/app/lib/definition/user_profile_definition";
interface SelectInputWrapperProps {
  userProfile: UserProfile;
  onProfileChange: (field: keyof UserProfile, value: string | number) => void;
}

export default function SelectInputWrapper({
  userProfile,
  onProfileChange,
}: SelectInputWrapperProps) {
  const [userPersonaOptions, setUserPersonaOptions] = useState<
    UserProfilePersonaOptionProps[]
  >([]);

  useEffect(() => {
    const loadUserPersonaOptions = async () => {
      try {
        const data = await fetchUserProfilePersonaOptions();
        setUserPersonaOptions(data);
      } catch (error) {
        console.error("Failed to fetch user types:", error);
      }
    };

    loadUserPersonaOptions();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
        <div>
          <Select
            isRequired
            label="User Persona"
            placeholder="Choose user persona"
            className="w-full"
            classNames={{
              trigger: [
                "bg-inputBackGround/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "dark:hover:bg-inputBackGround/70",
                "dark:group-data-[focus=true]:bg-inputBackGround/80",
                "shadow-2xl",
                "cursor-pointer",
              ],

              innerWrapper: ["dark:bg-transparent"],
            }}
            selectedKeys={[userProfile.userPersona]}
            onChange={(e) => onProfileChange("userPersona", e.target.value)}
          >
            {userPersonaOptions.map((userPersonaOption) => (
              <SelectItem className="text-white" key={userPersonaOption.key}>
                {userPersonaOption.label}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="BedroomNumberInput">
          <Input
            type="number"
            label="Bedroom"
            placeholder="0"
            labelPlacement="inside"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">Count</span>
              </div>
            }
            classNames={{
              inputWrapper: [
                "shadow-2xl",
                "bg-inputBackGround",
                "dark:bg-inputBackGround/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "dark:hover:bg-inputBackGround/70",
                "dark:group-data-[focus=true]:bg-inputBackGround/80",
                "!cursor-text",
              ],
            }}
            value={userProfile.bedroomNum?.toString() ?? ''}
            onChange={(e) =>
              onProfileChange("bedroomNum", parseInt(e.target.value, 10))
            }
          />
        </div>
        <div className="BathroomNumberInput">
          <Input
            type="number"
            label="Bathroom"
            // color="primary"
            placeholder="0"
            labelPlacement="inside"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">Count</span>
              </div>
            }
            classNames={{
              inputWrapper: [
                "shadow-2xl",
                "bg-inputBackGround",
                "dark:bg-inputBackGround/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "dark:hover:bg-inputBackGround/70",
                "dark:group-data-[focus=true]:bg-inputBackGround/80",
                "!cursor-text",
              ],
            }}
            value={userProfile.bathroomNum?.toString() ?? ''}
            onChange={(e) =>
              onProfileChange("bathroomNum", parseInt(e.target.value, 10))
            }
          />
        </div>
        <div className="LivingRoomNumberInput">
          <Input
            type="number"
            label="Living Room"
            placeholder="0"
            labelPlacement="inside"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">Count</span>
              </div>
            }
            classNames={{
              inputWrapper: [
                "shadow-2xl",
                "bg-inputBackGround",
                "dark:bg-inputBackGround/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "dark:hover:bg-inputBackGround/70",
                "dark:group-data-[focus=true]:bg-inputBackGround/80",
                "!cursor-text",
              ],
            }}
            value={userProfile.livingRoomNum?.toString() ?? ''}
            onChange={(e) =>
              onProfileChange("livingRoomNum", parseInt(e.target.value, 10))
            }
          />
        </div>
      </div>
    </div>
  );
}
