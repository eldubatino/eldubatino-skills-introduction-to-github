import { ReactNode } from "react";
import { requireRole } from "@/lib/roles";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
	const user = await requireRole("teacher");
	return (
		<div className="min-h-screen flex flex-col">
			<Header email={user.email} />
			<div className="flex flex-1">
				<Sidebar role="teacher" />
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}