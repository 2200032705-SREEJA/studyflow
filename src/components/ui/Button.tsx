import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-amber text-white hover:bg-amber-dark focus-visible:ring-amber-dark",
  secondary: "bg-ink text-paper hover:bg-ink-light focus-visible:ring-ink",
  ghost: "bg-transparent text-ink dark:text-paper hover:bg-paper-dim dark:hover:bg-ink-light",
  danger: "bg-pen-rose text-white hover:opacity-90"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-card px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
