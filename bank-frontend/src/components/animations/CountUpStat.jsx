import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CountUpStat = ({ target, label, delay = 0 }) => {
  const numberRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!numberRef.current || hasAnimated) return;

    const parseTarget = (val) => {
      if (typeof val === 'string') {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      }
      return val;
    };

    const triggerElement = numberRef.current.closest('.stat-item');

    ScrollTrigger.create({
      trigger: triggerElement,
      onEnter: () => {
        setHasAnimated(true);

        gsap.to(
          { value: 0 },
          {
            value: parseTarget(target),
            duration: 2.5,
            delay,
            ease: 'power2.out',
            onUpdate: function () {
              if (typeof target === 'string' && target.includes('%')) {
                numberRef.current.innerHTML = Math.floor(this.targets()[0].value) + '%';
              } else if (typeof target === 'string' && target.includes('B')) {
                const value = this.targets()[0].value.toFixed(1);
                numberRef.current.innerHTML = value + 'B+';
              } else if (typeof target === 'string' && target.includes('M')) {
                const value = this.targets()[0].value.toFixed(1);
                numberRef.current.innerHTML = value + 'M+';
              } else {
                numberRef.current.innerHTML = Math.floor(this.targets()[0].value);
              }
            },
          }
        );
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [target, delay, hasAnimated]);

  return (
    <div className="stat-item text-center">
      <div className="text-4xl font-bold text-blue-600 mb-2" ref={numberRef}>
        0
      </div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

export default CountUpStat;
