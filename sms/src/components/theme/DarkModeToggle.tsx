"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
	const { theme, setTheme } = useTheme();
	const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
	return (
		<Button variant="outline" size="sm" onClick={toggle} aria-label="Toggle theme">
			{theme === "dark" ? "Light" : "Dark"}
		</Button>
	);
}