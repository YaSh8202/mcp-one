import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-accent animate-pulse rounded-md", className)}
			{...props}
		/>
	);
}

function SkeletonList({
	className,
	numberOfItems = 3,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	numberOfItems?: number;
}) {
	const array = Array(numberOfItems).fill(null);
	return (
		<div className="space-y-3">
			{array.map((_, index) => (
				<Skeleton
					key={index}
					className={cn("h-4 w-full", className)}
					{...props}
				/>
			))}
		</div>
	);
}
SkeletonList.displayName = "SkeletonList";

export { Skeleton, SkeletonList };
