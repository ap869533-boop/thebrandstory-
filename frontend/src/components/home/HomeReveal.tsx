import React, { useEffect, useRef, useState } from 'react';

interface HomeRevealProps {
  children: React.ReactNode;
  className?: string;
  eager?: boolean;
}

export const HomeReveal: React.FC<HomeRevealProps> = ({ children, className = '', eager = false }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(eager);

  useEffect(() => {
    const element = elementRef.current;
    if (eager || !element) return;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={elementRef}
      className={`home-reveal ${isVisible ? 'home-reveal--visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
