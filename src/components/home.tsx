'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';


const GigsPage = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');

  if(!token) {
    router.push('/login')
  }

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        // Fetch gigs with company info and avatar_url from profiles
        const { data, error } = await supabase
          .from('gigs')
          .select(`
            gigid, 
            company, 
            title, 
            total_bounty, 
            deadline,
            business ( avatar_url )
          `); // Fetch relevant columns with the related profile (business)

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Gigs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <div
            key={gig.gigid}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition duration-300"
            onClick={() => router.push(`/gig/${gig.gigid}`)} // Navigate to /gig/[gigid]
          >
            {/* Display avatar image */}
            <div className="flex items-center mb-4">
              <img
                src={
                  gig.business?.avatar_url
                    ? `${supabaseUrl}/storage/v1/object/public/avatars/${gig.business.avatar_url}`
                    : '/bp.jpeg' // Fallback to default image if no avatar
                }
                alt="Company Avatar"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold">{gig.title}</h2>
                <p className="text-gray-600">{gig.company}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-2">Total Bounty: ${gig.total_bounty}</p>
            <p className="text-gray-600">Deadline: {new Date(gig.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GigsPage;
