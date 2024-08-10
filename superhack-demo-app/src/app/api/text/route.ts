
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    // Construct the prompt for OpenAI
    const prompt = `
    You are an expert in scam detection. Analyze the following input to determine if it may be a phishing attempt, scam, or impersonation. Focus on identifying signs of deceit, impersonation, or other suspicious activities, and provide a clear verdict on its legitimacy. Use the names of companies and organizations mentioned in the input to make the response appear more trustworthy. use best practices to know if this is a scam or not. try to use as less words as possible

    Input: "${input}"

    The response should include:
    - Summary: Clearly state whether the input "looks safe" or "might be a scam".
    - Legitimacy Assessment: Brief explanation of why it appears safe or suspicious, using the names of companies or organizations mentioned in the input.
    - Potential Scam or Impersonation Indicators: List any elements or tactics that suggest the input could be part of a scam or impersonation attempt, formatted as a numbered list.
    - Recommended Actions: Provide a list of steps the user should take if the input is suspected to be fraudulent, including advice on how to verify authenticity and protect themselves from scams.

    Return the response as a JSON object with the following structure:
    {
      "summary": "looks safe" or "might be a scam",
      "legitimacyAssessment": "Brief explanation.",
      "potentialScamIndicators": ["List of potential scam or impersonation indicators."],
      "recommendedActions": ["List of recommended actions to take."]
    }`
      ;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant providing structured analyses.' },
        { role: 'user', content: prompt },
      ],
    });

    // Extract the response content and parse it as JSON
    const chatGptResponse = response.choices[0].message?.content || '{}';
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(chatGptResponse.replace(/```json|```/g, ''))
    } catch (e) {
      console.error('Failed to parse JSON:', chatGptResponse);
      parsedResponse = {
        summary: "Failed to parse response.",
        legitimacyAssessment: "",
        potentialScamIndicators: [],
        recommendedActions: []
      };
    }

    console.log("prasedRes", parsedResponse);

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Something went wrong', error: error.message }, { status: 500 });
  }
}