import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aminata K.",
    location: "Freetown",
    rating: 5,
    text: "Di quality dae fine! I order country cloth and e come exactly as shown. Best online shop in Salone! 🇸🇱",
    avatar: "AK",
  },
  {
    name: "Mohamed B.",
    location: "Bo",
    rating: 5,
    text: "Fast delivery to Bo district. The ronko I ordered was premium quality. Will definitely shop again!",
    avatar: "MB",
  },
  {
    name: "Fatmata S.",
    location: "Kenema",
    rating: 4,
    text: "Love the variety of African fashion. Orange Money payment made it so easy. Great customer service too!",
    avatar: "FS",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="mt-6 px-4 lg:px-8">
      <h2 className="text-sm lg:text-lg font-bold text-foreground mb-3">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="bg-secondary/50 border border-border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent">{t.avatar}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.location}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  className={`h-3 w-3 ${j < t.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
