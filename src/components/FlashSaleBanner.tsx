import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const useFlashSales = () => {
  return useQuery({
    queryKey: ["flash_sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .lte("starts_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
  });
};

const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      {[
        { val: timeLeft.hours, label: "h" },
        { val: timeLeft.minutes, label: "m" },
        { val: timeLeft.seconds, label: "s" },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <span className="bg-background/90 text-foreground text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[28px] text-center">
            {pad(t.val)}
          </span>
          {i < 2 && <span className="text-background/70 text-xs font-bold">:</span>}
        </div>
      ))}
    </div>
  );
};

const FlashSaleBanner = () => {
  const { data: sale } = useFlashSales();

  if (!sale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-3"
    >
      <Link to="/search" className="block">
        <div className="rounded-2xl bg-destructive px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-destructive-foreground">
                ⚡ {sale.title}
              </p>
              {sale.subtitle && (
                <p className="text-[10px] text-destructive-foreground/80">{sale.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-extrabold text-destructive-foreground">
              {sale.discount_percent}% OFF
            </span>
            <CountdownTimer endsAt={sale.ends_at} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FlashSaleBanner;
