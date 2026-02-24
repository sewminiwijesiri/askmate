"use client";

import { useState } from 'react';
import Link from 'next/link';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

// Custom SVG Illustration Component mimicking the "graduate holding diploma" style
const GraduateIllustration = () => (
  <svg viewBox="0 0 500 500" className="w-full h-auto max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="250" r="240" fill="#003366" /> {/* Darker blue background circle */}
    
    {/* Gown Body */}
    <path d="M150 480 L140 250 L180 200 L320 200 L360 250 L350 480 Z" fill="#60A5FA" /> {/* Light Blue Gown */}
    <path d="M250 200 L250 480" stroke="#3B82F6" strokeWidth="2" /> {/* Gown fold */}

    {/* Neck/Collar */}
    <path d="M180 200 L250 240 L320 200 Z" fill="#FF9F1C" /> {/* Orange sash/collar */}
    
    {/* Head */}
    <circle cx="250" cy="160" r="50" fill="#FDB" /> {/* Skin tone */}
    
    {/* Cap */}
    <path d="M190 130 L250 100 L310 130 L250 160 Z" fill="#60A5FA" /> {/* Light Blue Cap top */}
    <rect x="200" y="150" width="100" height="20" fill="#60A5FA" /> {/* Cap base */}
    <line x1="250" y1="130" x2="250" y2="130" stroke="#FF9F1C" strokeWidth="3" /> {/* Tassel start */}
    <path d="M250 130 Q280 130 280 180" stroke="#FF9F1C" strokeWidth="3" fill="none" /> {/* Tassel string */}
    <circle cx="280" cy="180" r="5" fill="#FF9F1C" /> {/* Tassel end */}

    {/* Face */}
    <circle cx="235" cy="155" r="3" fill="#002147" /> {/* Left Eye */}
    <circle cx="265" cy="155" r="3" fill="#002147" /> {/* Right Eye */}
    <path d="M235 170 Q250 180 265 170" stroke="#002147" strokeWidth="2" fill="none" /> {/* Smile */}

    {/* Arms holding diploma */}
    <path d="M140 250 Q120 350 180 320" stroke="#60A5FA" strokeWidth="30" fill="none" strokeLinecap="round" /> {/* Left Arm */}
    <path d="M360 250 Q380 300 320 280" stroke="#60A5FA" strokeWidth="30" fill="none" strokeLinecap="round" /> {/* Right Arm - raised */}

    {/* Diploma */}
    <rect x="290" y="240" width="80" height="20" transform="rotate(-20 330 250)" fill="#FFFFFF" stroke="#e2e8f0" strokeWidth="1" />
    <rect x="330" y="235" width="10" height="30" transform="rotate(-20 335 250)" fill="#FF9F1C" /> {/* Ribbon */}
    
    {/* Hand holding diploma */}
    <circle cx="320" cy="280" r="18" fill="#FDB" />

    {/* Graduation Confetti / Elements */}
    <circle cx="100" cy="100" r="10" fill="#4DA8DA" opacity="0.6" />
    <circle cx="400" cy="150" r="15" fill="#FF9F1C" opacity="0.6" />
    <rect x="80" y="300" width="10" height="10" fill="#FFFFFF" transform="rotate(45)" opacity="0.4" />
    <path d="M420 400 L430 420 L410 420 Z" fill="#4DA8DA" opacity="0.6" />

  </svg>
);


