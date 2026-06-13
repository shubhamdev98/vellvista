import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "muted";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-surface border border-light",
      surface: "bg-surface/90 backdrop-blur-md border border-light",
      muted: "bg-background-muted",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg shadow-sm",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
