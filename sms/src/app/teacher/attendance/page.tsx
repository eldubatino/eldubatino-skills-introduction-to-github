import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData(teacherId: string, classId?: string, date?: string) {
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name").eq("teacher_id", teacherId).order("name");
	let students: any[] = [];
	if (classId) {
		const { data } = await supabase
			.from("students")
			.select("id, full_name")
			.eq("class_id", classId)
			.order("full_name");
		students = data ?? [];
	}
	let attendance: Record<string, string> = {};
	if (classId && date) {
		const { data } = await supabase
			.from("attendance")
			.select("student_id, status")
			.eq("class_id", classId)
			.eq("attendance_date", date);
		for (const row of data ?? []) attendance[row.student_id] = row.status;
	}
	return { classes: classes ?? [], students, attendance } as const;
}

export default async function TeacherAttendancePage({ searchParams }: { searchParams: { class?: string; date?: string } }) {
	const user = await requireRole("teacher");
	const selectedClass = searchParams.class ?? "";
	const selectedDate = searchParams.date ?? new Date().toISOString().slice(0,10);
	const { classes, students, attendance } = await getData(user.id, selectedClass, selectedDate);
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Attendance</h1>
			<FilterForm classes={classes} selectedClass={selectedClass} selectedDate={selectedDate} />
			{selectedClass && (
				<TakeAttendanceForm classId={selectedClass} date={selectedDate} students={students} attendance={attendance} />
			)}
		</div>
	);
}

function FilterForm({ classes, selectedClass, selectedDate }: { classes: { id: string; name: string }[]; selectedClass: string; selectedDate: string }) {
	return (
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
			<Button type="submit">Load</Button>
		</form>
	);
}

function TakeAttendanceForm({ classId, date, students, attendance }: { classId: string; date: string; students: { id: string; full_name: string }[]; attendance: Record<string,string> }) {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const class_id = String(formData.get("class_id"));
		const attendance_date = String(formData.get("attendance_date"));
		const entries: { student_id: string; class_id: string; attendance_date: string; status: string }[] = [];
		for (const [key, value] of formData.entries()) {
			if (key.startsWith("status_")) {
				const student_id = key.replace("status_", "");
				entries.push({ student_id, class_id, attendance_date, status: String(value) });
			}
		}
		if (entries.length) {
			const upserts = entries.map(e => ({ ...e }));
			await supabase.from("attendance").upsert(upserts, { onConflict: "student_id,class_id,attendance_date" });
		}
		revalidatePath(`/teacher/attendance?class=${class_id}&date=${attendance_date}`);
	}
	return (
		<form action={action} className="space-y-4">
			<input type="hidden" name="class_id" value={classId} />
			<input type="hidden" name="attendance_date" value={date} />
			<Table>
				<THead><TR><TH>Student</TH><TH>Status</TH></TR></THead>
				<TBody>
					{students.map(s => (
						<TR key={s.id}>
							<TD>{s.full_name}</TD>
							<TD>
								<Select name={`status_${s.id}`} defaultValue={attendance[s.id] ?? "present"}>
									<option value="present">Present</option>
									<option value="absent">Absent</option>
									<option value="late">Late</option>
									<option value="excused">Excused</option>
								</Select>
							</TD>
						</TR>
					))}
				</TBody>
			</Table>
			<Button type="submit">Save attendance</Button>
		</form>
	);
}