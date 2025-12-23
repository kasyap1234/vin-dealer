/**
 * Simple MCP Client to interact with our local Go SSE server.
 */
export async function callMCPTool(vin: string) {
    try {
        const serverUrl = 'http://localhost:9876/sse';

        // 1. First, we need to get the message endpoint from the SSE stream
        const sseResponse = await fetch(serverUrl);
        if (!sseResponse.ok) throw new Error('Failed to connect to MCP server');

        const reader = sseResponse.body?.getReader();
        if (!reader) throw new Error('No body in SSE response');

        let endpoint = '';
        const decoder = new TextDecoder();

        // We only need the first few chunks to find the endpoint event
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('event: endpoint')) {
                    continue; // metadata line
                }
                if (line.startsWith('data: ')) {
                    endpoint = line.replace('data: ', '').trim();
                    break;
                }
            }
            if (endpoint) break;
        }

        reader.cancel(); // Close the stream once we have the endpoint

        if (!endpoint) throw new Error('Could not find message endpoint in SSE stream');

        const fullEndpoint = `http://localhost:8080${endpoint}`;

        // 2. Initialize
        await fetch(fullEndpoint, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: { name: 'nextjs-client', version: '1.0.0' }
                }
            })
        });

        // 3. Call the tool
        const callRes = await fetch(fullEndpoint, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '2',
                method: 'tools/call',
                params: {
                    name: 'audit_vehicle_safety',
                    arguments: { vin }
                }
            })
        });

        const result = await callRes.json();

        if (result.error) {
            throw new Error(result.error.message || 'MCP tool call failed');
        }

        // Extract text content from mcp result
        const textContent = result.result?.content?.find((c: any) => c.text)?.text || 'No data found';
        return textContent;
    } catch (error) {
        console.error('MCP Client Error:', error);
        return `Error calling vehicle safety tool: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
