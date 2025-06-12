import { useState } from "react";
import type { ReactElement } from "react";

import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { leaveRating } from "@/service/rating.service";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  onSuccess?: () => void;
}

export function RatingModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveRating({
        userId,
        rating,
        message: message.trim() || undefined,
      });

      toast.success("Rating submitted successfully!");
      onClose();
      onSuccess?.();

      // Reset form
      setRating(0);
      setHoveredRating(0);
      setMessage("");
    } catch (error: unknown) {
      console.error("Error submitting rating:", error);

      let errorMessage = "Failed to submit rating. Please try again.";

      // Handle specific error cases if needed
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: string };
        };
        if (axiosError.response?.status === 409) {
          errorMessage = "You have already rated this user.";
        } else if (axiosError.response?.status === 403) {
          errorMessage =
            "You can only rate users you have exchanged items with.";
        } else if (axiosError.response?.status === 422) {
          errorMessage = "Invalid rating value.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setMessage("");
      onClose();
    }
  };
  const renderStars = () => {
    const stars: ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoveredRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          className="p-1 transition-colors hover:scale-110"
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(i)}
          disabled={isSubmitting}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>,
      );
    }
    return stars;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {userName}</DialogTitle>
          <DialogDescription>
            Share your experience with {userName} to help the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="mb-3 text-sm font-medium">How was your experience?</p>
            <div className="flex justify-center space-x-1">{renderStars()}</div>
            {rating > 0 && (
              <p className="text-muted-foreground mt-2 text-sm">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Message Input */}
          <div>
            <label
              htmlFor="rating-message"
              className="mb-2 block text-sm font-medium"
            >
              Message (optional)
            </label>
            <Textarea
              id="rating-message"
              placeholder="Share details about your experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {message.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="bg-[#2E7D32] hover:bg-[#1B5E20]"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