export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLogin = (e) => {
    if (e) e.preventDefault();
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = (e) => {
    if (e) e.preventDefault();
    setShowRegister(true);
    setShowLogin(false);
  };
  return (
    <div className="min-h-screen flex flex-col bg-[#002147] font-sans text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-[#002147]/5 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#002147]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#002147] tracking-tight">ASKmate</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-[#002147] hover:font-semibold transition-all">Features</a>
            <a href="#partners" className="hover:text-[#002147] hover:font-semibold transition-all">Partners</a>
            <a href="#resources" className="hover:text-[#002147] hover:font-semibold transition-all">Resources</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={openLogin}
              className="text-sm font-semibold text-[#002147] hover:text-blue-950 transition-colors px-4 py-2 cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={openRegister}
              className="text-sm font-bold text-white bg-[#FF9F1C] hover:bg-orange-600 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-[#002147]">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-100 mb-8 animate-[fadeInUp_1s_ease-out_forwards]">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF9F1C] mr-3 animate-pulse"></span>
                  #1 Platform for University Collaboration
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                  Elevate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DA8DA] to-blue-300">Academic Journey</span>
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Join a thriving community of scholars. Get instant answers, share resources, and connect with mentors to achieve your best results.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                  <button 
                    onClick={openRegister}
                    className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-[#FF9F1C] rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Start Learning Now
                  </button>
                  <button 
                    onClick={openLogin}
                    className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    View Demo
                  </button>
                </div>
                
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#002147] bg-gray-200 flex items-center justify-center overflow-hidden z-${10-i}`}>
                         <div className={`w-full h-full bg-gradient-to-br ${i%2===0 ? 'from-blue-200 to-blue-400' : 'from-orange-200 to-orange-400'}`}></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-blue-200">Trusted by 10,000+ students</p>
                </div>
              </div>

              {/* Illustration Content */}
              <div className="flex-1 w-full max-w-lg lg:max-w-xl relative">
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                    {/* USER: REPLACE THE URL BELOW WITH YOUR OWN IMAGE LINK */}
                    <img 
                      src="https://plus.unsplash.com/premium_vector-1720897415281-b821cc189ed1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JhZHVhdGlvbnxlbnwwfHwwfHx8MA%3D%3D" 
                      alt="Hero Illustration" 
                      className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10"
                    />
                </div>
                {/* Decorative blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/50 to-orange-100/50 rounded-full filter blur-3xl -z-10 opacity-60 animate-pulse"></div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#001835] relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent opacity-50"></div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose ASKmate?</h2>
              <p className="text-xl text-blue-200">Everything you need to succeed in your modules, all in one place. Designed by students, for students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  title: "Module-Specific Q&A",
                  desc: "Don't get lost in general threads. Ask questions tagged by your specific course modules for precise help.",
                  color: "bg-blue-100",
                  iconColor: "text-[#002147]",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )
                },
                {
                  title: "AI-Powered Assistance",
                  desc: "Get 24/7 instant feedback on your queries with our integrated AI, specifically trained on academic contexts.",
                  color: "bg-orange-100",
                  iconColor: "text-[#FF9F1C]",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  title: "Lecturer Verified",
                  desc: "Gain confidence in your answers with verification badges from lecturers and top-rated community helpers.",
                  color: "bg-sky-100",
                  iconColor: "text-[#4DA8DA]",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100 group">
                   <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.iconColor}`}>
                      {feature.icon}
                   </div>
                   <h3 className="text-2xl font-bold text-[#002147] mb-4">{feature.title}</h3>
                   <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles / Community Section */}
        <section className="py-24 bg-[#00152edd]">
           <div className="container mx-auto px-4 md:px-6">
              <div className="bg-blue-50 rounded-[3rem] p-8 md:p-20 relative overflow-hidden text-[#002147]">
                 {/* Decorative background circles */}
                 <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-40"></div>
                 <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-blue-200 opacity-20"></div>
                 
                 <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                       <h2 className="text-4xl md:text-5xl font-bold mb-8">Join the Ecosystem</h2>
                       <div className="space-y-8">
                          <div className="flex gap-6">
                             <div className="w-12 h-12 bg-[#FF9F1C] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">S</div>
                             <div>
                                <h3 className="text-2xl font-bold mb-2">For Students</h3>
                                <p className="text-gray-600">Access peer support, clarify doubts, and prepare for exams with confidence by leveraging community knowledge.</p>
                             </div>
                          </div>
                          <div className="flex gap-6">
                             <div className="w-12 h-12 bg-[#4DA8DA] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">L</div>
                             <div>
                                <h3 className="text-2xl font-bold mb-2">For Lecturers</h3>
                                <p className="text-gray-600">Gauge student understanding, address common misconceptions efficiently, and endorse high-quality answers.</p>
                             </div>
                          </div>
                       </div>
                       <div className="mt-12">
                          <Link href="/register" className="inline-block bg-[#002147] text-white font-bold px-10 py-4 rounded-full hover:bg-blue-900 transition-colors shadow-lg">
                             Become a Member
                          </Link>
                       </div>
                    </div>
                    
                    {/* Abstract visual for community */}
                    <div className="hidden md:block relative h-full min-h-[300px]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-64 bg-white shadow-xl rounded-2xl border border-blue-100 p-6 transform rotate-3 transition-transform hover:rotate-0 duration-500">
                                <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                                   <div className="w-10 h-10 rounded-full bg-[#FF9F1C] shadow-sm"></div>
                                   <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="space-y-3">
                                   <div className="h-3 w-full bg-gray-100 rounded"></div>
                                   <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                                   <div className="h-3 w-4/6 bg-gray-100 rounded"></div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                   <div className="h-8 w-20 bg-[#4DA8DA] rounded-full shadow-sm"></div>
                                   <div className="h-8 w-20 bg-blue-50 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 text-gray-600 border-t border-blue-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="col-span-1 md:col-span-1">
                <Link href="/" className="flex items-center space-x-2 mb-6">
                   <div className="w-8 h-8 bg-[#FF9F1C] rounded-lg flex items-center justify-center">
                     <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                     </svg>
                   </div>
                   <span className="text-2xl font-bold tracking-tight text-[#002147]">ASKmate</span>
                </Link>
                <p className="text-gray-500 mb-6">Empowering students to achieve academic excellence through collaboration.</p>
                <div className="flex space-x-4">
                   {[
                      { name: 'twitter', icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /> },
                      { name: 'facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
                      { name: 'instagram', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> },
                      { name: 'linkedin', icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></> }
                   ].map((social) => (
                      <a key={social.name} href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-[#FF9F1C] transition-colors group">
                         <span className="sr-only">{social.name}</span>
                         <svg className="w-5 h-5 text-[#002147] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {social.icon}
                         </svg>
                      </a>
                   ))}
                </div>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-6 text-[#002147]">Platform</h4>
                <ul className="space-y-4 text-gray-500">
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Browse Modules</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Ask a Question</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Resource Library</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">AI Tutor</a></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-6 text-[#002147]">Company</h4>
                <ul className="space-y-4 text-gray-500">
                   <li><a href="#" className="hover:text-[#002147] transition-colors">About Us</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Careers</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Blog</a></li>
                   <li><a href="#" className="hover:text-[#002147] transition-colors">Contact</a></li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-lg mb-6 text-[#002147]">Stay Updated</h4>
                <p className="text-gray-500 mb-4">Subscribe to our newsletter for the latest academic tips.</p>
                <form className="flex">
                   <input type="email" placeholder="Enter your email" className="bg-blue-50 border-none outline-none text-gray-800 placeholder-gray-400 px-4 py-3 rounded-l-lg w-full focus:ring-1 focus:ring-[#FF9F1C]" />
                   <button className="bg-[#FF9F1C] px-6 py-3 rounded-r-lg font-bold text-white hover:bg-orange-600 transition-colors">Go</button>
                </form>
             </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
             <p>© {new Date().getFullYear()} ASKmate. All rights reserved.</p>
             <div className="flex space-x-8 mt-4 md:mt-0">
                <a href="#" className="hover:text-[#002147]">Privacy Policy</a>
                <a href="#" className="hover:text-[#002147]">Terms of Service</a>
                <a href="#" className="hover:text-[#002147]">Cookie Settings</a>
             </div>
          </div>
        </div>
      </footer>

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm 
          onSuccess={() => setShowLogin(false)} 
          onSwitchToRegister={openRegister}
        />
      </Modal>

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)}>
        <RegisterForm 
          onSuccess={() => setShowRegister(false)} 
          onSwitchToLogin={openLogin}
        />
      </Modal>
    </div>
  );
}
