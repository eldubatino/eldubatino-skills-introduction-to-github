import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
	await requireRole("admin");
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Attendance</CardTitle>
				</CardHeader>
				<CardContent>Chart coming soon</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Grades</CardTitle>
				</CardHeader>
				<CardContent>Chart coming soon</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Finance</CardTitle>
				</CardHeader>
				<CardContent>Summary coming soon</CardContent>
			</Card>
		</div>
	);
}