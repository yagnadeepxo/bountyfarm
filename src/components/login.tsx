import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');
    let json: any;
    if (token) {
      json = JSON.parse(token);
      if (json.user?.user_metadata?.role === 'business') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      const userRole = data.user.user_metadata.role;
      
      if (userRole === 'business') {
        router.push('/dashboard');
      } else if (userRole === 'freelancer') {
        router.push('/');
      } else {
        setMessage('Invalid user role');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: any) => {
    if (error.message === 'Failed to fetch') {
      setMessage('Failed to fetch. Please check your network connection.');
    } else {
      setMessage(error.error_description || error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-mono">
      <div className="mb-8 text-center w-full max-w-2xl px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 relative h-16 overflow">
          <span className="animated-text absolute w-full left-0 right-0">
            <span className="block">
              <span className="inline-block animate-word">Business:</span>{' '}
              <span className="inline-block animate-word">Post</span>{' '}
              <span className="inline-block animate-word">Gigs,</span>{' '}
              <span className="inline-block animate-word">Onboard</span>{' '}
              <span className="inline-block animate-word">users!</span>
            </span>
          </span>
          <span className="animated-text absolute w-full left-0 right-0">
            <span className="block">
              <span className="inline-block animate-word">Freelancers:</span>{' '}
              <span className="inline-block animate-word">Contribute,</span>{' '}
              <span className="inline-block animate-word">Earn</span>{' '}
              <span className="inline-block animate-word">Crypto!</span>
            </span>
          </span>
        </h1>
      </div>
      
      <div className="bg-white shadow-2xl rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Login / Sign In</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-black rounded bg-white text-black"
            />
          </div>
          <div>
            <label className="block mb-1 text-black">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-black rounded bg-white text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-blue-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <button onClick={handleLogin} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
              Log In
            </button>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-500 hover:text-blue-700">
              Register
            </a>
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            <a href="/forgot-password" className="text-blue-500 hover:text-blue-700">
              Forgot Password?
            </a>
          </p>
        </div>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
      
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 45%, 100% { opacity: 0; transform: translateY(20px); }
          5%, 40% { opacity: 1; transform: translateY(0); }
        }

        @keyframes wordAppear {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animated-text {
          animation: fadeInOut 10s infinite;
        }

        .animated-text:nth-child(2) {
          animation-delay: 5s;
        }

        .animate-word {
          opacity: 0;
          animation: wordAppear 0.5s forwards;
        }

        .animated-text:first-child .animate-word:nth-child(1) { animation-delay: 0.2s; }
        .animated-text:first-child .animate-word:nth-child(2) { animation-delay: 0.4s; }
        .animated-text:first-child .animate-word:nth-child(3) { animation-delay: 0.6s; }
        .animated-text:first-child .animate-word:nth-child(4) { animation-delay: 0.8s; }
        .animated-text:first-child .animate-word:nth-child(5) { animation-delay: 1s; }

        .animated-text:nth-child(2) .animate-word:nth-child(1) { animation-delay: 5.2s; }
        .animated-text:nth-child(2) .animate-word:nth-child(2) { animation-delay: 5.4s; }
        .animated-text:nth-child(2) .animate-word:nth-child(3) { animation-delay: 5.6s; }
        .animated-text:nth-child(2) .animate-word:nth-child(4) { animation-delay: 5.8s; }
      `}</style>
    </div>
  );
};

export default LoginPage;