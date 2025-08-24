import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData(teacherId: string) {
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name").eq("teacher_id", teacherId).order("name");
	const { data: announcements } = await supabase
		.from("announcements")
		.select("id, title, created_at, target_role, class:class_id(name)")
		.order("created_at", { ascending: false })
		.limit(50);
	return { classes: classes ?? [], announcements: announcements ?? [] } as const;
}

export default async function TeacherAnnouncementsPage() {
	const user = await requireRole("teacher");
	const { classes, announcements } = await getData(user.id);
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Announcements</h1>
			<AddAnnouncementForm />
			<Table>
				<THead><TR><TH>Title</TH><TH>Target</TH><TH>Class</TH><TH>Date</TH></TR></THead>
				<TBody>
					{announcements.map(a => {
						const cls = Array.isArray((a as any).class) ? (a as any).class[0] : (a as any).class;
						return (<TR key={a.id}><TD>{(a as any).title}</TD><TD>{(a as any).target_role}</TD><TD>{cls?.name ?? '-'}</TD><TD>{new Date((a as any).created_at).toLocaleString()}</TD></TR>);
					})}
				</TBody>
			</Table>
		</div>
	);
}

function AddAnnouncementForm() {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const title = String(formData.get("title") ?? "").trim();
		const body = String(formData.get("body") ?? "").trim();
		const target_role = String(formData.get("target_role") ?? "parents");
		const class_id = String(formData.get("class_id") ?? "");
		if (!title || !body) return;
		const { data: { user } } = await supabase.auth.getUser();
		await supabase.from("announcements").insert({ title, body, target_role, class_id: class_id || null, created_by: user?.id ?? null });
		revalidatePath("/teacher/announcements");
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Title</label>
				<Input name="title" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Body</label>
				<Input name="body" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Target</label>
				<Select name="target_role" defaultValue="parents">
					<option value="parents">Parents</option>
					<option value="teachers">Teachers</option>
					<option value="all">All</option>
				</Select>
			</div>
			<div>
				<label className="block text-sm mb-1">Class (optional)</label>
				<Input name="class_id" placeholder="Class ID" />
			</div>
			<Button type="submit">Create</Button>
		</form>
	);
}