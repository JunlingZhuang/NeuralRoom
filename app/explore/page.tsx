import ThreeCanvas from "@/app/ui/explore/obj-canvas";
import InputPanel from "@/app/ui/explore/input-panel";
import { GenerationManagerProvider } from "@/app/lib/context/generationContext";

export default async function Page() {
  return (
    <GenerationManagerProvider>
      <div className="h-full relative">
        <ThreeCanvas />
        <InputPanel />
      </div>
    </GenerationManagerProvider>
  );
}
