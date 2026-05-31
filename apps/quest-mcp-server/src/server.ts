import type { Request, Response } from 'express';
import * as z from 'zod/v4';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

function createServer(): McpServer {
    const server = new McpServer(
        {
            name: 'quest-mcp-server',
            version: '1.0.0'
        },
        {
            capabilities: {
                logging: {}
            }
        }
    );

    server.registerTool(
        'generateQuest',
        {
            description: 'Generate a beginner-friendly quest plan based on a goal, time budget, and mood.',
            inputSchema: {
                goal: z.string().min(1).describe('What you want to accomplish'),
                availableHours: z.number().finite().nonnegative().describe('How many hours you have available'),
                mood: z.string().min(1).describe('Your current mood or vibe')
            },
            outputSchema: {
                questTitle: z.string(),
                steps: z.array(z.string()),
                difficulty: z.string()
            }
        },
        async ({ goal, availableHours, mood }): Promise<CallToolResult> => {
            const hours = Math.max(0, Math.round(availableHours));

            const difficulty = hours <= 1 ? 'easy' : hours <= 3 ? 'medium' : 'hard';
            const questTitle = `${goal} (${difficulty}, ${hours}h, mood: ${mood})`;

            const steps: string[] = [];

            steps.push('Pick a clear success criteria (what “done” looks like).');

            if (hours === 0) {
                steps.push('Spend 5 minutes writing the next tiny action.');
            } else if (hours === 1) {
                steps.push('Do a quick 10-minute plan.');
                steps.push('Work for 40 minutes, then review and wrap up.');
            } else {
                steps.push('Break the work into 2–4 small tasks.');
                steps.push('Work in focused blocks (45–60 minutes) with short breaks.');
                steps.push('Finish with a 10-minute review and next steps.');
            }

            if (mood.toLowerCase().includes('tired')) {
                steps.push('Keep it lightweight: start with the easiest task first.');
            } else if (mood.toLowerCase().includes('motivated')) {
                steps.push('Start with the hardest/highest-impact task while energy is high.');
            }

            const structuredContent = {
                questTitle,
                steps,
                difficulty
            };

            return {
                content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }],
                structuredContent
            };
        }
    );

    return server;
}

const PORT = 7070;
const HOST = '0.0.0.0';

const app = createMcpExpressApp({
    host: HOST,
    allowedHosts: ['localhost', '127.0.0.1', 'quest-mcp-server']
});

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.post('/mcp', async (req: Request, res: Response) => {
    const server = createServer();

    try {
        // Stateless server: no session tracking.
        const transport = new StreamableHTTPServerTransport({});

        res.on('close', () => {
            transport.close();
            server.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);

        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }

        try {
            server.close();
        } catch {
            // ignore
        }
    }
});

app.listen(PORT, HOST, error => {
    if (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }

    console.log(`Quest MCP server listening on http://${HOST}:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
