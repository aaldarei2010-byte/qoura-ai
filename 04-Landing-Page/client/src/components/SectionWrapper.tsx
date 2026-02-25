import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionWrapper({ id, children, className, noPadding }: SectionWrapperProps) {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        !noPadding && "py-20 md:py-28",
        className
      )}
    >
      {children}
    </section>
  );
}
