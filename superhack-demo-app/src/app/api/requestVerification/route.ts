import { NextRequest, NextResponse } from 'next/server';
import { checkVerification, completeVerification, requestVerification } from '../lib/contractOperations';
import { createAttestation } from '../lib/createAss';
import { ethers } from 'ethers'
// Define a named export for the POST method
export async function POST(req: NextRequest) {
    try {
        console.log("work");

        // Parse the request body to get parameters
        const { pshandle, socialMedia, otp } = await req.json();
        console.log(pshandle, socialMedia, otp);

        const profile = await checkVerification(pshandle);
        console.log('Profile:', profile);

        const x = true
        // Assuming if no profile, then create for user PS handler + add his farcaster profile 
        if (x) {
            // console.log("no profile!");

            // const reqVerfication = await requestVerification("pshandle", "farcaster", otp)
            // console.log(reqVerfication);

            // const ass = await createAttestation("pshandle", "farcaster", otp)
            // console.log("Ass!!", ass);

            // const completed = await completeVerification("pshandle", 'farcaster', otp, "pshandle", ass)

            // console.log("completed", completed, completed?.success, completed?.txn);
            // // return NextResponse.json(
            // //     { success: true, error: 'User wasnt signed up using Farcaster, but now he is so try again' },
            // //     { status: 400 }
            // // );
            return NextResponse.json({ success: true, profile: pshandle });

        }
        else {
            // Proceed to request verification if the check was successful
            // const result = await requestVerification(pshandle, socialMedia, otp);
            // console.log("result", result);
            return NextResponse.json({ success: true, profile: pshandle });
        }


    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
