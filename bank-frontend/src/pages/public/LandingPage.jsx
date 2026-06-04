import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Shield, Zap, CreditCard, BarChart2, Lock, Bell } from 'lucide-react';

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
    // const tl = gsap.timeline();
    // tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'back.out(1.5)' })
    //   .from('.hero-title-line', { opacity: 0, y: 50, duration: 0.8, stagger: 0.15, ease: 'power4.out' }, '-=0.2')
    //   .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    //   .from('.hero-btn', { opacity: 0, scale: 0.9, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2')
    //   .from('.float-card', { opacity: 0, x: 50, duration: 1, ease: 'power3.out' }, '-=0.8');

    // 4. Staggered Stats Entrance
    // gsap.from('.stat-box', {
    //   scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' },
    //   scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)'
    // });

    // 5. Staggered Features Entrance
    // gsap.from('.feature-card', {
    //   scrollTrigger: { trigger: '.features-grid', start: 'top 75%' },
    //   y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
    // });

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

          {/* Hero Visuals */}
          <div className="relative h-[600px] hidden lg:block w-full">
            
            {/* Soft Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B6FE8]/15 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative w-full h-full flex items-center justify-center">

              {/* Device Frame */}
              <div className="w-[520px] bg-[#1A1F35] rounded-2xl p-2 shadow-[0_0_60px_rgba(59,111,232,0.3)] z-30 transform hover:scale-[1.02] transition-transform duration-500 float-card">
                
                {/* Browser/Device Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                
                {/* Dashboard UI */}
                <div className="bg-[#0D1226] rounded-xl overflow-hidden h-[420px] flex flex-col">
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
                    <div className="font-bold text-white flex items-center gap-2">
                       <span className="w-6 h-6 rounded bg-[#3B6FE8] flex items-center justify-center text-xs">N</span>
                       NexPay
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs text-[#8A9BB5]">Welcome back, Raj</span>
                       <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-xs text-white font-medium">RS</div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-5">
                    
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-[#3B6FE8] to-indigo-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                       <div className="text-xs text-white/80 font-medium mb-1 tracking-wide">Total Balance</div>
                       <div className="text-2xl font-black text-white">₹ 4,52,000.00</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-[#1A1F35] rounded-xl p-3 flex items-center justify-center gap-2 border border-white/5 text-sm text-white font-medium hover:bg-white/5 cursor-pointer transition-colors shadow-sm">
                          <span className="text-[#3B6FE8]">↗</span> Transfer
                       </div>
                       <div className="bg-[#1A1F35] rounded-xl p-3 flex items-center justify-center gap-2 border border-white/5 text-sm text-white font-medium hover:bg-white/5 cursor-pointer transition-colors shadow-sm">
                          <span className="text-purple-400">📄</span> Pay EMI
                       </div>
                    </div>

                    <div className="flex gap-4 flex-1">
                      {/* Transactions List */}
                      <div className="flex-[3] bg-[#1A1F35] rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                        <div className="text-[10px] font-bold text-[#8A9BB5] uppercase tracking-wider mb-2">Recent Activity</div>
                        {[
                          { label: 'Netflix', time: 'Today', amount: '-₹649', color: 'text-red-400', icon: '🎬' },
                          { label: 'Salary', time: 'Yesterday', amount: '+₹1.2L', color: 'text-green-400', icon: '💰' },
                          { label: 'Amazon', time: 'May 10', amount: '-₹999', color: 'text-red-400', icon: '🛒' },
                        ].map((tx, idx) => (
                           <div key={idx} className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs">{tx.icon}</div>
                               <div>
                                  <div className="text-xs font-semibold text-white">{tx.label}</div>
                                  <div className="text-[9px] text-[#8A9BB5]">{tx.time}</div>
                               </div>
                             </div>
                             <div className={`text-xs font-bold ${tx.color}`}>{tx.amount}</div>
                           </div>
                        ))}
                      </div>

                      {/* Mini Chart Area */}
                      <div className="flex-[2] bg-[#1A1F35] rounded-xl p-4 border border-white/5 flex flex-col">
                         <div className="text-[10px] font-bold text-[#8A9BB5] uppercase tracking-wider mb-2">Flow</div>
                         <div className="flex-1 w-full flex items-end gap-1.5 pt-2">
                            {[40, 70, 45, 90, 60, 100].map((h, i) => (
                               <div key={i} className="flex-1 bg-gradient-to-t from-[#3B6FE8]/20 to-[#3B6FE8] rounded-t-sm transition-all duration-500 hover:opacity-80" style={{ height: `${h}%` }} />
                            ))}
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

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
      <section className="py-[80px] px-6 relative z-10 w-full max-w-[1100px] mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Why Choose NexPay?</h2>
          <p className="text-xl text-slate-400 font-light leading-relaxed">Experience banking the way it should be — securely engineered, lightning fast, and seamlessly integrated into your lifestyle.</p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Bank-Grade Security', desc: 'Secure 256-bit encryption and real-time fraud detection on every transaction.' },
            { icon: Zap, title: 'Instant Transfers', desc: 'Send money anywhere in seconds with zero processing delays.' },
            { icon: CreditCard, title: 'Zero Fee Banking', desc: 'No hidden charges, no maintenance fees. Keep every rupee you earn.' },
            { icon: BarChart2, title: 'Smart Analytics', desc: 'Track spending patterns and get AI-powered financial insights.' },
            { icon: Lock, title: 'Secure Loans', desc: 'Apply for instant loans with transparent EMI schedules and no surprises.' },
            { icon: Bell, title: 'Instant Alerts', desc: 'Real-time SMS and email notifications for every account activity.' },
          ].map((f, i) => {
            const IconComponent = f.icon;
            return (
              <div key={i} className="feature-card group bg-[#0D1226] border border-[#1E2A45] border-t-[3px] border-t-[#3B6FE8] p-[28px] rounded-xl transition-all duration-300 hover:shadow-[0_0_24px_rgba(59,111,232,0.2)] hover:-translate-y-1">
                <div className="mb-5">
                  <IconComponent size={28} color="#3B6FE8" />
                </div>
                <h3 className="text-[18px] font-[600] mb-3 text-white">{f.title}</h3>
                <p className="text-[#8A9BB5] text-[14px] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
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
