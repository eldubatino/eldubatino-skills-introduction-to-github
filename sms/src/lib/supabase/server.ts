import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServer() {
	const cookieStore = cookies();
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					cookieStore.set({ name, value, ...options });
				},
				remove(name: string, options: any) {
					cookieStore.set({ name, value: "", ...options });
				},
			},
		}
	);
}

export type AppUser = {
	id: string;
	email: string | null;
	full_name: string | null;
	role: "admin" | "teacher" | "parent";
};

export async function getUserWithRole(): Promise<AppUser | null> {
	const supabase = createSupabaseServer();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data, error } = await supabase
		.from("users")
		.select("id, email, full_name, role")
		.eq("id", user.id)
		.single();
	if (error) return null;
	return data as AppUser;
}