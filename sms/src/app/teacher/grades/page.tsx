import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendGradeNotification } from "@/lib/email";

async function getData(teacherId: string, classId?: string) {
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name").eq("teacher_id", teacherId).order("name");
	let students: any[] = [];
	if (classId) {
		const { data } = await supabase
			.from("students")
			.select("id, full_name, parent:parent_id(email)")
			.eq("class_id", classId)
			.order("full_name");
		students = data ?? [];
	}
	return { classes: classes ?? [], students } as const;
}

export default async function TeacherGradesPage({ searchParams }: { searchParams: { class?: string } }) {
	const user = await requireRole("teacher");
	const selectedClass = searchParams.class ?? "";
	const { classes, students } = await getData(user.id, selectedClass);
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Grades</h1>
			<form className="flex items-end gap-3">
				<div>
					<label className="block text-sm mb-1">Class</label>
					<Select name="class" defaultValue={selectedClass} required>
						<option value="" disabled>Select class</option>
						{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</Select>
				</div>
				<Button type="submit">Load</Button>
			</form>
			{selectedClass && <AddGradeForm classId={selectedClass} students={students} />}
		</div>
	);
}

function AddGradeForm({ classId, students }: { classId: string; students: { id: string; full_name: string; parent?: { email: string } }[] }) {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const student_id = String(formData.get("student_id") ?? "");
		const subject = String(formData.get("subject") ?? "").trim();
		const term = String(formData.get("term") ?? "").trim();
		const score = Number(formData.get("score") ?? 0);
		const max_score = Number(formData.get("max_score") ?? 100);
		if (!student_id || !subject) return;
		await supabase.from("grades").insert({ student_id, class_id: classId, subject, term, score, max_score });
		const { data: s } = await supabase.from("students").select("full_name, parent:parent_id(email)").eq("id", student_id).single();
		const parentEmail = Array.isArray((s as any)?.parent) ? (s as any).parent[0]?.email : (s as any)?.parent?.email;
		if (parentEmail) {
			await sendGradeNotification({ parentEmail, studentName: (s as any).full_name, subject, score, maxScore: max_score });
		}
		revalidatePath(`/teacher/grades?class=${classId}`);
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-6 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Student</label>
				<Select name="student_id" required defaultValue="">
					<option value="" disabled>Select student</option>
					{students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
				</Select>
			</div>
			<div>
				<label className="block text-sm mb-1">Subject</label>
				<Input name="subject" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Term</label>
				<Input name="term" placeholder="e.g., Q1" />
			</div>
			<div>
				<label className="block text-sm mb-1">Score</label>
				<Input type="number" name="score" step="0.01" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Max</label>
				<Input type="number" name="max_score" step="0.01" defaultValue={100} />
			</div>
			<Button type="submit">Add grade</Button>
		</form>
	);
}