'use server';

import { streamText, convertToModelMessages, UIMessage } from 'ai';
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
            model = cerebras('llama3.1-70b');
            break;
        case 'mimo':
            model = mimo('xiaomi/mimo-v2-flash');
            break;
        default:
            model = google('gemini-1.5-pro');
    }

    const result = streamText({
        model,
        messages: await convertToModelMessages(messages),
        system: `You are VinDealer AI, a premium vehicle safety auditor. 
    You have access to a tool to audit US vehicle VINs. 
    When a user provides a VIN, use the audit_vehicle_safety tool to get the detailed specs and safety info.
    Present the information in a sleek, structured way.`,
        tools: {
            audit_vehicle_safety: {
                description: 'Audits a US vehicle VIN for specs and active vehicle recalls',
                inputSchema: z.object({
                    vin: z.string().describe('The 17-character VIN of the vehicle'),
                }),
                execute: async ({ vin }) => {
                    const data = await callMCPTool(vin);
                    return data;
                },
            },
        },
    });

    return result.toUIMessageStreamResponse();
}
