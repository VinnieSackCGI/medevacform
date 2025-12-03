import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-theme-bg-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matisse focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-matisse text-white hover:bg-matisse-hover shadow-theme-sm",
        destructive:
          "bg-theme-status-error text-white hover:opacity-90 shadow-theme-sm",
        outline:
          "border border-theme-border-primary bg-theme-bg-primary text-theme-text-primary hover:bg-theme-bg-secondary hover:text-theme-text-primary",
        secondary:
          "bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary shadow-theme-sm",
        ghost: "hover:bg-theme-bg-secondary hover:text-theme-text-primary",
        link: "text-matisse underline-offset-4 hover:underline hover:text-matisse-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
