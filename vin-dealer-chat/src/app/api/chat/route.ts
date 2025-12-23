import { chat } from '@/app/actions';

export const runtime = 'nodejs'; // Use Node.js for MCP client support (need full fetch/SSE)

export async function POST(req: Request) {
    const { messages, providerId } = await req.json();

    const response = await chat(messages, providerId);
    return response;
}
