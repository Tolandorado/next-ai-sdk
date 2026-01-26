import { NextRequest, NextResponse } from 'next/server';
import { MessageRepository } from '@/lib/db/repositories';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const repo = new MessageRepository();
    const messages = await repo.findByThreadId(threadId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

