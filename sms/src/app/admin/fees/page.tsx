import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

async function getData() {
	const supabase = createSupabaseServer();
	const { data: students } = await supabase.from("students").select("id, full_name").order("full_name");
	const { data: fees } = await supabase
		.from("fees")
		.select("id, student_id, amount, due_date, status, paid_at, student:student_id(full_name)")
		.order("due_date", { ascending: false });
	return { students: students ?? [], fees: fees ?? [] } as const;
}

export default async function AdminFeesPage() {
	await requireRole("admin");
	const { students, fees } = await getData();
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Fees</h1>
			<AddFeeForm students={students} />
			<Table>
				<THead>
					<TR>
						<TH>Student</TH>
						<TH>Amount</TH>
						<TH>Due date</TH>
						<TH>Status</TH>
						<TH></TH>
					</TR>
				</THead>
				<TBody>
					{fees.map((f) => (
						<TR key={f.id}>
							<TD>{Array.isArray(f.student) ? f.student[0]?.full_name : (f as any).student?.full_name}</TD>
							<TD>${Number(f.amount).toFixed(2)}</TD>
							<TD>{f.due_date}</TD>
							<TD>{f.status}</TD>
							<TD className="text-right">{f.status !== "paid" ? <MarkPaidButton id={f.id} /> : null}</TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}

function AddFeeForm({ students }: { students: { id: string; full_name: string }[] }) {
	async function action(formData: FormData) {
		"use server";
		const supabase = createSupabaseServer();
		const student_id = String(formData.get("student_id") ?? "");
		const amount = Number(formData.get("amount") ?? 0);
		const due_date = String(formData.get("due_date") ?? "");
		if (!student_id || !amount || !due_date) return;
		await supabase.from("fees").insert({ student_id, amount, due_date });
		revalidatePath("/admin/fees");
	}
	return (
		<form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
			<div className="sm:col-span-2">
				<label className="block text-sm mb-1">Student</label>
				<Select name="student_id" required defaultValue="">
					<option value="" disabled>Select student</option>
					{students.map((s) => (
						<option key={s.id} value={s.id}>{s.full_name}</option>
					))}
				</Select>
			</div>
			<div>
				<label className="block text-sm mb-1">Amount</label>
				<Input name="amount" type="number" step="0.01" required />
			</div>
			<div>
				<label className="block text-sm mb-1">Due date</label>
				<Input name="due_date" type="date" required />
			</div>
			<Button type="submit">Add fee</Button>
		</form>
	);
}

function MarkPaidButton({ id }: { id: string }) {
	async function action() {
		"use server";
		const supabase = createSupabaseServer();
		await supabase.from("fees").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
		revalidatePath("/admin/fees");
	}
	return (
		<form action={action}>
			<Button type="submit" variant="outline" size="sm">Mark paid</Button>
		</form>
	);
}