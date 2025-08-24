import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";

export default async function HomePage() {
	const user = await getUserWithRole();
	if (!user) {
		redirect("/auth/sign-in");
	}
	if (user.role === "admin") redirect("/admin");
	if (user.role === "teacher") redirect("/teacher");
	if (user.role === "parent") redirect("/parent");
	redirect("/auth/sign-in");
}