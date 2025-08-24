import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData(selectedClass?: string, selectedDate?: string) {
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name").order("name");
	let rows: any[] = [];
	if (selectedClass && selectedDate) {
		const { data } = await supabase
			.from("attendance")
			.select("student:student_id(full_name), status")
			.eq("class_id", selectedClass)
			.eq("attendance_date", selectedDate)
			.order("status");
		rows = data ?? [];
	}
	return { classes: classes ?? [], rows } as const;
}

export default async function AdminAttendancePage({ searchParams }: { searchParams: { class?: string; date?: string } }) {
	await requireRole("admin");
	const selectedClass = searchParams.class ?? "";
	const selectedDate = searchParams.date ?? new Date().toISOString().slice(0,10);
	const { classes, rows } = await getData(selectedClass, selectedDate);
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Attendance</h1>
			<form className="flex items-end gap-3">
				<div>
					<label className="block text-sm mb-1">Class</label>
					<Select name="class" defaultValue={selectedClass} required>
						<option value="" disabled>Select class</option>
						{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</Select>
				</div>
				<div>
					<label className="block text-sm mb-1">Date</label>
					<Input type="date" name="date" defaultValue={selectedDate} />
				</div>
				<button className="h-9 px-4 border rounded-md" type="submit">Load</button>
			</form>
			{selectedClass && (
				<Table>
					<THead><TR><TH>Student</TH><TH>Status</TH></TR></THead>
					<TBody>
						{rows.map((r, idx) => (
							<TR key={idx}><TD>{r.student?.full_name ?? '-'}</TD><TD className="capitalize">{r.status}</TD></TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}