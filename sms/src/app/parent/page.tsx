import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ParentOverviewPage() {
	await requireRole("parent");
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Attendance</CardTitle>
				</CardHeader>
				<CardContent>Summary coming soon</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Grades</CardTitle>
				</CardHeader>
				<CardContent>Summary coming soon</CardContent>
			</Card>
		</div>
	);
}