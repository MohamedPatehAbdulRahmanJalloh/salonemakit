import { useRegion, Region } from "@/context/RegionContext";
import { cn } from "@/lib/utils";

const RegionSelector = () => {
  const { region, setRegion, isRegionLocked } = useRegion();

  // If locked (UAE user), show a static badge instead of a toggle
  if (isRegionLocked) {
    return (
      <div className="flex items-center bg-secondary rounded-full px-2.5 py-1">
        <span className="text-[10px] font-bold text-foreground">🇦🇪 AED</span>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-secondary rounded-full p-0.5 gap-0">
      <button
        onClick={() => setRegion("sl")}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
          region === "sl"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇸🇱 SLL
      </button>
      <button
        onClick={() => setRegion("dubai")}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
          region === "dubai"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇦🇪 AED
      </button>
    </div>
  );
};

export default RegionSelector;
