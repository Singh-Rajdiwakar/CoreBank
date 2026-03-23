import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseEnter = () => {
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    };

    const onMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    // Animate cursor position
    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;

      gsap.set(cursor, {
        x: cursorX,
        y: cursorY,
      });

      gsap.set(dot, {
        x: mouseX,
        y: mouseY,
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle hover over clickable elements
    const handleHoverStart = () => {
      gsap.to(cursor, { scale: 2, duration: 0.3 });
    };

    const handleHoverEnd = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
    };

    const clickables = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select'
    );

    clickables.forEach((element) => {
      element.addEventListener('mouseenter', handleHoverStart);
      element.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      clickables.forEach((element) => {
        element.removeEventListener('mouseenter', handleHoverStart);
        element.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorDotRef}
        className="fixed w-1 h-1 bg-black rounded-full pointer-events-none z-50"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: 1,
        }}
      />
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border-2 border-blue-600 rounded-full pointer-events-none z-50 opacity-0"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};

export default CustomCursor;
