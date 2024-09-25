'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setMessage('Password updated successfully! You will be redirected to the login page.');
      
      // Redirect after password update
      setTimeout(() => {
        router.push('/login');
      }, 3000); // 3 seconds delay before redirecting
    } catch (error: any) {
      setError('Error updating password: ' + error.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Update Password</title>
      </Head>

      <h1>Update Password</h1>

      <form onSubmit={handleUpdatePassword}>
        <label>
          Enter your new password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Update Password</button>
      </form>

      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default UpdatePassword;
