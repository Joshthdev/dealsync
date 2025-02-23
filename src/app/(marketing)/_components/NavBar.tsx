import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function NavBar() {
	return (
		<header className="py-6 flex shadow-xl fixed top-0 w-full z-10 bg-background/95">
			<nav className="flex justify-between items-center gap-10 container font-semibold">
				<Link href="/" className="mr-auto">
					<BrandLogo />
				</Link>
				<Link href="/pricing" className="text-lg">
					Pricing
				</Link>
				<Link href="#" className="text-lg">
					Features
				</Link>
				<Link href="#" className="text-lg">
					About
				</Link>
				<span className="text-lg">
					<SignedIn>
						<Link href="/dashboard">Dashboard</Link>
					</SignedIn>
					<SignedOut>
						<SignInButton>Login</SignInButton>
					</SignedOut>
				</span>
			</nav>
		</header>
	);
}
