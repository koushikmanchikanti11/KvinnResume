import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  const { messages } = await request.json();
  // TODO: Implement cover letter generation logic
  return NextResponse.json({ messages });
}