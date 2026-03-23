import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const RevealText = ({ text, className = '', delay = 0 }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    const words = text.split(' ');
    textRef.current.innerHTML = words
      .map(
        (word) =>
          `<span style="display: inline-block; overflow: hidden;">
            <span style="display: inline-block;">${word}</span>
          </span>`
      )
      .join(' ');

    const spans = textRef.current.querySelectorAll('span > span');

    gsap.fromTo(
      spans,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        delay,
        ease: 'power3.out',
      }
    );
  }, [text, delay]);

  return <span ref={textRef} className={className} />;
};

export default RevealText;
