import { useEffect, useState } from 'react';

const ParallaxBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mesh gradient base - moves slowest */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-100/40 via-navy-200/30 to-navy-300/40"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      ></div>

      {/* Layer 1: Large orbs - slow parallax */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-navy-200 to-navy-400 rounded-full opacity-30 blur-3xl animate-float-slow"
        style={{
          transform: `translate(${scrollY * 0.15}px, ${scrollY * 0.2}px)`
        }}
      ></div>
      <div
        className="absolute -bottom-48 -left-48 w-[700px] h-[700px] bg-gradient-to-tr from-navy-300 to-navy-400 rounded-full opacity-25 blur-3xl animate-float-slower"
        style={{
          transform: `translate(${-scrollY * 0.12}px, ${scrollY * 0.18}px)`
        }}
      ></div>


      {/* Layer 3: Medium accent circles - faster parallax */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-navy-300 rounded-full opacity-20 blur-3xl animate-drift"
        style={{
          transform: `translate(${scrollY * 0.3}px, ${scrollY * 0.35}px)`
        }}
      ></div>
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-navy-400 rounded-full opacity-20 blur-3xl animate-drift-reverse"
        style={{
          transform: `translate(${-scrollY * 0.28}px, ${scrollY * 0.32}px)`
        }}
      ></div>

      {/* Layer 4: Small floating dots - fastest parallax */}
      <div
        className="absolute top-20 left-[40%] w-3 h-3 bg-navy-400 rounded-full opacity-60 animate-pulse-slow"
        style={{
          transform: `translate(${scrollY * 0.4}px, ${scrollY * 0.5}px)`
        }}
      ></div>
      <div
        className="absolute top-40 left-[45%] w-2 h-2 bg-navy-500 rounded-full opacity-50 animate-pulse-slower"
        style={{
          transform: `translate(${scrollY * 0.45}px, ${scrollY * 0.55}px)`
        }}
      ></div>
      <div
        className="absolute bottom-60 right-[35%] w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-pulse-slow"
        style={{
          transform: `translate(${-scrollY * 0.38}px, ${scrollY * 0.48}px)`
        }}
      ></div>
      <div
        className="absolute bottom-80 right-[40%] w-2 h-2 bg-navy-400 rounded-full opacity-50 animate-pulse-slower"
        style={{
          transform: `translate(${-scrollY * 0.42}px, ${scrollY * 0.52}px)`
        }}
      ></div>

      {/* Grid pattern overlay - subtle parallax */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.05}px)`
        }}
      ></div>
    </div>
  );
};

export default ParallaxBackground;
