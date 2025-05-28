import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`animate-spin text-[#2E7D32] ${sizeClasses[size]}`} />
      {text && (
        <p className="text-muted-foreground text-sm">{text}</p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
