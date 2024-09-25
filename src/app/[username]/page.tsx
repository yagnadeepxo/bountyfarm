/*'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { NextPage } from 'next';
import Link from 'next/link';

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
  const [currentUser, setCurrentUser] = useState<string | null>(null); // State for logged-in user's username
  const params = useParams();
  const username = params.username as string;

  useEffect(() => {
    // Fetch current user's session
    const fetchCurrentUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        setError('Error fetching session: ' + error.message);
        return;
      }
      if (session && session.user) {
        setCurrentUser(session.user.user_metadata.username); // Assuming username is stored in user metadata
      }
    };

    fetchCurrentUser();

    if (username) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select(
              'id, username, role, about, avatar_url, twitter_url, github_url, telegram_url, website_url, created_at, updated_at'
            )
            .eq('username', username)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // This error code indicates no rows were returned
              setProfile(null);
            } else {
              throw error;
            }
          } else {
            setProfile(profileData);
          }
        } catch (error: any) {
          setError('Error fetching profile: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [username]);

  const defaultAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/bp.jpeg`;

  return (
    <div>
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
            {profile.twitter_url && (
              <p>
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </p>
            )}
            {profile.github_url && (
              <p>
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </p>
            )}
            {profile.telegram_url && (
              <p>
                <a href={profile.telegram_url} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </p>
            )}
            {profile.website_url && (
              <p>
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </p>
            )}
          </div>
          {currentUser === profile.username && (
            <Link href="/profile/update">
              <span
                style={{
                  color: '#3182ce',
                  textDecoration: 'underline',
                  marginTop: '20px',
                  display: 'inline-block',
                }}
              >
                Update Profile
              </span>
            </Link>
          )}
        </div>
      ) : (
        <p>No profile found.</p>
      )}
    </div>
  );
};

export default ProfilePage;
*/

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: string
  username: string
  role: string
  about: string
  avatar_url?: string
  twitter_url?: string
  github_url?: string
  telegram_url?: string
  website_url?: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setError('Error fetching session: ' + error.message)
        return
      }
      if (session && session.user) {
        setCurrentUser(session.user.user_metadata.username)
      }
    }

    fetchCurrentUser()

    if (username) {
      const fetchProfile = async () => {
        try {
          setLoading(true)
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, username, role, about, avatar_url, twitter_url, github_url, telegram_url, website_url, created_at, updated_at')
            .eq('username', username)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              setProfile(null)
            } else {
              throw error
            }
          } else {
            setProfile(profileData)
          }
        } catch (error: any) {
          setError('Error fetching profile: ' + error.message)
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }, [username])

  const defaultAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/bp.jpeg`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-mono p-4">
      <div className="bg-white shadow-2xl rounded-lg max-w-2xl w-full p-8">
        {loading ? (
          <p className="text-black">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : profile ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-black pb-2">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-black"><strong>Username:</strong> {profile.username}</p>
                <p className="text-black"><strong>Role:</strong> {profile.role}</p>
                <p className="text-black"><strong>About:</strong> {profile.about || 'N/A'}</p>
              </div>
              <div>
                <strong className="text-black">Avatar:</strong>
                <div className="mt-2">
                  <Image
                    src={profile.avatar_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : defaultAvatarUrl}
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="rounded-full border-2 border-black"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mt-4 mb-2">Social Links</h3>
              <div className="space-y-2">
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline block">
                    Twitter
                  </a>
                )}
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline block">
                    GitHub
                  </a>
                )}
                {profile.telegram_url && (
                  <a href={profile.telegram_url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline block">
                    Telegram
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline block">
                    Website
                  </a>
                )}
              </div>
            </div>
            {currentUser === profile.username && (
              <div className="mt-6">
                <Link href="/profile/update" className="text-black border-2 border-black py-2 px-4 rounded hover:bg-black hover:text-white transition-colors">
                  Update Profile
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="text-black">No profile found.</p>
        )}
      </div>
    </div>
  )
}
