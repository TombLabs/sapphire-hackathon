import GalleryPastGenerations from "../gallery-past-generations";
import { LayoutMain } from "./layout-main";

export const LayoutGenerate = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutMain>
      <div>
        {children}
        <div className="p-6 flex flex-col gap-6">
          <h3>My Generations</h3>
          <GalleryPastGenerations />
        </div>
      </div>
    </LayoutMain>
  );
};
