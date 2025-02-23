"use client";

import { useTransition } from "react";
import { createCustomerPortalSession } from "@/server/actions/stripe";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ManageSubscriptionButton() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleClick = () => {
		startTransition(async () => {
			const result = await createCustomerPortalSession();
			if ('url' in result) {
				router.push(result.url as string);
			}
		});
	};

	return (
		<Button
			variant="accent"
			className="text-lg rounded-lg"
			size="lg"
			disabled={isPending}
			onClick={handleClick}
		>
			{isPending ? "Redirecting..." : "Manage Subscription"}
		</Button>
	);
}
