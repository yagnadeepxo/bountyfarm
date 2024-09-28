'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'
import Chat from '@/components/chat'
import Modal from 'react-modal'
import Image from 'next/image'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import Head from 'next/head'

interface Gig {
  gigid: string
  company: string
  title: string
  description: string
  deadline: string
  total_bounty: number
  bounty_breakdown: { place: number; amount: number }[]
  skills_required: string
  created_at: string
  updated_at: string
  business: string
  type: string
  winners_announced: boolean,
  contact_info: string
}

interface BusinessProfile {
  avatar_url: string | null
}

interface Winner {
  username: string
  position: {
    place: number
    amount: number
  }
}

export default function GigPage() {
  const params = useParams()
  const gigId = params.gigId as string
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submissionLink, setSubmissionLink] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isPastDeadline, setIsPastDeadline] = useState(false)
  const [isSubmissionChecked, setIsSubmissionChecked] = useState(false) // Added state for checkbox
  const [winners, setWinners] = useState<Winner[]>([])
  const [winnersAnnounced, setWinnersAnnounced] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    const fetchGigData = async () => {
      if (!gigId) return
      setLoading(true)
      try {
        // Fetch the gig data
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select('*')
          .eq('gigid', gigId)
          .single()
        if (gigError) throw gigError
        setGig(gigData)

        const currentDate = new Date()
        const gigDeadline = new Date(gigData.deadline)
        if (currentDate > gigDeadline) {
          setIsPastDeadline(true)
        }

        // Check if winners are announced
        if (gigData.winners_announced) {
          setWinnersAnnounced(true)

          // Fetch winners
          const { data: winnersData, error: winnersError } = await supabase
            .from('winners')
            .select('*')
            .eq('gigid', gigId)

          if (winnersError) throw winnersError
          setWinners(winnersData)
        }

        // Fetch business profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', gigData.business)
          .single()
        if (profileError) throw profileError
        setBusinessProfile(profileData)
      } catch (err: any) {
        setError('Failed to fetch gig: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGigData()
  }, [gigId])

  useEffect(() => {
    const checkUserSubmission = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        return;
      }
  
      if (session) {
        const username = session.user?.user_metadata?.username;
        const role = session.user?.user_metadata?.role;
        setRole(role);
        setUsername(username);
  
        if (username && gigId) {
          const { data: submissions, error } = await supabase
            .from('submissions')
            .select('username')
            .eq('gigid', gigId)
            .eq('username', username);
  
          if (error) {
            console.error('Error checking submissions:', error.message);
          }
  
          if (submissions && submissions.length > 0) {
            setHasSubmitted(true);
          }
        }
      }
    };
  
    checkUserSubmission();
  }, [gigId]);
  

  const handleSubmit = async () => {
    if (!submissionLink || !walletAddress) {
      alert('Please fill in all fields.');
      return;
    }
  
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError) {
        throw new Error('Failed to retrieve session: ' + sessionError.message);
      }
  
      if (!session) {
        throw new Error('No active session found');
      }
  
      const email = session.user?.user_metadata?.email;
  
      const { error } = await supabase.from('submissions').insert([
        {
          gigid: gigId,
          username: username,
          company_name: gig?.company,
          submission_link: submissionLink,
          wallet_address: walletAddress,
          email: email,
        },
      ]);
  
      if (error) {
        throw error;
      }
  
      alert('Submission successful!');
      setShowModal(false);
      setHasSubmitted(true);
    } catch (err: any) {
      alert('Failed to submit: ' + err.message);
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-mono">
        <p className="text-black">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-mono">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-mono">
        <p className="text-black">No gig found with this ID.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 font-mono p-4">

<Head>
  <title>{gig.title} - {gig.company}</title>
  <meta name="description" content={`${gig.description} - ${gig.company}`} />
  
  {/* Open Graph meta tags */}
  <meta property="og:title" content={`${gig.title} - ${gig.company}`} />
  <meta property="og:description" content={`${gig.description} - ${gig.company}`} />
  <meta property="og:image" content={
    businessProfile?.avatar_url
      ? `${supabaseUrl}/storage/v1/object/public/avatars/${businessProfile.avatar_url}`
      : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
  } />
  <meta property="og:url" content={`https://gwei-beta.vercel.app/gig/${gigId}`} />
  <meta property="og:type" content="website" />
  
  {/* Twitter Card meta tags */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@bountyfarmxyz" />
  <meta name="twitter:creator" content="@bountyfarmxyz" />
  <meta name="twitter:title" content={`${gig.title} - ${gig.company}`} />
  <meta name="twitter:description" content={`${gig.description} - ${gig.company}`} />
  <meta name="twitter:image" content={
    businessProfile?.avatar_url
      ? `${supabaseUrl}/storage/v1/object/public/avatars/${businessProfile.avatar_url}`
      : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
  } />
  <meta name="twitter:image:alt" content={`${gig.company} logo`} />
  <meta name="twitter:url" content={`https://gwei-beta.vercel.app/gig/${gigId}`} />
  <meta name="twitter:domain" content="gwei-beta.vercel.app" />

  {/* Additional meta tags */}
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href={`https://gwei-beta.vercel.app/gig/${gigId}`} />
</Head>
      
      <div className="max-w-full mx-auto h-screen flex flex-col">
        <h1 className="text-3xl font-bold mb-4 text-black text-center">Gig Details</h1>
        <div className="flex flex-grow overflow-hidden">
          {/* Gig Details - Left Side */}
          <div className="w-1/2 bg-white shadow-2xl rounded-lg p-4 overflow-y-auto mr-2">
            <div className="flex items-center mb-4">
              <Image
                src={
                  businessProfile?.avatar_url
                    ? `${supabaseUrl}/storage/v1/object/public/avatars/${businessProfile.avatar_url}`
                    : `${supabaseUrl}/storage/v1/object/public/avatars/bp.jpeg`
                }
                alt="Business Avatar"
                width={64}
                height={64}
                className="rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold text-black">{gig?.title}</h2>
                <p className="text-gray-700 text-sm">{gig?.company}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* First Row: Deadline and Bounty Information */}
              <div className="flex justify-between">
                {/* Deadline */}
                <div>
                  <h3 className="text-lg font-semibold text-black">Deadline</h3>
                  <p className="text-gray-700 text-sm">{new Date(gig.deadline).toLocaleDateString()}</p>
                  {isPastDeadline && (
                    <p className="text-red-500 text-xs mt-1">The deadline for this gig has passed.</p>
                  )}
                </div>

                {/* Total Bounty */}
                <div>
                  <h3 className="text-lg font-semibold text-black">Total Bounty</h3>
                  <p className="text-gray-700 text-sm">${gig.total_bounty}</p>
                  <br />
                  <strong className="text-gray-700 text-sm">Type: {gig.type}</strong>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-black">Contact Info</h3>
                  <p className="text-gray-700 text-sm">{gig.contact_info}</p>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h3 className="text-xl font-semibold text-black">Description</h3>
                <div className="text-gray-700 text-sm">
                  <ReactQuill value={gig.description} readOnly={true} theme="bubble" />
                </div>
              </div>


              <div>
                <h3 className="text-lg font-semibold text-black">Bounty Breakdown</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {gig.bounty_breakdown.map((prize, index) => (
                    <li key={index}>
                      Place {prize.place}: ${prize.amount}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black">Skills Required</h3>
                <p className="text-gray-700 text-sm">{gig.skills_required}</p>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <p>Created: {new Date(gig.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Show winners if announced */}
            {winnersAnnounced && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-black">Winners</h3>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {winners.map((winner, index) => (
                    <li key={index}>
                      {winner.username}: Place {winner.position.place}, ${winner.position.amount}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submission Button */}
            {role !== 'business' && !isPastDeadline && !winnersAnnounced && (
              <div className="mt-4">
                {hasSubmitted ? (
                  <p className="text-green-500 text-sm">You have submitted your work.</p>
                ) : (
                  <button
                    className="w-full bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                    onClick={() => setShowModal(true)}
                  >
                    Submit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat - Right Side */}
          <div className="w-1/2 ml-2">
            <Chat gigId={String(gigId)} />
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl mx-auto mt-10 w-11/12"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-2xl font-semibold mb-6 text-black font-mono">Submit Your Work</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-base mb-2 font-mono">Submission Link</label>
              <input
                type="text"
                className="border border-black p-3 w-full text-base rounded-md font-mono"
                placeholder="Link to your submission as specified in gig"
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-base mb-2 font-mono">Wallet Address</label>
              <input
                type="text"
                className="border border-black p-3 w-full text-base rounded-md font-mono"
                placeholder="Wallet address of the blockchain/L2 specified in the gig"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="submission-checkbox"
                checked={isSubmissionChecked}
                onChange={(e) => setIsSubmissionChecked(e.target.checked)}
                className="form-checkbox h-5 w-5 text-gray-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="submission-checkbox" className="block text-gray-800 sm:text-sm font-mono">
                Review carefully, submission cannot be revoked or edited.
              </label>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-black text-white px-6 py-3 rounded-md text-base font-medium hover:bg-gray-800 transition-colors font-mono"
                onClick={handleSubmit}
                disabled={!isSubmissionChecked}
              >
                Submit
              </button>
              <button
                className="bg-gray-300 text-black px-6 py-3 rounded-md text-base font-medium hover:bg-gray-400 transition-colors font-mono"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
