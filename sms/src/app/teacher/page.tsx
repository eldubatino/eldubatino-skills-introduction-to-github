import { requireRole } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeacherOverviewPage() {
	await requireRole("teacher");
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>My Classes</CardTitle>
				</CardHeader>
				<CardContent>List coming soon</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Announcements</CardTitle>
				</CardHeader>
				<CardContent>Feed coming soon</CardContent>
			</Card>
		</div>
	);
}