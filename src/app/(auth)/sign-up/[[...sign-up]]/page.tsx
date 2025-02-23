import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<SignUp
			appearance={{
				elements: {
					headerTitle: "Sign up to PriceVerve", // Change branding
				},
			}}
		/>
	);
}
