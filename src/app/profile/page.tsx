'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import Head from 'next/head';
import 'dotenv/config';
require('dotenv').config();

interface Profile {
  id: string;
  username: string;
  role: string;
  about: string;
  avatar_url?: string;
  twitter_url?: string;
  github_url?: string;
  telegram_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

const ProfilePage: NextPage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');

    if (!token) {
      // Redirect to /login if no token is found
      router.push('/login');
    } else {
      const json = JSON.parse(token);

      const fetchProfile = async () => {
        try {
          setLoading(true);
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, role, about, avatar_url, twitter_url, github_url, telegram_url, website_url, created_at, updated_at')
            .eq('id', json.user.id)
            .single();

          if (error) {
            throw error;
          }
          setProfile(profileData);
        } catch (error: any) {
          setError('Error fetching profile: ' + error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [router]);

  // Sign-out functionality
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('sb-vldhwuxhpskjvcdbwrir-auth-token');
      router.push('/login');
    } catch (error: any) {
      setError('Error signing out: ' + error.message);
    }
  };

  // Default avatar URL
  const defaultAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/bp.jpeg`;

  return (
    <div>
      <Head>
        <title>User Profile</title>
      </Head>

      <h1>User Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : profile ? (
        <div>
          <h2>Profile Details:</h2>
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>About:</strong> {profile.about || 'N/A'}</p>
          <div>
            <strong>Avatar:</strong>
            <img
              src={profile.avatar_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : defaultAvatarUrl}
              alt="Avatar"
              width={50}
            />
          </div>
          <div>
            <h3>Social Links:</h3>
            {profile.twitter_url && <p><a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">Twitter</a></p>}
            {profile.github_url && <p><a href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
            {profile.telegram_url && <p><a href={profile.telegram_url} target="_blank" rel="noopener noreferrer">Telegram</a></p>}
            {profile.website_url && <p><a href={profile.website_url} target="_blank" rel="noopener noreferrer">Website</a></p>}
          </div>
          {/* Sign Out Button */}
          <button onClick={handleSignOut} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#f56565', color: 'white', border: 'none', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      ) : (
        <p>No profile found.</p>
      )}
    </div>
  );
};

export default ProfilePage;
