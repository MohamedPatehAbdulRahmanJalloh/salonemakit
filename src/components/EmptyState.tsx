import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

const EmptyState = ({ icon: Icon, emoji, title, description, actionLabel, actionLink }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center">
    <div className="relative mb-5">
      <div className="h-24 w-24 rounded-full bg-secondary/80 flex items-center justify-center">
        <Icon className="h-10 w-10 text-muted-foreground/30" />
      </div>
      <span className="absolute -top-1 -right-1 text-3xl">{emoji}</span>
    </div>
    <h2 className="text-base font-bold text-foreground">{title}</h2>
    <p className="text-xs text-muted-foreground mt-1.5 max-w-[240px]">{description}</p>
    {actionLabel && actionLink && (
      <Link to={actionLink}>
        <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-8 h-10 text-xs font-bold">
          {actionLabel}
        </Button>
      </Link>
    )}
  </div>
);

export default EmptyState;
