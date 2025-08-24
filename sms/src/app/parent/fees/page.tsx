import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function ParentFeesPage() {
	const user = await requireRole("parent");
	const supabase = createSupabaseServer();
	const { data: students } = await supabase
		.from("students")
		.select("id, full_name")
		.eq("parent_id", user.id)
		.order("full_name");
	const studentIds = (students ?? []).map(s => s.id);
	let fees: any[] = [];
	if (studentIds.length) {
		const { data } = await supabase
			.from("fees")
			.select("id, student_id, amount, due_date, status, paid_at")
			.in("student_id", studentIds)
			.order("due_date", { ascending: false })
			.limit(100);
		fees = data ?? [];
	}
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Fees</h1>
			<Table>
				<THead><TR><TH>Student</TH><TH>Amount</TH><TH>Due date</TH><TH>Status</TH><TH>Paid at</TH></TR></THead>
				<TBody>
					{fees.map(f => (
						<TR key={f.id}>
							<TD>{students?.find(s => s.id === f.student_id)?.full_name}</TD>
							<TD>${Number(f.amount).toFixed(2)}</TD>
							<TD>{f.due_date}</TD>
							<TD>{f.status}</TD>
							<TD>{f.paid_at ? new Date(f.paid_at).toLocaleString() : '-'}</TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}