import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function ParentGradesPage() {
	const user = await requireRole("parent");
	const supabase = createSupabaseServer();
	const { data: students } = await supabase
		.from("students")
		.select("id, full_name")
		.eq("parent_id", user.id)
		.order("full_name");
	const studentIds = (students ?? []).map(s => s.id);
	let grades: any[] = [];
	if (studentIds.length) {
		const { data } = await supabase
			.from("grades")
			.select("student_id, subject, term, score, max_score, class:class_id(name)")
			.in("student_id", studentIds)
			.order("subject")
			.limit(200);
		grades = data ?? [];
	}
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Grades</h1>
			<Table>
				<THead><TR><TH>Student</TH><TH>Class</TH><TH>Subject</TH><TH>Term</TH><TH>Score</TH></TR></THead>
				<TBody>
					{grades.map(g => (
						<TR key={`${g.student_id}-${g.subject}-${g.term}`}>
							<TD>{students?.find(s => s.id === g.student_id)?.full_name}</TD>
							<TD>{g.class?.name ?? '-'}</TD>
							<TD>{g.subject}</TD>
							<TD>{g.term ?? '-'}</TD>
							<TD>{Number(g.score)}/{Number(g.max_score)}</TD>
						</TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}