import NavBar from "./_components/NavBar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="bg-accent/15 min-h-screen">
			 <NavBar /> 
			<div className="container py-6">{children}</div>
		</div>
	);
}
