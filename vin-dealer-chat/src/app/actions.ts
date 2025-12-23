'use server';

import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { google, groq, cerebras, mimo, ProviderId } from '@/lib/llm-providers';
import { callMCPTool } from '@/lib/mcp-client';
import { z } from 'zod';

export async function chat(messages: UIMessage[], providerId: ProviderId = 'gemini') {
    let model;

    switch (providerId) {
        case 'gemini':
            model = google('gemini-1.5-pro');
            break;
        case 'groq':
            model = groq('llama-3.1-70b-versatile');
            break;
        case 'cerebras':
            model = cerebras('gpt-oss-120b');
            break;
        case 'mimo':
            model = mimo('xiaomi/mimo-v2-flash');
            break;
        default:
            model = cerebras('gpt-oss-120b');
    }

    const result = streamText({
        model,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(5), // Allow up to 5 tool execution steps
        system: `You are VinDealer AI, a specialized vehicle safety auditor. You ONLY help with vehicle-related queries.

SCOPE RESTRICTIONS:
- You ONLY answer questions about vehicles, VINs, vehicle safety, recalls, and automotive topics.
- If someone asks about anything NOT related to vehicles/automotive, politely decline and redirect them to ask a vehicle-related question.
- Example off-topic questions to decline: coding, weather, recipes, general knowledge, etc.

WHEN A USER PROVIDES A VIN:
1. Use the audit_vehicle_safety tool to fetch the vehicle data
2. Present the results in a clean, structured markdown format

RESPONSE FORMAT (use markdown):
- Use **bold** for key specs (make, model, year)
- Use tables for structured data when appropriate
- Use bullet points for lists
- Use ### headers to organize sections
- Keep responses concise but informative

Example response structure:
### 🚗 Vehicle Audit Report
**Year:** 2021 | **Make:** Honda | **Model:** Accord

| Specification | Value |
|--------------|-------|
| Body Type | Sedan |
| Engine | 2.0L Turbo |

If the VIN lookup fails, explain the issue clearly and suggest corrections.`,
        tools: {
            audit_vehicle_safety: {
                description: 'Audits a US vehicle VIN for specs and active vehicle recalls',
                inputSchema: z.object({
                    vin: z.string().describe('The 17-character VIN of the vehicle'),
                }),
                execute: async ({ vin }) => {
                    console.log('[TOOL] audit_vehicle_safety called with VIN:', vin);
                    const data = await callMCPTool(vin);
                    console.log('[TOOL] MCP response:', data?.substring?.(0, 200) || data);
                    return data;
                },
            },
        },
    });

    return result.toUIMessageStreamResponse();
}
