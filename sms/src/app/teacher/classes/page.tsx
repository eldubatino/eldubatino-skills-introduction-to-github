import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function TeacherClassesPage() {
	const user = await requireRole("teacher");
	const supabase = createSupabaseServer();
	const { data: classes } = await supabase.from("classes").select("id, name, grade, section").eq("teacher_id", user.id).order("name");
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">My Classes</h1>
			<Table>
				<THead>
					<TR>
						<TH>Name</TH><TH>Grade</TH><TH>Section</TH>
					</TR>
				</THead>
				<TBody>
					{(classes ?? []).map((c) => (
						<TR key={c.id}><TD>{c.name}</TD><TD>{c.grade ?? "-"}</TD><TD>{c.section ?? "-"}</TD></TR>
					))}
				</TBody>
			</Table>
		</div>
	);
}