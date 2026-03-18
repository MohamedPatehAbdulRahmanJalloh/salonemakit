import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RateAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RateAppModal = ({ open, onOpenChange }: RateAppModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [step, setStep] = useState<"rate" | "thanks" | "store">("rate");

  const handleSubmit = () => {
    if (rating === 0) return;

    if (rating >= 4) {
      // Happy user → redirect to App Store
      setStep("store");
    } else {
      // Lower rating → thank them
      setStep("thanks");
    }
  };

  const handleStoreRedirect = () => {
    // Open App Store link (replace with actual App Store URL when published)
    window.open("https://salonemakitsl.com", "_blank");
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setTimeout(() => {
      setRating(0);
      setHoveredStar(0);
      setStep("rate");
    }, 300);
  };

  const handleClose = (value: boolean) => {
    onOpenChange(value);
    if (!value) resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs rounded-2xl p-6 text-center">
        <DialogTitle className="sr-only">Rate SaloneMakitSL</DialogTitle>

        {step === "rate" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-3xl">⭐</div>
            <h3 className="text-sm font-extrabold text-foreground">Enjoying SaloneMakitSL?</h3>
            <p className="text-xs text-muted-foreground">Tap a star to rate your experience</p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoveredStar || rating) >= star
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-accent"
              >
                {rating <= 2 ? "We can do better! 😔" : rating <= 3 ? "Thanks! 🙂" : rating === 4 ? "Great! 😊" : "Awesome! 🎉"}
              </motion.p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 text-xs font-bold disabled:opacity-40"
            >
              Submit Rating
            </Button>
          </motion.div>
        )}

        {step === "thanks" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3 py-2"
          >
            <div className="text-4xl">💚</div>
            <h3 className="text-sm font-extrabold">Thank You!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your feedback helps us improve. We're working hard to make SaloneMakitSL better for you!
            </p>
            <Button
              onClick={() => handleClose(false)}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 text-xs font-bold"
            >
              Done
            </Button>
          </motion.div>
        )}

        {step === "store" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3 py-2"
          >
            <div className="text-4xl">🎉</div>
            <h3 className="text-sm font-extrabold">You're Awesome!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Would you mind leaving us a review on the App Store? It really helps other Sierra Leoneans discover us!
            </p>
            <Button
              onClick={handleStoreRedirect}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 text-xs font-bold gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Rate on App Store
            </Button>
            <button
              onClick={() => handleClose(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RateAppModal;
