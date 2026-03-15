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
    <div className="flex items-center gap-0.5">
      {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((val, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <span className="bg-foreground text-background text-[11px] font-bold px-1 py-0.5 rounded-sm min-w-[22px] text-center">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-destructive-foreground text-[10px] font-bold">:</span>}
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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to="/search" className="block">
        <div className="bg-destructive px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-destructive-foreground fill-destructive-foreground" />
            <div>
              <p className="text-xs font-bold text-destructive-foreground">
                {sale.title}
              </p>
              {sale.subtitle && (
                <p className="text-[10px] text-destructive-foreground/80">{sale.subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
