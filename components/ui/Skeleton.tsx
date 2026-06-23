import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "rect" | "circle" | "text";
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-surface-alt",
          variant === "circle" && "rounded-full",
          variant === "text" && "h-4 w-full rounded",
          variant === "rect" && "rounded-none",
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export default Skeleton;

// A helper for table row skeletons
export function TableRowSkeleton({ cols, showAction = false }: { cols: number; showAction?: boolean }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 pr-4">
          <div className="h-4 bg-surface-alt rounded w-2/3" />
        </td>
      ))}
      {showAction && (
        <td className="py-4 text-right">
          <div className="h-8 bg-surface-alt rounded w-16 ml-auto" />
        </td>
      )}
    </tr>
  );
}

// A helper for product card skeletons
export function ProductCardSkeleton() {
  return (
    <div className="bg-surface overflow-hidden border border-gray-200 animate-pulse">
      {/* Aspect Square Image Placeholder */}
      <div className="aspect-square bg-surface-alt w-full" />
      {/* Info Section */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <div className="h-4 bg-surface-alt rounded w-3/4 mb-2" />
        {/* Brand */}
        <div className="h-3 bg-surface-alt rounded w-1/2 mb-4" />
        {/* Price */}
        <div className="h-5 bg-surface-alt rounded w-1/3 mb-4" />
        {/* Button */}
        <div className="h-10 bg-surface-alt w-full mt-3" />
      </div>
    </div>
  );
}

// A helper for dashboard stats skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-surface p-4 sm:p-6 border border-light animate-pulse flex flex-col justify-between h-[100px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="h-3 bg-surface-alt rounded w-1/2" />
        <div className="h-5 bg-surface-alt rounded-full w-5 shrink-0" />
      </div>
      <div className="h-6 bg-surface-alt rounded w-1/3" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 bg-surface-alt rounded w-1/4 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface-alt w-full" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-alt w-full" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-9 bg-surface-alt rounded w-3/4" />
            <div className="h-6 bg-surface-alt rounded w-1/3" />
            <div className="h-4 bg-surface-alt rounded w-1/4" />
          </div>

          <div className="h-10 bg-surface-alt rounded w-1/4 mt-6" />

          <div className="h-24 bg-surface-alt rounded w-full mt-6" />

          {/* Buttons and actions */}
          <div className="space-y-4 pt-4">
            <div className="h-12 bg-surface-alt w-full" />
            <div className="h-12 bg-surface-alt w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
