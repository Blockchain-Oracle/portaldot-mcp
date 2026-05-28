import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { allTools, logger } from "@portaldot-mcp/core";

async function main(): Promise<void> {
  const server = new McpServer({ name: "portaldot-mcp", version: "0.1.0" });

  for (const t of allTools) {
    server.registerTool(
      t.name,
      { description: t.description, inputSchema: t.inputShape },
      async (args) => {
        const res = await t.handler(args as Record<string, unknown>);
        if (res.ok) {
          return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
        }
        return { content: [{ type: "text", text: res.error }], isError: true };
      },
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info({ tools: allTools.length }, "portaldot-mcp running on stdio");
}

main().catch((e: unknown) => {
  logger.error({ err: String(e) }, "fatal: failed to start portaldot-mcp");
  process.exit(1);
});
