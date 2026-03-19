import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTheme } from "@/hooks/useTheme";
import { useWishlist } from "@/hooks/useWishlist";
import { Info, Globe } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useRegion, Region } from "@/context/RegionContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RateAppModal from "@/components/RateAppModal";
import {
  User, Heart, ClipboardList, LogOut, ChevronRight,
  Shield, Tag, HelpCircle, MessageCircle, Gift, Star, Truck,
  Moon, Sun, BarChart3, ThumbsUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const ProfilePage = () => {
  useDocumentTitle("My Profile");
  const { formatPrice, region, updateProfileRegion } = useRegion();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { data: orders = [] } = useOrders();
  const [showRateApp, setShowRateApp] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <img src={logo} alt="SaloneMakitSL" className="h-16 w-16 rounded-xl mb-4" />
        <h2 className="text-base font-extrabold text-primary">Welcome to SaloneMakitSL</h2>
        <p className="text-xs text-muted-foreground mt-1 text-center">Sign in to track orders, save favorites, and more</p>
        <div className="flex gap-3 mt-5 w-full max-w-xs">
          <Link to="/auth" className="flex-1">
            <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-bold text-xs">Sign In</Button>
          </Link>
          <Link to="/auth" className="flex-1">
            <Button variant="outline" className="w-full h-11 rounded-lg font-bold text-xs border-accent text-accent">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o: any) => ["confirmed", "processing"].includes(o.status)).length;
  const shippedOrders = orders.filter((o: any) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + o.total, 0);

  const menuSections = [
    {
      title: "My Orders",
      items: [
        { icon: ClipboardList, label: "All Orders", value: `${orders.length}`, to: "/orders" },
        { icon: Truck, label: "Track Delivery", value: shippedOrders > 0 ? `${shippedOrders} in transit` : "", to: "/orders" },
      ],
    },
    {
      title: "My Stuff",
      items: [
        { icon: Heart, label: "Wishlist", value: `${wishlistCount}`, to: "/wishlist" },
        { icon: Tag, label: "Coupons", value: "", to: "/search" },
        { icon: Star, label: "Reviews", value: "", to: "/orders" },
      ],
    },
    ...(isAdmin ? [{
      title: "Admin",
      items: [
        { icon: Shield, label: "Dashboard", value: "", to: "/admin" },
        { icon: BarChart3, label: "Analytics", value: "", to: "/admin/analytics" },
      ],
    }] : []),
    {
      title: "Support",
      items: [
        { icon: Info, label: "About SaloneMakitSL", value: "", to: "/about" },
        { icon: MessageCircle, label: "WhatsApp Support", value: "", to: "https://wa.me/23278928111", external: true },
        { icon: ThumbsUp, label: "Rate App", value: "", action: () => setShowRateApp(true) },
        { icon: HelpCircle, label: "Help Center", value: "", to: "/" },
        { icon: Gift, label: "Refer a Friend", value: "Soon", to: "/" },
      ],
    },
  ];

  return (
    <div className="pb-20 lg:pb-6 bg-background max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-primary px-4 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
            <span className="text-lg font-bold text-accent-foreground">
              {(user.email?.[0] || "U").toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-primary-foreground truncate">
              {user.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-[10px] text-primary-foreground/60 truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[9px] font-bold">
                <Shield className="h-2.5 w-2.5" /> Admin
              </span>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-primary-foreground" />}
          </button>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-4 gap-1.5 mt-4">
          {[
            { label: "Pending", count: pendingOrders, emoji: "⏳" },
            { label: "Processing", count: confirmedOrders, emoji: "📋" },
            { label: "Shipped", count: shippedOrders, emoji: "🚚" },
            { label: "Delivered", count: deliveredOrders, emoji: "✅" },
          ].map((stat) => (
            <Link to="/orders" key={stat.label} className="bg-primary-foreground/10 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-primary-foreground">{stat.count}</p>
              <p className="text-[8px] text-primary-foreground/60 font-medium">{stat.emoji} {stat.label}</p>
            </Link>
          ))}
        </div>

        {totalSpent > 0 && (
          <div className="mt-2 bg-primary-foreground/10 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-primary-foreground/60">Total Spent</p>
            <p className="text-sm font-extrabold text-accent">{formatPrice(totalSpent)}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 pt-3 space-y-3">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{section.title}</p>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {section.items.map((item: any, i: number) => {
                if (item.action) {
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors",
                        i < section.items.length - 1 && "border-b border-border"
                      )}
                    >
                      <item.icon className="h-4 w-4 text-accent" />
                      <span className="flex-1 text-xs font-medium text-left">{item.label}</span>
                      {item.value && <span className="text-[10px] text-muted-foreground">{item.value}</span>}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </button>
                  );
                }
                const Wrapper = item.external ? "a" : Link;
                const linkProps = item.external
                  ? { href: item.to, target: "_blank", rel: "noopener noreferrer" }
                  : { to: item.to };
                return (
                  <Wrapper
                    key={item.label}
                    {...(linkProps as any)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors",
                      i < section.items.length - 1 && "border-b border-border"
                    )}
                  >
                    <item.icon className="h-4 w-4 text-accent" />
                    <span className="flex-1 text-xs font-medium">{item.label}</span>
                    {item.value && <span className="text-[10px] text-muted-foreground">{item.value}</span>}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </Wrapper>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-3 bg-destructive/5 rounded-lg border border-destructive/20 hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 text-destructive" />
          <span className="text-xs font-medium text-destructive">Sign Out</span>
        </button>

        <p className="text-center text-[9px] text-muted-foreground pt-1 pb-4">SaloneMakitSL v1.0 • Made in Sierra Leone 🇸🇱</p>
      </div>
      <RateAppModal open={showRateApp} onOpenChange={setShowRateApp} />
    </div>
  );
};

export default ProfilePage;
