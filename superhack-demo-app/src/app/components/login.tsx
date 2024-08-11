'use client';

import React from 'react';
import { SignInButton } from '@farcaster/auth-kit';

const SignInPage: React.FC = () => {
  return (
    <div className="sign-in-page">
      <h1>Sign In</h1>
      <SignInButton />
    </div>
  );
};

export default SignInPage;
