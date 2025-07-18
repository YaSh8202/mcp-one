import { createMcpApp } from "../../mcp-app";
import { McpAppCategory } from "../../mcp-app/app-metadata";
import { McpAppAuth } from "../../mcp-app/property";
import { fetchTools } from "./tools";

export const fetchMcpApp = createMcpApp({
	name: "fetch",
	displayName: "Fetch",
	description:
		"Fetch web content in various formats (HTML, JSON, plain text, and Markdown)",
	logo: {
		type: "icon",
		icon: "fetch",
	},
	auth: McpAppAuth.None(),
	tools: fetchTools,
	categories: [McpAppCategory.DEVELOPER_TOOLS],
});
