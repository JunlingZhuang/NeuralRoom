import React, { useMemo } from "react";
import Image from "next/image";
import { SavedState } from "@/app/lib/manager/saveManager";
import { Node } from "@/app/lib/manager/graphManager";
import HistoryGenerationCardButtonGroup from "@/app/ui/explore/buttonGroup/history-generation-card-button-group.";

export default function HistoryGenerationCard({
  savedState,
  onDelete,
}: {
  savedState: SavedState;
  onDelete: () => void;
}) {
  const programCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    savedState.graph.Nodes.forEach((node) => {
      counts[node.programName] = (counts[node.programName] || 0) + 1;
    });
    return counts;
  }, [savedState.graph.Nodes]);

  return (
    <div className="w-full h-48 p-4 shadow-2xl rounded-[16px] backdrop-blur-xl bg-panel-bg bg-opacity-60 justify-center transition-all ease-in-out duration-500 hover:h-[40vh] hover:min-h-[12rem] group hover:scale-[1.03] hover:overflow-hidden">
      <div className="w-full h-full flex flex-col gap-3 transition-all duration-500 ease-in-out">
        <div className="flex flex-row gap-3 flex-grow">
          <div className="w-1/3 h-full relative rounded-lg overflow-hidden transition-all duration-500 ease-in-out group-hover:h-auto group-hover:min-h-[10rem]">
            <Image
              src={savedState.currentImage ?? "/images/graphSampleImage.png"}
              alt="Graph Sample"
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500 ease-in-out group-hover:object-contain group-hover:object-top"
            />
          </div>
          <div className="w-2/3 h-full flex flex-row gap-4">
            <div className="w-2/5 h-full overflow-hidden">
              <div className="text-white font-normal text-xs mb-1">
                Information
              </div>
              <div className="flex flex-col text-xs text-gray-300 gap-1 font-light max-h-[calc(100%-1.5rem)] overflow-y-auto scrollbar-hide transition-all duration-500 ease-in-out">
                {Object.entries(programCounts).map(([programName, count], index) => (
                  <div
                    key={index}
                    className="transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                  >
                    {`${programName}Num: ${count}`}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-3/5 h-full overflow-hidden">
              <div className="text-white font-normal text-xs mb-1">
                User Profile
              </div>
              <div className="flex flex-col justify-between h-full text-xs text-gray-300 gap-1 font-light max-h-[calc(100%-1.5rem)] overflow-y-auto scrollbar-hide transition-all duration-500 ease-in-out">
                <div className="topWrapper ">
                  <div className=" flex flex-wrap">
                    <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`Personal: ${savedState.userProfile?.userPersona}`}</div>
                    <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`BathroomNum: ${savedState.userProfile?.bathroomNum}`}</div>
                    <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`BedroomNum: ${savedState.userProfile?.bedroomNum}`}</div>
                    <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`Lifestyle: ${savedState.userProfile?.livingRoomNum}`}</div>
                  </div>

                  <div className="userProfile flex flex-col flex-grow overflow-hidden">
                    <div className="break-words leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                      Social Info: {savedState.userProfile?.socialInfoPrompt}
                    </div>
                    <div className="break-words leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                      User Description:
                      {savedState.userProfile?.famliyInfoPrompt}
                    </div>
                  </div>
                </div>
                <div className="h-0 flex-row justify-end hidden xl:flex group-hover:h-auto group-hover:mt-auto transition-all delay-200 duration-500 ease-in-out overflow-hidden">
                  <HistoryGenerationCardButtonGroup 
                    stateId={savedState.id} 
                    onDelete={onDelete}
                    
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
