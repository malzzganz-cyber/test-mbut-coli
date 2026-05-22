import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { addReview } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReviewModal = ({ open, onOpenChange }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile, user } = useAuth();

  const handleSubmit = async () => {
    if (!user) return;
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview(user.uid, {
        rating,
        comment,
        displayName: userProfile?.displayName || user.email?.split("@")[0] || "User",
        photoURL: userProfile?.photoURL || null,
      });
      toast.success("Review submitted! Thank you");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting review", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="brutal-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Leave a Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <Textarea
            placeholder="How was your experience?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border-2 border-black rounded-xl resize-none h-32"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="brutal-btn border-2">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="brutal-btn bg-primary text-black hover:bg-primary/90">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
