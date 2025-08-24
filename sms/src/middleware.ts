import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];
const PROTECTED_PREFIXES = ["/admin", "/teacher", "/parent"];

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					res.cookies.set({ name, value, ...options });
				},
				remove(name: string, options: any) {
					res.cookies.set({ name, value: "", ...options });
				},
			},
		}
	);

	const { data: { session } } = await supabase.auth.getSession();

	const pathname = req.nextUrl.pathname;
	const isAuthRoute = AUTH_ROUTES.includes(pathname);
	const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

	if (!session && isProtected && !isAuthRoute) {
		const url = req.nextUrl.clone();
		url.pathname = "/auth/sign-in";
		url.searchParams.set("redirect", pathname);
		return NextResponse.redirect(url);
	}

	return res;
}

export const config = {
	matcher: ["/((?!_next|favicon.ico|api|static).*)"],
};