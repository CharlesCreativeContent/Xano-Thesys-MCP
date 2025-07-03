import { NextRequest, NextResponse } from "next/server";
import { 
  getUIThreadMessages,
  updateThread as updateThreadService,
  deleteThread as deleteThreadService,
  addMessages
} from "@/app/services/threadService";

// GET /api/thread/[id] - Get thread messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: threadId } = await params;
    const messages = await getUIThreadMessages(threadId, token);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread messages' },
      { status: 500 }
    );
  }
}

// PATCH /api/thread/[id] - Update thread (name or add messages)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const { id: threadId } = await params;
    const body = await req.json();

    // If updating thread name
    if (body.name) {
      const updatedThread = await updateThreadService({
        threadId,
        name: body.name
      });
      return NextResponse.json(updatedThread);
    }

    // If adding messages
    if (body.messages) {
      await addMessages(threadId, ...body.messages);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'No valid update data provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

// DELETE /api/thread/[id] - Delete thread
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const { id: threadId } = await params;
    await deleteThreadService(threadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
} 