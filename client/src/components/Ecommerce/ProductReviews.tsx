/**
 * Product Reviews Component
 * Display and manage product reviews and ratings
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  images?: string[];
}

export interface ProductReviewsProps {
  productId: string;
  reviews: ProductReview[];
  onAddReview?: (review: Omit<ProductReview, 'id' | 'createdAt' | 'verified' | 'helpful'>) => void;
  className?: string;
}

export function ProductReviews({ productId, reviews, onAddReview, className = '' }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const handleSubmitReview = () => {
    if (!newReview.userName.trim() || !newReview.comment.trim()) {
      return;
    }

    if (onAddReview) {
      onAddReview({
        productId,
        userId: 'current-user',
        userName: newReview.userName,
        rating: newReview.rating,
        title: newReview.title || undefined,
        comment: newReview.comment,
      });
    }

    // Reset form
    setNewReview({
      userName: '',
      rating: 5,
      title: '',
      comment: '',
    });
    setShowReviewForm(false);
  };

  const handleHelpful = (reviewId: string) => {
    const newSet = new Set(helpfulReviews);
    if (newSet.has(reviewId)) {
      newSet.delete(reviewId);
    } else {
      newSet.add(reviewId);
    }
    setHelpfulReviews(newSet);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={interactive && onRate ? () => onRate(star) : undefined}
            className={interactive ? 'cursor-pointer' : ''}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Customer Reviews</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating Distribution */}
          {reviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-12">{rating} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Rating</label>
                  {renderStars(newReview.rating, true, (rating) =>
                    setNewReview({ ...newReview, rating })
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Review Title (Optional)</label>
                  <Input
                    placeholder="Summarize your experience"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} className="flex-1">
                    Submit Review
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h5 className="font-medium text-sm mb-1">{review.title}</h5>
                      )}
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleHelpful(review.id)}
                    className={`text-xs flex items-center gap-1 ${
                      helpfulReviews.has(review.id)
                        ? 'text-blue-600'
                        : 'text-muted-foreground hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${helpfulReviews.has(review.id) ? 'fill-current' : ''}`} />
                    Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

