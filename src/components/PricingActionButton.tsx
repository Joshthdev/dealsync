"use client";

import { useTransition } from "react";
import {
	createCancelSession,
	createCheckoutSession,
} from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PaidTierNames } from "@/data/subscriptionTiers";
export default function PricingActionButton({
	name,
	isCurrent,
}: {
	name: string;
	isCurrent: boolean;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleClick = () => {
		if (isCurrent) return;

		startTransition(async () => {
			if (name === "Free") {
				await createCancelSession();
				router.refresh(); // Reload page after canceling
			} else {
				const result = await createCheckoutSession(name as PaidTierNames);
				if (!result.error && 'url' in result) {
					router.push(result.url as string);
				}
			}
		});
	};

	return (
		<Button
			disabled={isCurrent || isPending}
			className="text-lg w-full rounded-lg"
			size="lg"
			onClick={handleClick}
		>
			{isPending ? "Processing..." : isCurrent ? "Current" : "Swap"}
		</Button>
	);
}
