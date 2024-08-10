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

        // Assuming if no profile, then create for user PS handler + add his farcaster profile 
        if (!profile.isProfile) {
            console.log("no profile!");

            const reqVerfication = await requestVerification(pshandle, "farcaster", otp)
            console.log(reqVerfication);

            const ass = await createAttestation(pshandle, "farcaster", otp)
            console.log("Ass!!", ass);

            const completed = await completeVerification(pshandle, 'farcaster', otp, pshandle, ass)
            console.log(completed);
            return NextResponse.json({ success: true, message: "u were not registered, but you are! please generate a new OTP!" });
        }
        else {
            const reqVerfication = await requestVerification(pshandle, socialMedia, otp)
            console.log(reqVerfication);
            return NextResponse.json({ success: true, message: "Verfication requested ! please post the message in your social media" });
        }

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
