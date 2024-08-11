'use client';

import { useState } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<string>('facebook');
  const socialMediaOptions = ['threads', 'facebook', 'twitter', 'instagram', 'linkedin', 'medium', 'limo', 'mastodon', 'lens'];
  const [serverMessage, setServerMessage] = useState<string | null>(null); // To store server response message
  const [serverOtp, setServerOtp] = useState<string | null>(null); // To store server OTP

  const {
    isAuthenticated,
    profile: { username, fid },
  } = useProfile();

  const handleSocialMediaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSocialMedia(event.target.value);
    console.log('Selected Social Media:', event.target.value);
  };

  const handleRequestVerification = async () => {
    try {
      const res = await fetch('/api/requestVerification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pshandle: username ?? '', // Provide a default empty string if username is undefined
          socialMedia: selectedSocialMedia,
          otp: 'yourGeneratedOtp', // Replace with your logic to generate OTP
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        console.log('Verification requested successfully:', data);
        setServerMessage(data.message); // Set the message from the server
        setServerOtp(data.otp); // Set the OTP from the server
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const [response, setResponse] = useState<{
    socialMediaAccountId: string;
    username: string;
    otp: string;
    summary: string;
    socialMediaPlatform: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async () => {
    setError(null);
    setResponse(null); // Clear previous response

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!username) {
      setError('Username is not available.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('pshandle', username); // Ensure username is not undefined

    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data && typeof data === 'object') {
        setResponse(data);

        // let ass = await createAttestation(username, data.socialMediaPlatform.toLowerCase(), data.socialMediaAccountId);
        // await completeVerification(username, data.socialMediaPlatform.toLowerCase(), data.otp, data.socialMediaAccountId, ass);
        // console.log("now try to make attestation and complete verification with data ", data);

      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while uploading the file.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg mt-10" >
      <h1 
      className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400"
     >
        SuperGraph Network .SP verification portal
      </h1>

      <div className="text-black mb-4">
        {!isAuthenticated && "Login with Farcaster to link social media"}
      </div>

      <SignInButton />

      {isAuthenticated && (
        <div style={{ marginTop: '10px' }}>
          <section id="generate OTP" className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Link Social Media</h3>
            <select
              value={selectedSocialMedia}
              onChange={handleSocialMediaChange}
              className="border border-gray-300 text-gray-800 p-2 mb-4 w-full rounded-lg"
            >
              {socialMediaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              className="w-full py-2 px-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-teal-400 transition-all"
              onClick={handleRequestVerification}
            >
              Generate OTP
            </button>
          </section>

          {serverMessage && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg" >
              <h3 className="text-lg font-semibold text-green-800">Message from Server:</h3>
              <p className="text-green-700" style={{overflowX:"scroll"}} >{serverMessage}</p>
              {serverOtp && (
                <>
                  <h3 className="text-lg font-semibold text-green-800">OTP:</h3>
                  <p className="text-green-700">{serverOtp}</p>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-center mb-6">
            <span className="text-gray-500">then</span>
          </div>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="mb-6"
          />
          <button
            onClick={handleFileUpload}
            className="w-full py-3 px-4 mb-6 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-teal-400 transition-all"
          >
            Get OTP from image
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {response && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Social Media Account ID:</h2>
          <p className="text-gray-700">{response.socialMediaAccountId}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">Username:</h3>
          <p className="text-gray-700">{response.username}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">Social Media Platform :</h3>
          <p className="text-gray-700">{response.socialMediaPlatform}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">OTP:</h3>
          <p className="text-gray-700">{response.otp}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">Summary:</h3>
          <p className="text-gray-700">{response.summary}</p>
        </div>
      )}

      <div className="flex items-center justify-center mt-10">
        <button
          className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed transition-all"
          disabled
        >
          Add Attestation (Coming soon)
        </button>
      </div>
    </div>
  );
}
