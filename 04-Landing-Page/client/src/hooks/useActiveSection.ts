import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "@/lib/constants";

export function useActiveSection() {
  const [activeId, setActiveId] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const sorted = visible.sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );
          setActiveId(sorted[0].target.id);
        }
      },
      { threshold: 0.3 }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return activeId;
}
