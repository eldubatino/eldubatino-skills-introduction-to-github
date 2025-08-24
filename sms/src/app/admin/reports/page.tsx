import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { FinanceChart } from "@/components/charts/FinanceChart";

export default async function AdminReportsPage() {
	await requireRole("admin");
	const supabase = createSupabaseServer();
	const { data: attendance } = await supabase.from("attendance_summary").select("attendance_date, present_count, absent_count").order("attendance_date").limit(30);
	// Placeholder finance data
	const finance = [
		{ name: "Paid", value: 70 },
		{ name: "Unpaid", value: 30 },
	];
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader><CardTitle>Attendance (last 30)</CardTitle></CardHeader>
				<CardContent>
					<AttendanceChart data={(attendance ?? []).map(a => ({ date: a.attendance_date as any, present: a.present_count as any, absent: a.absent_count as any }))} />
				</CardContent>
			</Card>
			<Card>
				<CardHeader><CardTitle>Finance</CardTitle></CardHeader>
				<CardContent>
					<FinanceChart data={finance as any} />
				</CardContent>
			</Card>
		</div>
	);
}