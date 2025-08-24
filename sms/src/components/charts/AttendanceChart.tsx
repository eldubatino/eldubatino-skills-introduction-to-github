"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export type AttendancePoint = { date: string; present: number; absent: number };

export function AttendanceChart({ data }: { data: AttendancePoint[] }) {
	return (
		<div className="h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data}>
					<XAxis dataKey="date" hide />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Line type="monotone" dataKey="present" stroke="#16a34a" strokeWidth={2} />
					<Line type="monotone" dataKey="absent" stroke="#dc2626" strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}