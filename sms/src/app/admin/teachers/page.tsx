import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getTeachers() {
	const supabase = createSupabaseServer();
	const { data } = await supabase.from("users").select("id, email, full_name").eq("role", "teacher").order("email");
	return data ?? [];
}

export default async function AdminTeachersPage() {
	await requireRole("admin");
	const teachers = await getTeachers();
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Teachers</h1>
			<InviteTeacherForm />
			<Table>
				<THead>
					<TR>
						<TH>Email</TH>
						<TH>Name</TH>
						<TH></TH>
					</TR>
				</THead>
				<TBody>
					{teachers.map((t) => (
						<TR key={t.id}>
							<TD>{t.email}</TD>
							<TD>{t.full_name ?? "-"}</TD>
							<TD className="text-right"><DeleteTeacherButton id={t.id} /></TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}

function InviteTeacherForm() {
	async function action(formData: FormData) {
		"use server";
		const email = String(formData.get("email") ?? "").trim();
		const full_name = String(formData.get("full_name") ?? "").trim();
		const hire_date = String(formData.get("hire_date") ?? "");
		const phone = String(formData.get("phone") ?? "");
		if (!email) return;
		const service = createSupabaseService();
		await service.auth.admin.inviteUserByEmail(email, { data: { full_name } });
		// Ensure role is teacher and create profile
		const { data: userRow } = await service.from("users").select("id").eq("email", email).single();
		if (userRow) {
			await service.from("users").update({ full_name, role: "teacher" }).eq("id", userRow.id);
			await service.from("teachers").upsert({ user_id: userRow.id, hire_date: hire_date || null, phone });
		}
		revalidatePath("/admin/teachers");
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Email</label>
				<Input name="email" type="email" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Full name</label>
				<Input name="full_name" />
			</div>
			<div>
				<label className="block text-sm mb-1">Hire date</label>
				<Input type="date" name="hire_date" />
			</div>
			<div>
				<label className="block text-sm mb-1">Phone</label>
				<Input name="phone" />
			</div>
			<Button type="submit">Invite teacher</Button>
		</form>
	);
}

function DeleteTeacherButton({ id }: { id: string }) {
	async function action() {
		"use server";
		const service = createSupabaseService();
		await service.from("users").delete().eq("id", id);
		revalidatePath("/admin/teachers");
	}
	return (
		<form action={action}>
			<Button type="submit" variant="outline" size="sm">Delete</Button>
		</form>
	);
}