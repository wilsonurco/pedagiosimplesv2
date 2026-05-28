import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // ── Semânticas de domínio ─────────────────────────────────────────────
        /** Passagem com risco de multa / prazo crítico */
        risco:
          "border-transparent bg-[#F8D7DD] text-[#A3203B] [a&]:hover:bg-[#F0A8B5]",
        /** Débito pendente aguardando pagamento */
        pendente:
          "border-transparent bg-[#FBE8C5] text-[#7A4800] [a&]:hover:bg-[#F4C97A]",
        /** Pagamento confirmado / estado positivo */
        sucesso:
          "border-transparent bg-[#D4F0E2] text-[#0E8B5A] [a&]:hover:bg-[#A3D9BE]",
        /** Informação / categoria de produto */
        info:
          "border-transparent bg-[#F4EFFB] text-[#5B2E8C] [a&]:hover:bg-[#EDE7F6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
