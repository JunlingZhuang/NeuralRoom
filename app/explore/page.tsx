import ThreeCanvas from "@/app/ui/explore/obj-canvas";
import InputPanel from "@/app/ui/explore/input-panel";
export default async function Page() {
  return (
    <div className="h-full relative">
      <ThreeCanvas />
      <InputPanel />
    </div>
  );
}
