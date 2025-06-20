import type { McpAppMetadata } from "@/app/mcp/mcp-app";
import { ConfirmationDeleteDialog } from "@/components/delete-dialog";
import { useTRPC } from "@/integrations/trpc/react";
import { usePageHeader } from "@/store/header-store";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	AvailableApps,
	ConnectedApps,
	HowToConnect,
	QuickActions,
	ServerDetails,
	ServerStatsCards,
} from "./-components";

export const Route = createFileRoute("/_authed/servers/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const serverId = Route.useParams().id;
	const [copied, setCopied] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: server, refetch: refetchServer } = useSuspenseQuery(
		trpc.mcpServer.findOrThrow.queryOptions({
			id: serverId,
		}),
	);

	const { data: appsMetadata = [] } = useSuspenseQuery(
		trpc.mcpApp.getAvailableApps.queryOptions(),
	);

	const { data: serverApps = [], refetch: refetchServerApps } =
		useSuspenseQuery(
			trpc.mcpApp.listServerApps.queryOptions({
				serverId,
			}),
		);

	const deleteServerMutation = useMutation({
		...trpc.mcpServer.delete.mutationOptions(),
	});

	const copyToClipboard = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(type);
			setTimeout(() => setCopied(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const getAppMetadata = (appName: string): McpAppMetadata | undefined => {
		return appsMetadata.find((app: McpAppMetadata) => app.name === appName);
	};

	const serverUrl = `${window.location.origin}/api/mcp/${server.token}`;

	// Configure page header with breadcrumbs and actions
	usePageHeader({
		breadcrumbs: [
			{ label: "Servers", href: "/servers" },
			{ label: server?.name || "Server" },
		],
		actions: [
			{
				id: "edit-server",
				label: "Edit",
				icon: <Settings className="h-4 w-4" />,
				onClick: () => {
					// Add edit functionality here
					console.log("Edit server:", serverId);
				},
				variant: "outline" as const,
			},
			{
				id: "delete-server",
				label: "Delete",
				icon: <Trash2 className="h-4 w-4" />,
				onClick: () => {
					setDeleteDialogOpen(true);
				},
				variant: "destructive" as const,
				disabled: deleteServerMutation.isPending,
			},
		],
	});

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Stats Cards */}
			<ServerStatsCards
				serverApps={serverApps}
				createdAt={server.createdAt}
				formatDate={formatDate}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Connected Apps */}
					<ConnectedApps
						serverApps={serverApps}
						getAppMetadata={getAppMetadata}
						serverId={serverId}
						onAppInstalled={() => {
							refetchServerApps();
							refetchServer();
						}}
					/>

					{/* Available Apps to Connect */}
					<AvailableApps appsMetadata={appsMetadata} serverApps={serverApps} />
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Server Details */}
					<ServerDetails
						serverUrl={serverUrl}
						copied={copied}
						copyToClipboard={copyToClipboard}
					/>

					{/* How to Connect */}
					<HowToConnect
						serverName={server.name}
						serverUrl={serverUrl}
						copied={copied}
						copyToClipboard={copyToClipboard}
					/>

					{/* Quick Actions */}
					<QuickActions />
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDeleteDialog
				title="Delete Server"
				message={
					<span>
						Are you sure you want to delete the server{" "}
						<strong>"{server?.name}"</strong>? This action cannot be undone and
						will disconnect all associated applications.
					</span>
				}
				entityName={server?.name || "server"}
				mutationFn={async () => {
					await deleteServerMutation.mutateAsync({ id: serverId });
					navigate({ to: "/servers" });
					queryClient.invalidateQueries({
						queryKey: trpc.mcpServer.list.queryKey(),
					});
				}}
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				isDanger={true}
				buttonText="Delete Server"
				showToast={true}
				onError={(error) => {
					console.error("Failed to delete server:", error);
				}}
			/>
		</div>
	);
}
