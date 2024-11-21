'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link from Next.js
import { supabase } from '@/lib/supabaseClient'; // Adjust the path as needed

const Navbar = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null); // State to hold user role
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling mobile menu

  useEffect(() => {
    // Fetch the current session and username from Supabase
    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUsername(session.user.user_metadata.username || 'profile');
        setIsLoggedIn(true);
        setRole(session.user.user_metadata.role || null); // Set role from user_metadata
      }
    };

    getUserData();

    // Listen for auth state changes to update navbar dynamically
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUsername(session.user.user_metadata.username || 'profile');
        setIsLoggedIn(true);
        setRole(session.user.user_metadata.role || null); // Update role on auth state change
      } else {
        setUsername(null);
        setIsLoggedIn(false);
        setRole(null); // Reset role when user logs out
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    } else {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="bg-white p-4 shadow-md flex justify-between items-center">
      {/* Left Section: Title */}
      <h1 className="text-3xl font-extrabold text-black font-mono">Bounty Farm 💰</h1>

      {/* Hamburger Icon for Mobile */}
      <div className="sm:hidden">
        <button
          className="text-black focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Right Section: Navigation Links */}
      <ul className={`flex-col sm:flex-row sm:flex space-x-8 font-mono ${isMenuOpen ? 'flex' : 'hidden'} sm:flex`}>
        {isLoggedIn ? (
          <>
            <li>
              <Link href="/" className="text-black font-bold underline">
                Home
              </Link>
            </li>
            {role === 'business' && ( // Conditionally render Dashboard link
              <li>
                <Link href="/dashboard" className="text-black font-bold underline">
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link href={`/p/${username}`} className="text-black font-bold underline">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="text-black font-bold underline">
                Leaderboard
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="text-black font-bold underline">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className="text-black font-bold underline">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-black font-bold underline">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
