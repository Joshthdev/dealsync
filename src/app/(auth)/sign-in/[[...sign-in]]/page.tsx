import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<SignIn
			appearance={{
				elements: {
					headerTitle: "Sign in to PriceVerve", // Change branding
				},
			}}
		/>
	);
}
