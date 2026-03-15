import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/components/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User, Heart, ShoppingBag, ClipboardList, Settings, LogOut, ChevronRight,
  Shield, Tag, HelpCircle, Bell, MessageCircle, Gift, Star, Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { data: orders = [] } = useOrders();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-5">
          <User className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold text-primary">Welcome to SaloneMakit</h2>
        <p className="text-sm text-muted-foreground mt-1 text-center">Sign in to track orders, save favorites, and more</p>
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          <Link to="/auth" className="flex-1">
            <Button className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-bold">Sign In</Button>
          </Link>
          <Link to="/auth" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-accent text-accent">Register</Button>
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
        { icon: Heart, label: "Wishlist", value: `${wishlistCount} items`, to: "/wishlist" },
        { icon: Tag, label: "My Coupons", value: "", to: "/search" },
        { icon: Star, label: "My Reviews", value: "", to: "/orders" },
      ],
    },
    ...(isAdmin ? [{
      title: "Admin",
      items: [
        { icon: Shield, label: "Admin Dashboard", value: "", to: "/admin" },
      ],
    }] : []),
    {
      title: "Support & Settings",
      items: [
        { icon: MessageCircle, label: "WhatsApp Support", value: "", to: "https://wa.me/23278928111", external: true },
        { icon: HelpCircle, label: "Help Center", value: "", to: "/" },
        { icon: Bell, label: "Notifications", value: "", to: "/" },
        { icon: Gift, label: "Refer a Friend", value: "Coming Soon", to: "/" },
      ],
    },
  ];

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="bg-primary px-4 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-foreground">
              {(user.email?.[0] || "U").toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-primary-foreground">
              {user.email?.split("@")[0] || "User"}
            </h2>
            <p className="text-xs text-primary-foreground/70">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: "Pending", count: pendingOrders, emoji: "⏳" },
            { label: "Processing", count: confirmedOrders, emoji: "📋" },
            { label: "Shipped", count: shippedOrders, emoji: "🚚" },
            { label: "Delivered", count: deliveredOrders, emoji: "✅" },
          ].map((stat) => (
            <Link to="/orders" key={stat.label} className="bg-primary-foreground/10 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-primary-foreground">{stat.count}</p>
              <p className="text-[9px] text-primary-foreground/70 font-medium">{stat.emoji} {stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Total Spent */}
        {totalSpent > 0 && (
          <div className="mt-3 bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-[10px] text-primary-foreground/70 font-medium">Total Spent</p>
            <p className="text-lg font-extrabold text-accent">{formatPrice(totalSpent)}</p>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      <div className="px-4 pt-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{section.title}</p>
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              {section.items.map((item: any, i: number) => {
                const Wrapper = item.external ? "a" : Link;
                const linkProps = item.external
                  ? { href: item.to, target: "_blank", rel: "noopener noreferrer" }
                  : { to: item.to };
                return (
                  <Wrapper
                    key={item.label}
                    {...(linkProps as any)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 hover:bg-secondary transition-colors",
                      i < section.items.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <item.icon className="h-5 w-5 text-accent" />
                    <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                    {item.value && <span className="text-xs text-muted-foreground font-medium">{item.value}</span>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </Wrapper>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-destructive/5 rounded-xl border border-destructive/20 hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Sign Out</span>
        </button>

        {/* App version */}
        <p className="text-center text-[10px] text-muted-foreground pt-2 pb-4">SaloneMakit v1.0 • Made in Sierra Leone 🇸🇱</p>
      </div>
    </div>
  );
};

export default ProfilePage;
