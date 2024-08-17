import React, { useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { ProgramInfo } from "@/app/lib/manager/graphManager";

interface ProgramDropdownProps {
  programList: {
    [key: string]: ProgramInfo;
  };
  onProgramSelect: (program: ProgramInfo) => void; 
}

const Circle = ({ color }: { color: string }) => (
  <div
    style={{
      width: "16px",
      height: "16px",
      backgroundColor: color,
      borderRadius: "50%",
      display: "inline-block",
    }}
  />
);

export default function ProgramSelectionDropdown({
  programList,
  onProgramSelect,
}: ProgramDropdownProps) {
  const [selectedKey, setSelectedKey] = React.useState<string>("");

  useEffect(() => {
    const keys = Object.keys(programList);

    // set up default selected program
    if (keys.length > 1) {
      setSelectedKey(keys[1]); 
    } else if (keys.length > 0) {
      setSelectedKey(keys[0]); 
    }
  }, [programList]);

  useEffect(() => {
    if (selectedKey) {
      const selectedProgram = programList[selectedKey];
      onProgramSelect(selectedProgram);
      console.log("Current select program is", selectedProgram);
    }
  }, [selectedKey, programList, onProgramSelect]);

  const options = Object.entries(programList).map(([key, info]) => ({
    key: key as string,
    color: info.programColor,
  }));

  const selectedOption = options.find((option) => option.key === selectedKey);

  return (
    <div className="absolute top-0 right-0 m-4 p-2">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" className="normal-case flex items-center">
            {selectedOption && (
              <div className="flex items-center">
                <Circle color={selectedOption.color} />
                <span className="ml-2">
                  {programList[selectedOption.key]?.programName}
                </span>
              </div>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Single selection dropdown with circles"
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={new Set([selectedKey])}
          onSelectionChange={(key) => {
            const selected = Array.from(key).join("");
            setSelectedKey(selected);
          }}
        >
          {options.map((option) => (
            <DropdownItem
              className="text-white"
              key={option.key}
              startContent={<Circle color={option.color} />}
            >
              {programList[option.key]?.programName}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
