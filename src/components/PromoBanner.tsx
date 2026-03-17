import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="mx-4 lg:mx-8 mt-5 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-5 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-[10px] lg:text-xs text-accent font-bold uppercase tracking-widest mb-1">
          🎉 Limited Time Offer
        </p>
        <h3 className="text-lg lg:text-2xl font-extrabold text-white leading-tight">
          Free Delivery Across <span className="text-accent">All 16 Districts</span>
        </h3>
        <p className="text-xs lg:text-sm text-white/70 mt-1">
          On orders above Le 200,000 • Pay with Orange Money or COD
        </p>
      </div>
      <Link
        to="/search"
        className="flex items-center gap-2 bg-accent text-accent-foreground text-xs lg:text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-accent/90 transition-colors shrink-0"
      >
        <ShoppingBag className="h-4 w-4" />
        Shop Now
      </Link>
    </section>
  );
};

export default PromoBanner;
