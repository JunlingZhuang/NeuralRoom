import React from "react";
import Image from "next/image";
import { SavedState } from "@/app/lib/manager/saveManager";
import { Node } from "@/app/lib/manager/graphManager";

export default function HistoryGenerationCard({
  savedState,
}: {
  savedState: SavedState;
}) {
  return (
    <div className="w-full h-48 p-4 shadow-2xl rounded-[16px] backdrop-blur-xl bg-panel-bg bg-opacity-60 justify-center transition-all ease-in-out duration-500 hover:h-[40vh] hover:min-h-[12rem] group hover:scale-[1.03] hover:overflow-hidden">
      <div className="w-full h-full flex flex-row gap-3 transition-all duration-500 ease-in-out">
        <div className="w-1/3 h-full relative rounded-lg overflow-hidden transition-all duration-500 ease-in-out group-hover:h-auto group-hover:min-h-[10rem]">
          <Image
            src="/images/graphSampleImage.png"
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
              {savedState.graph.Nodes.map((node: Node, index) => (
                <div
                  key={index}
                  className="transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                >
                  {`${node.programName}Num: ${
                    savedState.graph.Nodes.filter(
                      (n) => n.programName === node.programName
                    ).length
                  }`}
                </div>
              ))}
            </div>
          </div>
          <div className="w-3/5 h-full overflow-hidden">
            <div className="text-white font-normal text-xs mb-1">
              User Profile
            </div>
            <div className="flex flex-col text-xs text-gray-300 gap-1 font-light max-h-[calc(100%-1.5rem)] overflow-y-auto scrollbar-hide transition-all duration-500 ease-in-out">
              <div className="flex flex-wrap">
                <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`Personal: ${savedState.userProfile?.userPersona}`}</div>
                <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`BathroomNum: ${savedState.userProfile?.bathroomNum}`}</div>
                <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`BedroomNum: ${savedState.userProfile?.bedroomNum}`}</div>
                <div className="w-full xl:w-1/2 mb-1 transition-opacity duration-500 ease-in-out group-hover:opacity-100">{`Lifestyle: ${savedState.userProfile?.livingRoomNum}`}</div>
              </div>
              <div className="flex flex-col userDescription">
                <div className="break-words leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                  Social Info: {savedState.userProfile?.socialInfoPrompt}
                </div>
                <div className="break-words leading-relaxed line-clamp-2 group-hover:line-clamp-none">
                  User Description: {savedState.userProfile?.famliyInfoPrompt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
