import type { ReactElement } from "react";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface RatingDisplayProps {
  rating: number;
  message?: string | null;
  userName: string;
  showUserName?: boolean;
  className?: string;
}

export function RatingDisplay({
  rating,
  message,
  userName,
  showUserName = true,
  className = "",
}: RatingDisplayProps) {
  const renderStars = () => {
    const stars: ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />,
      );
    }
    return stars;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-1">{renderStars()}</div>
        <Badge variant="secondary" className="text-xs">
          {rating}/5
        </Badge>
        {showUserName && (
          <span className="text-muted-foreground text-sm">by {userName}</span>
        )}
      </div>
      {message && (
        <p className="text-muted-foreground text-sm italic">"{message}"</p>
      )}
    </div>
  );
}
