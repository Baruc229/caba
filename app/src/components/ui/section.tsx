import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

function Section({ children, className, as: Component = "section" }: SectionProps) {
  return (
    <Component className={cn("py-12 md:py-16 lg:py-20", className)}>
      {children}
    </Component>
  );
}

export { Section };
