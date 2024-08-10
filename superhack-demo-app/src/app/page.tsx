'use client';

import { useState } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [response, setResponse] = useState<{
    socialMediaAccountId: string;
    username: string;
    otp: string;
    summary: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);


  const {
    isAuthenticated,
    profile: { username, fid },
  } = useProfile();


  const handleTextInput = async () => {
    setError(null);
    setResponse(null); // Clear previous response
    try {
      const res = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data && typeof data === 'object') {
        setResponse(data);
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while pinging the server.');
    }
  };

  const handleFileUpload = async () => {
    setError(null);
    setResponse(null); // Clear previous response

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

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
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while uploading the file.');
    }
  };


  return (

    <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
        Social Network .SP verfication portal
      </h1>

      <div > {!isAuthenticated &&
        <div >
          <p style={{ color: 'black', margin: "25px" }}> Login with Farcaster to link social media  </p>
     <SignInButton />
        </div>}
      </div>



      {isAuthenticated &&
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border border-gray-300 p-3 mb-6 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 black"
            placeholder="Enter something..."
          />
          <button
            onClick={handleTextInput}
            className="w-full py-3 px-4 mb-6 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-teal-400 transition-all"
          >
            Provide post Url / Auto detect - coming soon
          </button>

          <div className="flex items-center justify-center mb-6">
            <span className="text-gray-500">or</span>
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
      }





















      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}






      {response && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Social Media Account ID:</h2>
          <p className="text-gray-700">{response.socialMediaAccountId}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">Username:</h3>
          <p className="text-gray-700">{response.username}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">OTP:</h3>
          <p className="text-gray-700">{response.otp}</p>
          <h3 className="text-lg font-semibold mt-4 text-gray-800">Summary:</h3>
          <p className="text-gray-700">{response.summary}</p>
        </div>
      )}

      {/* New button indicating a coming soon feature */}
      <div className="flex items-center justify-center mt-10">
        <button
          className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed transition-all"
          disabled
        >
          Add Attestion (Coming soon)
        </button>
      </div>
    </div>
  );
}
