import { chat } from '@/app/actions';

export const runtime = 'nodejs'; // Use Node.js for MCP client support (need full fetch/SSE)

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[API] Received request:', { providerId: body.providerId, messageCount: body.messages?.length });

        const response = await chat(body.messages, body.providerId);
        console.log('[API] Response generated successfully');
        return response;
    } catch (error) {
        console.error('[API] Error in chat handler:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
