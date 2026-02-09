import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  isLoading?: boolean;
}

export function CyberButton({ 
  className, 
  variant = "primary", 
  isLoading, 
  children, 
  disabled,
  ...props 
}: CyberButtonProps) {
  
  const variants = {
    primary: "bg-primary/20 text-primary border-primary hover:bg-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]",
    secondary: "bg-secondary/20 text-secondary border-secondary hover:bg-secondary/30 shadow-[0_0_15px_rgba(180,50,255,0.3)]",
    destructive: "bg-destructive/20 text-destructive border-destructive hover:bg-destructive/30 shadow-[0_0_15px_rgba(255,50,50,0.3)]",
    outline: "bg-transparent text-foreground border-muted-foreground hover:border-primary hover:text-primary",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "relative group px-6 py-3 font-mono font-bold tracking-wider uppercase transition-all duration-200",
        "border backdrop-blur-sm",
        "clip-path-polygon-[0_0,100%_0,100%_70%,90%_100%,0_100%]", // Angular cut
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
