import { auth } from "@clerk/nextjs/server";
import { getProducts } from "@/server/db/products";
import { NoProducts } from "./_components/NoProducts";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductGrid } from "./_components/ProductGrid";

export default async function DashboardPage() {
	const { userId, redirectToSignIn } = await auth();
	if (userId == null) return redirectToSignIn();

	const products = await getProducts(userId, { limit: 6 });

	if (products.length === 0) return <NoProducts />;

	return (
		<>
			<h2 className="mb-6 text-3xl font-semibold flex justify-between">
				<Link
					className="group flex gap-2 items-center hover:underline"
					href="/dashboard/products"
				>
					Products
					<ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
				</Link>
				<Button asChild>
					<Link href="/dashboard/products/new">
						<PlusIcon className="size-4 mr-2" />
						New Product
					</Link>
				</Button>
			</h2>
			<ProductGrid products={products} />
			<h2 className="mb-6 text-3xl font-semibold flex justify-between mt-12">
				<Link
					href="/dashboard/analytics"
					className="flex gap-2 items-center hover:underline group"
				>
					Analytics
					<ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
				</Link>
			</h2>
		</>
	);
}

  


