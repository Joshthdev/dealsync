import { HasPermission } from "@/components/HasPermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CHART_INTERVALS,
	getViewsByCountryChartData,
	getViewsByDayChartData,
	getViewsByPPPChartData,
} from "@/server/db/productViews";
import { canAccessAnalytics } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import { ChevronDownIcon } from "lucide-react";
import { ViewsByCountryChart } from "../_components/charts/ViewsByCountryChart";
import { ViewsByPPPChart } from "../_components/charts/ViewsByPPPChart";
import { ViewsByDayChart } from "../_components/charts/ViewsByDayChart";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createURL } from "@/lib/utils";
import { getProducts } from "@/server/db/products";
import { TimezoneDropdownMenuItem } from "../_components/TimezoneDropdownMenuItem";

export default async function AnalyticsPage({
	params,
	searchParams,
}: {
	params: { productId: string };
	searchParams: Promise<{
		interval?: "last7Days" | "last30Days" | "last365Days";
		timezone?: string;
		tab?: string;
	}>;
}) {
	const { productId } = params;

	// Await searchParams
	const resolvedSearchParams = await searchParams;
	const {
		tab,
		interval: rawInterval,
		timezone: rawTimezone,
	} = resolvedSearchParams;

	// Clerk authentication
	const { userId, redirectToSignIn } = await auth();
	if (!userId) return redirectToSignIn();

	const interval =
		CHART_INTERVALS[rawInterval as keyof typeof CHART_INTERVALS] ??
		CHART_INTERVALS.last7Days;
	const timezone = rawTimezone || "UTC";

	return (
		<>
			<div className="mb-6 flex justify-between items-baseline">
				<h1 className="text-3xl font-semibold">Analytics</h1>
				<HasPermission permission={canAccessAnalytics}>
					<div className="flex gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									{interval.label}
									<ChevronDownIcon className="size-4 ml-2" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{Object.entries(CHART_INTERVALS).map(async ([key, value]) => (
									<DropdownMenuItem asChild key={key}>
										<Link
											href={createURL("/dashboard/analytics", await searchParams, {
												interval: key,
											})}
										>
											{value.label}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<ProductDropdown
							userId={userId}
							selectedProductId={productId}
							searchParams={resolvedSearchParams}
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									{timezone}
									<ChevronDownIcon className="size-4 ml-2" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild>
									<Link
										href={createURL("/dashboard/analytics", await searchParams, {
											timezone: "UTC",
										})}
									>
										UTC
									</Link>
								</DropdownMenuItem>
								<TimezoneDropdownMenuItem searchParams={await searchParams} />
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</HasPermission>
			</div>
			<HasPermission permission={canAccessAnalytics} renderFallback>
				<div className="flex flex-col gap-8">
					<ViewsByDayCard
						interval={interval}
						timezone={timezone}
						userId={userId}
						productId={productId}
					/>
					<ViewsByPPPCard
						interval={interval}
						timezone={timezone}
						userId={userId}
						productId={productId}
					/>
					<ViewsByCountryCard
						interval={interval}
						timezone={timezone}
						userId={userId}
						productId={productId}
					/>
				</div>
			</HasPermission>
		</>
	);
}

async function ProductDropdown({
	userId,
	selectedProductId,
	searchParams,
}: {
	userId: string;
	selectedProductId?: string;
	searchParams: Partial<Record<string, string>>;
}) {
	const products = await getProducts(userId);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					{products.find((p) => p.id === selectedProductId)?.name ??
						"All Products"}
					<ChevronDownIcon className="size-4 ml-2" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem asChild>
					<Link
						href={createURL("/dashboard/analytics", searchParams as Record<string, string>, {
							productId: undefined,
						})}
					>
						All Products
					</Link>
				</DropdownMenuItem>
				{products.map((product) => (
					<DropdownMenuItem asChild key={product.id}>
						<Link
							href={createURL("/dashboard/analytics", searchParams as Record<string, string>, {
								productId: product.id.toString(),
							})}
						>
							{product.name}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

async function ViewsByDayCard(
	props: Parameters<typeof getViewsByDayChartData>[0]
) {
	const chartData = await getViewsByDayChartData(props);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Visitors Per Day</CardTitle>
			</CardHeader>
			<CardContent>
				<ViewsByDayChart chartData={chartData} />
			</CardContent>
		</Card>
	);
}

async function ViewsByPPPCard(
	props: Parameters<typeof getViewsByPPPChartData>[0]
) {
	const chartData = await getViewsByPPPChartData(props);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Visitors Per PPP Group</CardTitle>
			</CardHeader>
			<CardContent>
				<ViewsByPPPChart chartData={chartData} />
			</CardContent>
		</Card>
	);
}

async function ViewsByCountryCard(
	props: Parameters<typeof getViewsByCountryChartData>[0]
) {
	const chartData = await getViewsByCountryChartData(props);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Visitors Per Country</CardTitle>
			</CardHeader>
			<CardContent>
				<ViewsByCountryChart chartData={chartData} />
			</CardContent>
		</Card>
	);
}
