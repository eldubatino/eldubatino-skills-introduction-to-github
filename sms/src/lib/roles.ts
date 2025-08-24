import { redirect } from "next/navigation";
import { getUserWithRole, AppUser } from "@/lib/supabase/server";

export type UserRole = AppUser["role"];

export async function requireRole(allowed: UserRole | UserRole[]) {
	const user = await getUserWithRole();
	if (!user) redirect("/auth/sign-in");
	const roles = Array.isArray(allowed) ? allowed : [allowed];
	if (!roles.includes(user.role)) redirect("/");
	return user;
}