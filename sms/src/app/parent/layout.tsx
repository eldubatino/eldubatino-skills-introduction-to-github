import { ReactNode } from "react";
import { requireRole } from "@/lib/roles";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function ParentLayout({ children }: { children: ReactNode }) {
	const user = await requireRole("parent");
	return (
		<div className="min-h-screen flex flex-col">
			<Header email={user.email} />
			<div className="flex flex-1">
				<Sidebar role="parent" />
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}