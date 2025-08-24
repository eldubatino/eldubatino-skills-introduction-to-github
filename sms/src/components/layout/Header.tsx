"use client";
import { DarkModeToggle } from "@/components/theme/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function Header({ email }: { email: string | null }) {
	const supabase = createSupabaseBrowser();
	async function signOut() {
		await supabase.auth.signOut();
		window.location.href = "/auth/sign-in";
	}
	return (
		<header className="flex items-center justify-between border-b p-4">
			<div className="font-semibold">School Management System</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">{email}</span>
				<DarkModeToggle />
				<Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
			</div>
		</header>
	);
}