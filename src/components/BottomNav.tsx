import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Shop" },
  { to: "/cart", icon: ShoppingBag, label: "Cart" },
  { to: "/orders", icon: ClipboardList, label: "Orders" },
  { to: "/profile", icon: User, label: "Me" },
];

const BottomNav = () => {
  const location = useLocation();
  const { totalItems, justAdded } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border lg:hidden" aria-label="Main navigation" role="navigation">
      <div className="flex items-stretch justify-around safe-area-bottom">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          const isCart = label === "Cart";
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-4 transition-colors min-w-[56px]",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.5px]")} />
                {isCart && totalItems > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1",
                      justAdded && "cart-bounce"
                    )}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] leading-tight",
                active ? "font-bold text-accent" : "font-medium text-muted-foreground"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
