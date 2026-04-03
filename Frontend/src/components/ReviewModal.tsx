import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Camera, X, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  token: string;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  token,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    if (image) {
      formData.append("image", image);
    }

    try {
      await api.post("/reviews", formData, token);
      toast({ title: "Review submitted! 🎉", description: "Thank you for your feedback." });
      onSuccess();
      onClose();
      // Reset state
      setRating(5);
      setComment("");
      removeImage();
    } catch (error: any) {
      toast({ 
        title: "Submission failed", 
        description: error.message || "Could not save your review.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none rounded-3xl overflow-hidden shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-black italic tracking-tight">Review Your Thali</DialogTitle>
          <DialogDescription className="font-medium text-xs text-muted-foreground uppercase tracking-widest opacity-70">
            Share your honest thoughts to help others decide.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center gap-3 py-2 bg-muted/20 rounded-2xl border border-dashed border-border/60">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all hover:scale-125 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoverRating || rating) >= star 
                        ? "fill-primary text-primary" 
                        : "text-muted-foreground/30"
                    } transition-colors duration-200 cursor-pointer`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
              {rating === 5 ? "Mind-blowing!" : rating === 4 ? "Loved it!" : rating === 3 ? "It was okay" : rating === 2 ? "Could be better" : rating === 1 ? "Disappointed" : "Select Rating"}
            </span>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Write Your Experience</Label>
            <Textarea
              id="comment"
              placeholder="How was the taste? Is it ghar jaisa thali?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-32 rounded-2xl border-2 focus-visible:ring-primary font-medium resize-none text-sm p-4 bg-muted/10"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            {!imagePreview ? (
              <label 
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-3xl cursor-pointer hover:bg-muted/30 transition-all group overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Thali Photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            ) : (
              <div className="relative h-32 w-full rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    onClick={removeImage}
                    className="rounded-full w-10 h-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 gradient-primary text-primary-foreground font-black italic tracking-tighter text-lg rounded-xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  POSTING...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  PUBLISH REVIEW
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
