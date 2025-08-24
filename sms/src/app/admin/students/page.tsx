import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData() {
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name").order("name");
	const { data: students } = await supabase
		.from("students")
		.select("id, full_name, date_of_birth, class_id, parent:parent_id(email)")
		.order("full_name");
	return { classes: classes ?? [], students: students ?? [] } as const;
}

export default async function AdminStudentsPage() {
	await requireRole("admin");
	const { classes, students } = await getData();
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Students</h1>
			<AddStudentForm classes={classes} />
			<Table>
				<THead>
					<TR>
						<TH>Name</TH>
						<TH>Parent</TH>
						<TH>Class</TH>
						<TH></TH>
					</TR>
				</THead>
				<TBody>
					{students.map((s) => (
						<TR key={s.id}>
							<TD>{s.full_name}</TD>
							<TD>{Array.isArray(s.parent) ? s.parent[0]?.email : (s as any).parent?.email ?? "-"}</TD>
							<TD>{classes.find((c) => c.id === s.class_id)?.name ?? "-"}</TD>
							<TD className="text-right"><DeleteStudentButton id={s.id} /></TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}

function AddStudentForm({ classes }: { classes: { id: string; name: string }[] }) {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const full_name = String(formData.get("full_name") ?? "").trim();
		const date_of_birth = String(formData.get("date_of_birth") ?? "");
		const parent_email = String(formData.get("parent_email") ?? "").trim();
		const class_id = String(formData.get("class_id") ?? "");
		if (!full_name || !parent_email) return;
		const { data: parent } = await supabase.from("users").select("id, role").eq("email", parent_email).single();
		if (!parent) return;
		await supabase.from("students").insert({ full_name, date_of_birth, parent_id: parent.id, class_id: class_id || null });
		revalidatePath("/admin/students");
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Full name</label>
				<Input name="full_name" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Date of birth</label>
				<Input type="date" name="date_of_birth" />
			</div>
			<div>
				<label className="block text-sm mb-1">Parent email</label>
				<Input type="email" name="parent_email" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Class</label>
				<Select name="class_id" defaultValue="">
					<option value="">Unassigned</option>
					{classes.map((c) => (
						<option key={c.id} value={c.id}>{c.name}</option>
					))}
				</Select>
			</div>
			<Button type="submit">Add student</Button>
		</form>
	);
}

function DeleteStudentButton({ id }: { id: string }) {
	async function action() {
		"use server";
		const supabase = createSupabaseServer();
		await supabase.from("students").delete().eq("id", id);
		revalidatePath("/admin/students");
	}
	return (
		<form action={action}>
			<Button type="submit" variant="outline" size="sm">Delete</Button>
		</form>
	);
}