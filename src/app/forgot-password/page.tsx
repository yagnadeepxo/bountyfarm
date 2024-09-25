'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed
import Head from 'next/head';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/update-password', // Redirect after they click on the email link
      });

      if (error) {
        throw error;
      }

      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      setError('Error sending password reset email: ' + error.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Forgotten Password</title>
      </Head>

      <h1>Forgotten Password</h1>

      <form onSubmit={handleResetPassword}>
        <label>
          Enter your email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Send Reset Link</button>
      </form>

      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default RequestPasswordReset;
