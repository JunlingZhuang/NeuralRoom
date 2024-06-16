import ThreeCanvas from "@/app/ui/explore/obj-canvas";
import InputPanel from "@/app/ui/explore/input-panel";
import { GenerationProvider } from "@/app/lib/context/generationContext";

export default async function Page() {
  return (
    <GenerationProvider>
      <div className="h-full relative">
        <ThreeCanvas />
        <InputPanel />
      </div>
    </GenerationProvider>
  );
}
