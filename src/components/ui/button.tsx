import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 disabled:opacity-40 cursor-pointer",
  {
    variants: {
      variant: {
        solid: "bg-ink text-white hover:bg-ink/80",
        outline: "border border-ink/20 text-ink hover:bg-ink hover:text-white",
        gold: "bg-gold text-white shadow-lg shadow-gold/30 hover:brightness-110",
        ghost: "hover:bg-ink/5",
      },
      size: { default: "h-12 px-7", sm: "h-9 px-4", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "solid", size: "default" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
