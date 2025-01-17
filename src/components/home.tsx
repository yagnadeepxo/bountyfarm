'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { differenceInDays } from 'date-fns';

const GigsPage = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('latest');
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;


  useEffect(() => {
    const checkSession = async () => {
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const { data, error } = await supabase
          .from('gigs')
          .select(`
            gigid, 
            company,
            username, 
            title, 
            total_bounty, 
            deadline,
            type,
            business ( avatar_url )
          `)
          .order('deadline', { ascending: false }); // Order by deadline in descending order

        if (error) throw error;

        setGigs(data);
        setFilteredGigs(data); // Set initial filtered gigs to the full data
      } catch (error: any) {
        setError('Failed to fetch gigs: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  useEffect(() => {
    // Filtering logic based on the filter state
    let filtered = [...gigs];
    if (filter === 'grant') {
      filtered = gigs.filter(gig => gig.type === 'grant');
    } else if (filter === 'bounty') {
      filtered = gigs.filter(gig => gig.type === 'bounty');
    } else if (filter === 'oldest') {
      filtered = gigs.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()); // Latest first
    } else if (filter === 'latest') {
      filtered = gigs.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()); // Oldest first
    }
    setFilteredGigs(filtered);
  }, [filter, gigs]);

  if (loading) return <p>Loading gigs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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

        {/* Filter Buttons */}
        <div className="flex justify-center mb-6 space-x-4">
  <button
    onClick={() => setFilter('latest')}
    className={`px-4 py-2 rounded-lg ${filter === 'latest' ? 'bg-black text-white' : 'bg-gray text-black'}`}
  >
    Latest
  </button>
  <button
    onClick={() => setFilter('oldest')}
    className={`px-4 py-2 rounded-lg ${filter === 'oldest' ? 'bg-black text-white' : 'bg-gray text-black'}`}
  >
    Oldest
  </button>
  <button
    onClick={() => setFilter('grant')}
    className={`px-4 py-2 rounded-lg ${filter === 'grant' ? 'bg-black text-white' : 'bg-gray text-black'}`}
  >
    Grant
  </button>
  <button
    onClick={() => setFilter('bounty')}
    className={`px-4 py-2 rounded-lg ${filter === 'bounty' ? 'bg-black text-white' : 'bg-gray text-black'}`}
  >
    Bounty
  </button>
</div>
{filteredGigs.length === 0 ? (
          <p className="text-black text-center">No gigs found.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredGigs.map((gig) => (
              <li key={gig.gigid} className="bg-white shadow-lg rounded-lg p-6">
                <Link href={`/gig/${gig.gigid}`} className="block">
                  <div className="cursor-pointer">
                    <div className="flex items-start mb-4">
                      <Image
                        src={
                          gig.business?.avatar_url
                            ? `${supabaseUrl}/storage/v1/object/public/avatars/${gig.business.avatar_url}`
                            : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
                        }
                        alt="Company Avatar"
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <p className="text-black font-bold">{gig.company}</p>
                        <Link href={`/p/${gig.username}`}>
                          <p className="text-gray-600 text-sm hover:underline">@{gig.username}</p>
                        </Link>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-black mb-4 truncate">
                      <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
                        {gig.title}
                      </span>
                    </h2>
                    <p className="text-black mb-2">
                      Due in: 
                      <strong className="text-black font-bold ml-1">
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
