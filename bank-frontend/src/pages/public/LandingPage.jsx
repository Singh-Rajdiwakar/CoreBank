import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useGSAP(() => {
    // 1. Dynamic Orbs Animation
    gsap.to('.bg-orb', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // 2. Hero Section Entrance
    const tl = gsap.timeline();
    tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'back.out(1.5)' })
      .from('.hero-title-line', { opacity: 0, y: 50, duration: 0.8, stagger: 0.15, ease: 'power4.out' }, '-=0.2')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero-btn', { opacity: 0, scale: 0.9, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2')
      .from('.float-card', { opacity: 0, x: 50, rotationY: 15, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');

    // 3. Floating 3D Cards continuous motion
    gsap.to('.float-card-1', { y: -20, duration: 2.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.float-card-2', { y: 20, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });
    gsap.to('.float-card-3', { y: -15, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });

    // 4. Staggered Stats Entrance
    gsap.from('.stat-box', {
      scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' },
      scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)'
    });

    // 5. Staggered Features Entrance
    gsap.from('.feature-card', {
      scrollTrigger: { trigger: '.features-grid', start: 'top 75%' },
      y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-slate-950 min-h-screen text-slate-100 overflow-x-hidden relative font-sans">
      
      {/* Background Glowing Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
        <div className="bg-orb absolute top-0 left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
        <div className="bg-orb absolute bottom-0 right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
        <div className="bg-orb absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/10 blur-[100px] mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/70 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/40 text-xl">N</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NexPay</h1>
          </div>
          <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all duration-300 text-sm backdrop-blur-sm">Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[95vh] flex items-center z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          <div className="pt-10 lg:pt-0">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs tracking-wider uppercase font-bold mb-8 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              The Future of Banking
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-8 tracking-tight">
              <span className="hero-title-line block text-white">Trusted.</span>
              <span className="hero-title-line block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Secure.</span>
              <span className="hero-title-line block text-slate-400">Limitless.</span>
            </h1>
            
            <p className="hero-subtitle text-xl text-slate-400 mb-10 leading-relaxed max-w-lg font-light">
              Experience a financial ecosystem built for velocity. Instant transfers, AI fraud detection, and complete peace of mind.
            </p>
            
            <div className="hero-btn">
              <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.8)] hover:-translate-y-1">
                Open Account Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>

          {/* Isometric 3D Visuals */}
          <div className="relative h-[600px] hidden lg:block perspective-[1200px]">
            
            {/* Front Card */}
            <div className="float-card float-card-1 absolute top-[10%] right-[10%] w-80 h-52 bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between z-30 transform -rotate-12 hover:rotate-0 transition-transform duration-700">
              <div className="flex justify-between items-center">
                <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded opacity-90" />
                <div className="text-slate-500 font-bold tracking-widest">NEXPAY</div>
              </div>
              <div className="text-2xl tracking-[0.25em] font-mono text-slate-300">•••• •••• •••• 4092</div>
              <div className="flex justify-between text-sm text-slate-400 uppercase tracking-widest">
                <span>Raj Singh</span>
                <span>12/28</span>
              </div>
            </div>
            
            {/* Back App Dashboard Card */}
            <div className="float-card float-card-2 absolute bottom-[15%] left-[5%] w-72 bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl z-20">
              <div className="text-sm text-slate-400 mb-2 font-medium">Total Balance</div>
              <div className="text-3xl font-black text-white mb-6 tracking-tight">₹ 4,52,000.00</div>
              <div className="space-y-4">
                <div className="h-14 bg-slate-800/50 rounded-xl flex items-center px-4 gap-4 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">↓</div>
                  <div className="flex-1">
                     <div className="flex justify-between mb-1"><div className="h-2.5 w-16 bg-slate-600 rounded" /><div className="h-2.5 w-12 bg-emerald-500/80 rounded" /></div>
                     <div className="h-1.5 w-24 bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-14 bg-slate-800/50 rounded-xl flex items-center px-4 gap-4 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">↑</div>
                  <div className="flex-1">
                     <div className="flex justify-between mb-1"><div className="h-2.5 w-20 bg-slate-600 rounded" /><div className="h-2.5 w-10 bg-slate-500 rounded" /></div>
                     <div className="h-1.5 w-16 bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Orb/Badge */}
            <div className="float-card float-card-3 absolute top-[35%] left-[0%] w-36 h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 border border-white/20 shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)] z-40 flex flex-col justify-center items-center text-white rotate-12">
              <div className="text-4xl mb-2 drop-shadow-xl">✨</div>
              <div className="font-bold text-center text-sm uppercase tracking-wider">Zero Fees</div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Stats Section */}
      <section className="py-24 px-6 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "50B+", label: "Transactions", color: "text-blue-400" },
              { val: "2.5M", label: "Customers", color: "text-indigo-400" },
              { val: "99.9%", label: "Uptime SLA", color: "text-emerald-400" },
              { val: "256-bit", label: "Encryption", color: "text-purple-400" }
            ].map((s, i) => (
              <div key={i} className="stat-box flex flex-col items-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <div className={`text-4xl md:text-5xl font-black mb-3 ${s.color} drop-shadow-lg`}>{s.val}</div>
                <div className="text-slate-400 font-medium text-xs tracking-[0.2em] uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Why Choose NexPay?</h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed">Experience banking the way it should be — securely engineered, lightning fast, and seamlessly integrated into your lifestyle.</p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Settle transfers in seconds globally, driven by our optimized network backbone.' },
              { icon: '🧠', title: 'AI Security', desc: 'Predictive machine learning algorithms actively detect and halt fraud 24/7.' },
              { icon: '💎', title: 'Zero Hidden Fees', desc: 'We value transparency. Say goodbye to maintenance fees and hidden charges.' },
              { icon: '🌍', title: 'Global Reach', desc: 'Send and receive major currencies instantly with industry-leading exchange rates.' },
              { icon: '📱', title: 'Mobile First', desc: 'Manage finances entirely on the go via our meticulously crafted UX/UI.' },
              { icon: '🎧', title: '24/7 Support', desc: 'Priority human support anytime you need, completely eliminating wait times.' },
            ].map((f, i) => (
              <div key={i} className="feature-card group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 p-10 rounded-[2rem] transition-all duration-500 hover:shadow-[0_0_40px_-20px_rgba(59,130,246,0.3)]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3rem] p-12 md:p-20 text-center border border-white/10 shadow-2xl relative overflow-hidden">
          {/* CTA Background accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
             <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight">Ready for the Future?</h2>
             <p className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto font-light">Join millions of users who are already banking smarter. Get your account verified in under 3 minutes.</p>
             <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-slate-950 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] text-lg inline-flex items-center gap-3">
               Start Banking Now
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
             </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 relative z-10">
        &copy; 2026 NexPay. Built with high-level precision.
      </footer>
    </div>
  );
};

export default LandingPage;
