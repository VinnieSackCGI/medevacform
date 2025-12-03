import * as React from "react"

import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-theme-border-primary bg-theme-bg-primary px-3 py-2 text-base text-theme-text-primary placeholder:text-theme-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matisse focus-visible:ring-offset-2 focus-visible:ring-offset-theme-bg-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-200",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
