import { Shield, Truck, RotateCcw, BadgeCheck } from "lucide-react";

const badges = [
  { icon: Truck, label: "Free Delivery", sub: "Orders over NLe 200,000" },
  { icon: Shield, label: "Secure Payment", sub: "COD & Orange Money" },
  { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
  { icon: BadgeCheck, label: "100% Authentic", sub: "Verified products" },
];

interface TrustBadgesProps {
  variant?: "horizontal" | "grid";
}

const TrustBadges = ({ variant = "horizontal" }: TrustBadgesProps) => {
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 lg:px-0">
        {badges.map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3 border border-border"
          >
            <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <b.icon className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">{b.label}</p>
              <p className="text-[9px] text-muted-foreground">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 lg:px-8 py-3">
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2.5 border border-border shrink-0"
        >
          <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <b.icon className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground whitespace-nowrap">{b.label}</p>
            <p className="text-[8px] text-muted-foreground whitespace-nowrap">{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
