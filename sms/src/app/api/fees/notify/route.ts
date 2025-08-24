import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { sendFeeDueNotification } from "@/lib/email";

export async function POST() {
	const supabase = createSupabaseServer();
	const { data: fees } = await supabase
		.from("fees")
		.select("id, student:student_id(full_name, parent:parent_id(email)), amount, due_date, status")
		.eq("status", "unpaid")
		.limit(20);
	for (const fee of fees ?? []) {
		const s = Array.isArray(fee.student) ? fee.student[0] : (fee as any).student;
		const parentEmail = Array.isArray(s?.parent) ? s.parent[0]?.email : s?.parent?.email;
		if (!parentEmail) continue;
		await sendFeeDueNotification({ parentEmail, studentName: s.full_name, amount: Number((fee as any).amount), dueDate: String((fee as any).due_date) });
	}
	return NextResponse.json({ ok: true, notified: (fees ?? []).length });
}