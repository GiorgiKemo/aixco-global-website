import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-scroll-reveal");

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));
    const petalPattern = ["left", "center", "right", "center"] as const;

    elements.forEach((element, index) => {
      element.classList.remove("is-visible");
      element.dataset.rosePetal = petalPattern[index % petalPattern.length];
      if (!element.style.getPropertyValue("--reveal-delay")) {
        element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 85}ms`);
      }
    });

    let observer: IntersectionObserver | undefined;

    const revealElement = (element: Element) => {
      element.classList.add("is-visible");
      observer?.unobserve(element);
    };

    const revealVisibleElements = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      elements.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const rect = element.getBoundingClientRect();
        const entersViewport = rect.top < viewportHeight * 0.88 && rect.bottom > viewportHeight * 0.08;
        if (entersViewport) revealElement(element);
      });
    };

    const clearPollWhenComplete = () => {
      if (elements.every((element) => element.classList.contains("is-visible"))) {
        window.clearInterval(poll);
      }
    };

    let frame = 0;
    const scheduleReveal = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        revealVisibleElements();
        clearPollWhenComplete();
      });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealElement(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.12,
        },
      );
    }

    elements.forEach((element) => {
      observer?.observe(element);
    });

    scheduleReveal();
    const poll = window.setInterval(scheduleReveal, 180);
    window.addEventListener("scroll", scheduleReveal, { passive: true });
    window.addEventListener("resize", scheduleReveal);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(poll);
      window.removeEventListener("scroll", scheduleReveal);
      window.removeEventListener("resize", scheduleReveal);
      observer?.disconnect();
    };
  }, [location.pathname]);
}
