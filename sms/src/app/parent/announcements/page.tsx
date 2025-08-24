import { requireRole } from "@/lib/roles";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export default async function ParentAnnouncementsPage() {
	await requireRole("parent");
	const supabase = createSupabaseServer();
	const { data } = await supabase
		.from("announcements")
		.select("id, title, body, created_at, target_role, class:class_id(name)")
		.in("target_role", ["parents", "all"]) 
		.order("created_at", { ascending: false })
		.limit(50);
	const announcements = data ?? [];
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Announcements</h1>
			<Table>
				<THead><TR><TH>Title</TH><TH>Class</TH><TH>Date</TH></TR></THead>
				<TBody>
					{announcements.map(a => {
						const cls = Array.isArray((a as any).class) ? (a as any).class[0] : (a as any).class;
						return (<TR key={a.id}><TD>{(a as any).title}</TD><TD>{cls?.name ?? '-'}</TD><TD>{new Date((a as any).created_at).toLocaleString()}</TD></TR>);
					})}
				</TBody>
			</Table>
		</div>
	);
}