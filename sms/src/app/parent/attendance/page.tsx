import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function ParentAttendancePage() {
	const user = await requireRole("parent");
	const supabase = createSupabaseServer();
	const { data: students } = await supabase
		.from("students")
		.select("id, full_name")
		.eq("parent_id", user.id)
		.order("full_name");
	const studentIds = (students ?? []).map(s => s.id);
	let attendance: any[] = [];
	if (studentIds.length) {
		const { data } = await supabase
			.from("attendance")
			.select("student_id, attendance_date, status, class:class_id(name)")
			.in("student_id", studentIds)
			.order("attendance_date", { ascending: false })
			.limit(100);
		attendance = data ?? [];
	}
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Attendance</h1>
			<Table>
				<THead><TR><TH>Date</TH><TH>Student</TH><TH>Class</TH><TH>Status</TH></TR></THead>
				<TBody>
					{attendance.map(a => (
						<TR key={`${a.student_id}-${a.attendance_date}`}>
							<TD>{a.attendance_date}</TD>
							<TD>{students?.find(s => s.id === a.student_id)?.full_name}</TD>
							<TD>{a.class?.name ?? '-'}</TD>
							<TD>{a.status}</TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}