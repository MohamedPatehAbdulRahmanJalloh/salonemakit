import { CATEGORIES } from "@/data/products";
import { Link } from "react-router-dom";
import { icons } from "lucide-react";

const CategoryBar = () => {
  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const IconComponent = icons[cat.icon as keyof typeof icons];
        return (
          <Link
            key={cat.id}
            to={`/search?category=${cat.id}`}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground">
              {IconComponent && <IconComponent size={24} className="text-primary" />}
            </div>
            <span className="text-xs font-medium">{cat.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryBar;
