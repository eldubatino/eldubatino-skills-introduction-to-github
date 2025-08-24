import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData() {
	const supabase = createSupabaseServer();
	const { data: teachers } = await supabase.from("users").select("id, email").eq("role", "teacher").order("email");
	const { data: classes } = await supabase.from("classes").select("id, name, grade, section, teacher_id").order("name");
	return { teachers: teachers ?? [], classes: classes ?? [] } as const;
}

export default async function AdminClassesPage() {
	await requireRole("admin");
	const { teachers, classes } = await getData();
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Classes</h1>
			<AddClassForm teachers={teachers} />
			<Table>
				<THead>
					<TR>
						<TH>Name</TH>
						<TH>Grade</TH>
						<TH>Section</TH>
						<TH>Teacher</TH>
						<TH></TH>
					</TR>
				</THead>
				<TBody>
					{classes.map((c) => (
						<TR key={c.id}>
							<TD>{c.name}</TD>
							<TD>{c.grade ?? "-"}</TD>
							<TD>{c.section ?? "-"}</TD>
							<TD>{teachers.find((t) => t.id === c.teacher_id)?.email ?? "-"}</TD>
							<TD className="text-right"><DeleteClassButton id={c.id} /></TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}

function AddClassForm({ teachers }: { teachers: { id: string; email: string }[] }) {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const name = String(formData.get("name") ?? "").trim();
		const grade = String(formData.get("grade") ?? "").trim();
		const section = String(formData.get("section") ?? "").trim();
		const teacher_id = String(formData.get("teacher_id") ?? "");
		if (!name) return;
		await supabase.from("classes").insert({ name, grade, section, teacher_id: teacher_id || null });
		revalidatePath("/admin/classes");
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Name</label>
				<Input name="name" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Grade</label>
				<Input name="grade" />
			</div>
			<div>
				<label className="block text-sm mb-1">Section</label>
				<Input name="section" />
			</div>
			<div>
				<label className="block text-sm mb-1">Teacher</label>
				<Select name="teacher_id" defaultValue="">
					<option value="">Unassigned</option>
					{teachers.map((t) => (
						<option key={t.id} value={t.id}>{t.email}</option>
					))}
				</Select>
			</div>
			<Button type="submit">Add class</Button>
		</form>
	);
}

function DeleteClassButton({ id }: { id: string }) {
	async function action() {
		"use server";
		const supabase = createSupabaseServer();
		await supabase.from("classes").delete().eq("id", id);
		revalidatePath("/admin/classes");
	}
	return (
		<form action={action}>
			<Button type="submit" variant="outline" size="sm">Delete</Button>
		</form>
	);
}