import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";

const options = [
  { key: "livingroom", color: "#94CDE9" },
  { key: "kitchen", color: "#978BA0" },
  { key: "bed", color: "#fed9ed" },
];

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

export default function ProgramSelectionDropdown() {
  const [selectedKey, setSelectedKey] = React.useState("livingroom");

  const selectedOption = options.find((option) => option.key === selectedKey);

  return (
    <div className="absolute top-0 right-0 m-4 p-2">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" className="normal-case flex items-center">
            {selectedOption && (
              <div className="flex items-center">
                <Circle color={selectedOption.color} />
                <span className="ml-2">{selectedOption.key}</span>
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
              key={option.key}
              startContent={<Circle color={option.color} />}
            >
              {option.key}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
