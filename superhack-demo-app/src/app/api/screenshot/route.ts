// src/app/api/screenshot/route.ts

import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
});

// Function to encode the image to base64
const encodeToBase64 = async (buffer: Buffer): Promise<string> => {
  return buffer.toString('base64');
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' });
    }

    // Convert file to buffer and then to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = await encodeToBase64(buffer);

    // Construct the prompt for OpenAI
    const prompt = `
    You are an expert in analyzing images to extract relevant information. Analyze the following image to identify and extract the social media account ID, username, and any one-time password (OTP) mentioned in the text. Provide a clear and concise summary of the extracted information.

    The response should include:
    - Social Media Account ID: Extract and provide the account ID if visible.
    - Username: Extract and provide the username associated with the account.
    - One-Time Password (OTP): Extract and provide any OTP mentioned in the text.
    - Summary: Briefly describe any context or additional details that may be relevant.

    Return the response as a JSON object with the following structure:
    {
      "socialMediaAccountId": "Extracted account ID",
      "username": "Extracted username",
      "otp": "Extracted OTP",
      "summary": "Brief description of the context or additional details."
    }
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant extracting information from images.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
    });

    // Extract the response content and ensure it is in JSON format
    const chatGptResponse = response.choices[0].message?.content || '{}';

    let parsedResponse;
    try {
      // Attempt to extract JSON-like information from text
      const jsonStart = chatGptResponse.indexOf('{');
      const jsonEnd = chatGptResponse.lastIndexOf('}') + 1;
      const jsonString = chatGptResponse.slice(jsonStart, jsonEnd);

      parsedResponse = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON:', chatGptResponse);
      parsedResponse = {
        socialMediaAccountId: "Failed to parse response.",
        username: "",
        otp: "",
        summary: ""
      };
    }

    console.log(parsedResponse);

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Something went wrong', error: error.message }, { status: 500 });
  }
}
