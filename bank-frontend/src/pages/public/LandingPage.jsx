import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { motion } from 'framer-motion';
import RevealText from '../../components/animations/RevealText';
import CountUpStat from '../../components/animations/CountUpStat';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const floatingRef = useRef(null);

  useEffect(() => {
    // Floating graphic animation
    if (floatingRef.current) {
      gsap.to(floatingRef.current, {
        y: -30,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Scroll trigger animations for elements
    gsap.utils.toArray('.scroll-fade-in').forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">NexPay</h1>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <RevealText text="Trusted. Secure. Limitless." delay={0.2} />
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Experience banking redefined. Fast transfers, zero fraud, and complete peace of mind.
            </p>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg"
            >
              Open Account Now
            </motion.button>
          </div>

          {/* Right - Floating Graphic */}
          <div className="relative h-96 flex items-center justify-center">
            <div
              ref={floatingRef}
              className="relative w-64 h-64 rounded-none bg-gradient-to-br from-blue-50 to-blue-100 shadow-elegant-md flex items-center justify-center"
            >
              {/* Abstract card visual */}
              <div className="absolute w-48 h-32 bg-white rounded-none shadow-elegant-md transform -rotate-6 border border-gray-100">
                <div className="p-4 space-y-3">
                  <div className="h-2 bg-gray-200 rounded-full w-2/3" />
                  <div className="h-2 bg-gray-200 rounded-full w-4/5" />
                  <div className="h-2 bg-blue-600 rounded-full w-1/2" />
                </div>
              </div>
              <div className="absolute w-48 h-32 bg-blue-600 rounded-none shadow-elegant-md transform rotate-6 opacity-90 border border-blue-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <RevealText text="Trusted by Millions" delay={0.1} />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 scroll-fade-in">
            <CountUpStat target="50B" label="Transactions" delay={0} />
            <CountUpStat target="2M" label="Customers" delay={0.1} />
            <CountUpStat target="99.9" label="% Uptime (SLA)" delay={0.2} />
            <CountUpStat target="128" label="-bit Security" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <RevealText text="Why Choose NexPay?" delay={0.1} />
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
            Experience banking the way it should be — secure, fast, and designed for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-fade-in">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Transfers complete in seconds, not hours. Real-time processing with instant confirmations.',
                borderColor: 'border-blue-500'
              },
              {
                icon: '🔐',
                title: 'AI-Powered Security',
                description: 'Advanced fraud detection that works 24/7 using machine learning algorithms.',
                borderColor: 'border-purple-500'
              },
              {
                icon: '💰',
                title: 'Zero Hidden Fees',
                description: 'Complete transparency. No surprise charges, just honest pricing for every transaction.',
                borderColor: 'border-green-500'
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Send and receive money internationally with competitive exchange rates.',
                borderColor: 'border-orange-500'
              },
              {
                icon: '📱',
                title: 'Mobile-First Design',
                description: 'Manage your finances anywhere, anytime with our intuitive mobile app.',
                borderColor: 'border-pink-500'
              },
              {
                icon: '✓',
                title: '24/7 Customer Support',
                description: 'Dedicated support team available round the clock to help you succeed.',
                borderColor: 'border-cyan-500'
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                className={`bg-white card p-8 border-l-4 ${feature.borderColor} cursor-pointer hover:shadow-lg transition-shadow`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-800 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            <RevealText text="Ready to Join?" />
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Get your account verified in minutes. Start banking smarter today.
          </p>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-600 text-white font-medium rounded-none hover:bg-blue-700 transition-colors duration-300"
          >
            Create Account
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>&copy; 2024 NexPay. All rights reserved. | Secure Banking Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
