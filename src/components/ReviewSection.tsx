import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { reviews, averageRating, reviewCount, userReview, addReview, deleteReview } = useReviews(productId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    addReview.mutate(
      { productId, rating, comment },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setRating(0);
          setComment("");
          setShowForm(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to submit review");
        },
      }
    );
  };

  const handleDelete = (reviewId: string) => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => toast.success("Review deleted"),
    });
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">Reviews</h3>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}
        </div>
        {user && !userReview && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => setShowForm(!showForm)}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && !userReview && (
        <div className="bg-secondary rounded-2xl p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Your Rating</p>
            <StarRating rating={rating} interactive onRate={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="rounded-xl resize-none text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={addReview.isPending}
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl text-xs"
            >
              {addReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => { setShowForm(false); setRating(0); setComment(""); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sign in prompt */}
      {!user && (
        <div className="bg-secondary rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/auth" className="text-accent font-semibold">Sign in</Link> to leave a review
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviewCount === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-secondary/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      R
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Verified Buyer</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {user && review.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="h-6 w-6 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
