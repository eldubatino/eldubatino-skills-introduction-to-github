"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export type FinanceDatum = { name: string; value: number };

export function FinanceChart({ data }: { data: FinanceDatum[] }) {
	return (
		<div className="h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data}>
					<XAxis dataKey="name" />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Bar dataKey="value" fill="#3b82f6" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}