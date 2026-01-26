import { NextRequest, NextResponse } from 'next/server';
import { ThreadRepository } from '@/lib/db/repositories';

export async function GET() {
  try {
    const repo = new ThreadRepository();
    const threads = await repo.findAll();
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const repo = new ThreadRepository();
    const thread = await repo.create(title);

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

