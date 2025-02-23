import { PageWithBackButton } from "@/app/dashboard/_components/PageWithBackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductDetailsForm } from "@/app/dashboard/_components/forms/ProductDetailsForm";
import { HasPermission } from "@/components/HasPermission";
import { canCreateProduct } from "@/server/permissions";
export default async function NewProductPage() {
	return (
		<PageWithBackButton
			backButtonHref="/dashboard/products"
			pageTitle="Create Product"
		>
			<HasPermission
				permission={canCreateProduct}
				renderFallback
				fallbackText="You do not have permission to create products"
			>
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">Product Details</CardTitle>
					</CardHeader>
					<CardContent>
						<ProductDetailsForm />
					</CardContent>
				</Card>
			</HasPermission>
		</PageWithBackButton>
	);
}
