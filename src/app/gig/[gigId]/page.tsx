'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import Chat from '@/components/chat';
import Modal from 'react-modal'; // For the submission modal

// Dynamically import ReactQuill for WYSIWYG editor (client-side only)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';


const GigPage = () => {
  const params = useParams(); // Get dynamic route parameters
  const gigId = params.gigId; // Extract gigId from the URL
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [submissionLink, setSubmissionLink] = useState(''); // Submission link
  const [walletAddress, setWalletAddress] = useState(''); // Wallet address
  const [role, setRole] = useState<string | null>(null); // User role
  const [username, setUsername] = useState<string | null>(null); // Username
  const [hasSubmitted, setHasSubmitted] = useState(false); // Check if user has submitted
  const [isPastDeadline, setIsPastDeadline] = useState(false); // Check if deadline has passed

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // URL for Supabase storage

  // Fetch gig and user details
  useEffect(() => {
    const fetchGigData = async () => {
      if (!gigId) return;
      setLoading(true);
      try {
        // Fetch gig data
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select('*')
          .eq('gigid', gigId)
          .single();
        if (gigError) throw gigError;
        setGig(gigData);

        // Check deadline
        const currentDate = new Date();
        const gigDeadline = new Date(gigData.deadline);
        if (currentDate > gigDeadline) {
          setIsPastDeadline(true);
        }

        // Fetch business profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', gigData.business)
          .single();
        if (profileError) throw profileError;
        setBusinessProfile(profileData);
      } catch (err: any) {
        setError('Failed to fetch gig: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGigData();
  }, [gigId]);

  // Fetch user data and check if the user has already submitted
  let json: any
  useEffect(() => {
    const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');
    if (token) {
      json = JSON.parse(token);
      setRole(json?.user?.user_metadata?.role);
      setUsername(json?.user?.user_metadata?.username);

      const checkUserSubmission = async () => {
        if (json?.user?.user_metadata?.username && gigId) {
          const { data: submissions, error } = await supabase
            .from('submissions')
            .select('username')
            .eq('gigid', gigId)
            .eq('username', json?.user?.user_metadata?.username);

          if (error) {
            console.error('Error checking submissions:', error.message);
          }

          if (submissions && submissions.length > 0) {
            setHasSubmitted(true);
          }
        }
      };

      checkUserSubmission();
    }
  }, [gigId]);

  // Handle the submission modal
  const handleSubmit = async () => {
    if (!submissionLink || !walletAddress) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      let email = json.user?.user_metadata?.email
      const { error } = await supabase.from('submissions').insert([
        {
          gigid: gigId,
          username: username,
          company_name: gig.company,
          submission_link: submissionLink,
          wallet_address: walletAddress,
          email: json.user?.user_metadata?.email
        },
      ]);

      if (error) {
        throw error;
      }

      alert('Submission successful!');
      setShowModal(false); // Close modal after submission
      setHasSubmitted(true); // Mark user as submitted
    } catch (err: any) {
      alert('Failed to submit: ' + err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!gig) {
    return <p>No gig found with this ID.</p>;
  }

  // Render the gig details
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gig Details</h1>

      <div className="mb-4 flex items-center">
        <img
          src={
            businessProfile?.avatar_url
              ? `${supabaseUrl}/storage/v1/object/public/avatars/${businessProfile.avatar_url}`
              : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
          }
          alt="Business Avatar"
          className="w-12 h-12 rounded-full mr-4"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Company</h2>
        <p>{gig.company}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Title</h2>
        <p>{gig.title}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Description:</h2>
        <ReactQuill value={gig.description} readOnly={true} theme="bubble" />
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Deadline:</h2>
        <p>{gig.deadline}</p>
        {isPastDeadline && (
          <p className="text-red-500 mt-2">The deadline for this gig has passed.</p>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Total Bounty:</h2>
        <p>${gig.total_bounty}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Bounty Breakdown:</h2>
        <ul>
          {gig.bounty_breakdown.map((prize: any, index: number) => (
            <li key={index}>
              Place {prize.place}: ${prize.amount}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Skills Required:</h2>
        <p>{gig.skills_required}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Created At:</h2>
        <p>{new Date(gig.created_at).toLocaleDateString()}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Last Updated:</h2>
        <p>{new Date(gig.updated_at).toLocaleDateString()}</p>
      </div>

      {/* Conditionally show submit button if not business and within deadline */}
      {role !== 'business' && !isPastDeadline && (
        <div className="mb-4">
          {hasSubmitted ? (
            <p className="text-green-500">You have already submitted your work.</p>
          ) : (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(true)}
            >
              Submit
            </button>
          )}
        </div>
      )}

      {/* Chat Component */}
      <Chat gigId={String(gigId)} />

      {/* Submission Modal */}
      <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)}>
        <h2 className="text-xl font-semibold mb-4">Submit Your Work</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Submission Link</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Wallet Address</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          Submit
        </button>

        <button className="ml-4 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default GigPage;
