import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Category" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/orders", icon: ClipboardList, label: "Orders" },
  { to: "/admin", icon: User, label: "Admin" },
];

const BottomNav = () => {
  const location = useLocation();
  const { totalItems, justAdded } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          const isCart = label === "Cart";
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 transition-all relative",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                {active && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-accent" />
                )}
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {isCart && totalItems > 0 && (
                  <span
                    className={cn(
                      "absolute -top-2 -right-2.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center",
                      justAdded && "cart-bounce"
                    )}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-semibold", active && "text-accent")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
