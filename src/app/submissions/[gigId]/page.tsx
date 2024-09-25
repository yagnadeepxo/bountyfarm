'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Modal from 'react-modal'; // Modal package for the modal

import { useRouter } from 'next/router';

const SubmissionsPage = () => {
  const params = useParams();
  const gigId = params.gigId;
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal open/close
  const [winners, setWinners] = useState<any[]>([]); // State for storing winner details
  const [bountyBreakdown, setBountyBreakdown] = useState<any[]>([]); // State for bounty breakdown
  const [winnersAnnounced, setWinnersAnnounced] = useState(false); // State to check if winners are already announced

  
  const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token');
  let json: any
  if(token){
    json = JSON.parse(token)
    if(json.user?.user_metadata?.role == 'freelancer') {
        alert('permission denied')
    }
  }

  useEffect(() => {
    const fetchSubmissionsAndWinners = async () => {
      if (!gigId) return;

      setLoading(true);
      try {
        // Fetch the submissions related to the specific gigId
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('username, submission_link, wallet_address')
          .eq('gigid', gigId);

        if (submissionError) {
          throw submissionError;
        }
        setSubmissions(submissionData);

        // Fetch the gig data to get the bounty breakdown
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select('bounty_breakdown')
          .eq('gigid', gigId)
          .single();

        if (gigError) {
          throw gigError;
        }
        setBountyBreakdown(gigData.bounty_breakdown);

        // Check if winners have been announced
        const { data: winnersData, error: winnersError } = await supabase
          .from('winners')
          .select('*')
          .eq('gigid', gigId);

        if (winnersError) {
          throw winnersError;
        }

        if (winnersData && winnersData.length > 0) {
          setWinners(winnersData);
          setWinnersAnnounced(true); 
        }
      } catch (error: any) {
        setError('Failed to fetch data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionsAndWinners();
  }, [gigId]);

  // Handle the form submission for winners
  const announceWinners = async () => {
    try {
      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];
        await supabase.from('winners').insert({
          gigid: gigId,
          username: winner.username,
          position: {
            place: winner.place,
            amount: winner.amount,
          },
        });
      }

      alert('Winners announced successfully!');
      setModalIsOpen(false); // Close the modal
      setWinnersAnnounced(true); // Mark as winners already announced
    } catch (error: any) {
      alert('Error announcing winners: ' + error.message);
    }
  };

  if (loading) {
    return <p>Loading submissions...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (submissions.length === 0) {
    return <p>No submissions found for this gig.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Submissions for Gig {gigId}</h1>

      <ul className="space-y-4">
        {submissions.map((submission, index) => (
          <li key={index} className="border p-4 rounded-lg shadow">
            <p className="text-xl font-semibold">Submission Link:</p>
            <a href={submission.submission_link} className="text-blue-500" target="_blank" rel="noopener noreferrer">
              {submission.submission_link}
            </a>

            <p className="mt-4 text-xl font-semibold">Username:</p>
            <p>{submission.username}</p>

            <p className="mt-4 text-xl font-semibold">Wallet Address:</p>
            <p>{submission.wallet_address}</p>
          </li>
        ))}
      </ul>

      {/* Conditionally show the "Winners Announced" message or "Announce Winners" button */}
      {winnersAnnounced ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Winners Announced</h2>
          <ul className="space-y-4">
            {winners.map((winner, index) => (
              <li key={index} className="border p-4 rounded-lg shadow">
                <p className="text-xl font-semibold">Place: {winner.position.place}</p>
                <p>Username: {winner.username}</p>
                <p>Prize: ${winner.position.amount}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          {/* Button to open the modal */}
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mt-8"
            onClick={() => setModalIsOpen(true)}
          >
            Announce Winners
          </button>

          {/* Modal for announcing winners */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Announce Winners Modal"
            className="modal"
            overlayClassName="modal-overlay"
          >
            <h2 className="text-2xl font-bold mb-4">Announce Winners</h2>

            <form onSubmit={(e) => e.preventDefault()}>
              {bountyBreakdown.map((prize, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold">Place {prize.place}</h3>
                  <input
                    type="text"
                    className="border rounded w-full p-2"
                    placeholder={`Enter username for place ${prize.place}`}
                    onChange={(e) => {
                      const updatedWinners = [...winners];
                      updatedWinners[index] = {
                        ...updatedWinners[index],
                        username: e.target.value,
                        place: prize.place,
                        amount: prize.amount,
                      };
                      setWinners(updatedWinners);
                    }}
                  />
                  <p>Prize: ${prize.amount}</p>
                </div>
              ))}

              <button
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={announceWinners}
              >
                Submit Winners
              </button>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
