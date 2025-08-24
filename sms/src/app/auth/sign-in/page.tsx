"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SignInPage() {
	const supabase = createSupabaseBrowser();
	const router = useRouter();
	const sp = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) {
			setError(error.message);
			return;
		}
		const redirectTo = sp.get("redirect") || "/";
		router.replace(redirectTo);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
				<h1 className="text-2xl font-semibold">Sign in</h1>
				<input
					type="email"
					className="w-full border rounded-md px-3 py-2"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					className="w-full border rounded-md px-3 py-2"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				{error && <p className="text-red-600 text-sm">{error}</p>}
				<button
					type="submit"
					className="w-full bg-black text-white rounded-md px-3 py-2 disabled:opacity-50"
					disabled={loading}
				>
					{loading ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</div>
	);
}