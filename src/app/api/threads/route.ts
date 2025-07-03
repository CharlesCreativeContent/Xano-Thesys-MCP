import { NextRequest, NextResponse } from "next/server";
import { 
  getThreadList as getThreadListService,
  createThread as createThreadService 
} from "@/app/services/threadService";

// GET /api/threads - Get all threads
export async function GET(req: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    console.log('API Route - Token extracted:', token ? 'Present' : 'Missing');

    const threads = await getThreadListService(token);
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST /api/threads - Create a new thread
export async function POST(req: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Thread name is required' },
        { status: 400 }
      );
    }

    const newThread = await createThreadService(name, token);
    return NextResponse.json(newThread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
} 