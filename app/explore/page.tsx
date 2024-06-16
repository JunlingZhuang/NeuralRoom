import ThreeCanvas from "@/app/ui/explore/obj-canvas";
import InputPanel from "@/app/ui/explore/input-panel";
import { BoxSizeProvider } from "@/app/lib/context/BoxSizeContext";

export default async function Page() {
  return (
    <BoxSizeProvider>
      <div className="h-full relative">
        <ThreeCanvas />
        <InputPanel />
      </div>
    </BoxSizeProvider>
  );
}
