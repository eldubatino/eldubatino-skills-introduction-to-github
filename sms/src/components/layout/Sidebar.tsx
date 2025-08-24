"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: "admin" | "teacher" | "parent" }) {
	const pathname = usePathname();
	const links = role === "admin"
		? [
			{ href: "/admin", label: "Overview" },
			{ href: "/admin/students", label: "Students" },
			{ href: "/admin/teachers", label: "Teachers" },
			{ href: "/admin/classes", label: "Classes" },
			{ href: "/admin/attendance", label: "Attendance" },
			{ href: "/admin/fees", label: "Fees" },
			{ href: "/admin/reports", label: "Reports" },
		]
		: role === "teacher"
		? [
			{ href: "/teacher", label: "Overview" },
			{ href: "/teacher/classes", label: "Classes" },
			{ href: "/teacher/attendance", label: "Attendance" },
			{ href: "/teacher/grades", label: "Grades" },
			{ href: "/teacher/announcements", label: "Announcements" },
		]
		: [
			{ href: "/parent", label: "Overview" },
			{ href: "/parent/attendance", label: "Attendance" },
			{ href: "/parent/grades", label: "Grades" },
			{ href: "/parent/announcements", label: "Announcements" },
			{ href: "/parent/fees", label: "Fees" },
		];

	return (
		<aside className="w-60 shrink-0 border-r p-4">
			<nav className="space-y-1">
				{links.map((l) => (
					<Link key={l.href} href={l.href} className={cn("block rounded-md px-3 py-2 hover:bg-accent", pathname === l.href && "bg-accent")}>{l.label}</Link>
				))}
			</nav>
		</aside>
	);
}