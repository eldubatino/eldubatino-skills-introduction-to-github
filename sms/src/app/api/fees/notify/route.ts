import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { sendFeeDueNotification } from "@/lib/email";

export async function POST() {
	const supabase = createSupabaseServer();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
	if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const service = createSupabaseService();
	const { data: fees } = await service
		.from("fees")
		.select("id, student:student_id(full_name, parent:parent_id(email)), amount, due_date, status")
		.eq("status", "unpaid")
		.limit(50);
	let notified = 0;
	for (const fee of fees ?? []) {
		const s = Array.isArray(fee.student) ? fee.student[0] : (fee as any).student;
		const parentEmail = Array.isArray(s?.parent) ? s.parent[0]?.email : s?.parent?.email;
		if (!parentEmail) continue;
		await sendFeeDueNotification({ parentEmail, studentName: s.full_name, amount: Number((fee as any).amount), dueDate: String((fee as any).due_date) });
		notified++;
	}
	return NextResponse.json({ ok: true, notified });
}