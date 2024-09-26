'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { differenceInDays } from 'date-fns'; 

const GigsPage = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');

  if (!token) {
    router.push('/login');
  }

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        // Fetch gigs with company info and avatar_url from profiles, ordered by deadline (newest first)
        const { data, error } = await supabase
          .from('gigs')
          .select(`
            gigid, 
            company, 
            title, 
            total_bounty, 
            deadline,
            business ( avatar_url )
          `)
          .order('deadline', { ascending: true }); // Order by deadline in descending order

        if (error) throw error;

        setGigs(data);
      } catch (error: any) {
        setError('Failed to fetch gigs: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  if (loading) return <p>Loading gigs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Helper function to calculate remaining days
  const calculateDueInDays = (deadline: string) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    const daysDifference = differenceInDays(deadlineDate, currentDate);
    return daysDifference >= 0 ? `${daysDifference} days` : 'Expired';
  };

  return (
    <div className="min-h-screen bg-gray-100 font-mono p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black text-center">All Gigs</h1>

        {gigs.length === 0 ? (
          <p className="text-black text-center">No gigs found for your company.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {gigs.map((gig) => (
              <li key={gig.gigid} className="bg-white shadow-lg rounded-lg p-6">
                <Link href={`/gig/${gig.gigid}`} className="block">
                  <div className="cursor-pointer">
                    <h2 className="text-xl font-semibold text-black mb-4">{gig.title}</h2>
                    <p className="text-gray-600 font-medium mb-4">Company: {gig.company}</p>

                    <div className="flex items-center mb-4">
                      <Image
                        src={
                          gig.business?.avatar_url
                            ? `${supabaseUrl}/storage/v1/object/public/avatars/${gig.business.avatar_url}`
                            : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
                        }
                        alt="Company Avatar"
                        width={40}
                        height={40}
                        className="rounded-full mr-4"
                      />
                    </div>

                    <p className="text-black mb-4">
                      Due in: 
                      <strong className='text-black font-bold'>
                      {calculateDueInDays(gig.deadline)}
                      </strong>
                    </p>
                    <p className="text-black font-bold">Total Bounty: ${gig.total_bounty}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GigsPage;
