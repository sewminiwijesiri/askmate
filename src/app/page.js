
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <main className="flex flex-col items-center text-center space-y-8 max-w-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 pb-2">
            AskMate
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium">
            Your intelligent companion for answers and collaboration.
          </p>
          <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto">
            Join our community to ask questions, share knowledge, and connect with experts in real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center pt-8">
          <Link 
            href="/register" 
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg hover:shadow-indigo-500/30"
          >
            Get Started
            <svg 
              className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Features Preview (Optional - keeping it clean for now) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left w-full">
          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ask Questions</h3>
            <p className="text-sm text-gray-500">Get answers from the community quickly.</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Collaborate</h3>
            <p className="text-sm text-gray-500">Engage in discussions and share insights.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Find Solutions</h3>
            <p className="text-sm text-gray-500">Discover extensive knowledge base.</p>
          </div>
        </div>

      </main>
      
      {/* Footer / Copyright */}
      <footer className="absolute bottom-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AskMate. All rights reserved.
      </footer>
    </div>
  );
}
