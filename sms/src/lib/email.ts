import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "School <no-reply@example.com>";

export type GradeNotice = { parentEmail: string; studentName: string; subject: string; score: number; maxScore: number };
export type FeeNotice = { parentEmail: string; studentName: string; amount: number; dueDate: string };

export async function sendGradeNotification(input: GradeNotice) {
	if (!resendApiKey) return;
	const resend = new Resend(resendApiKey);
	await resend.emails.send({
		from,
		to: input.parentEmail,
		subject: `New grade posted for ${input.studentName}`,
		html: `<p>${input.studentName} scored <strong>${input.score}/${input.maxScore}</strong> in ${input.subject}.</p>`
	});
}

export async function sendFeeDueNotification(input: FeeNotice) {
	if (!resendApiKey) return;
	const resend = new Resend(resendApiKey);
	await resend.emails.send({
		from,
		to: input.parentEmail,
		subject: `Fee due for ${input.studentName}`,
		html: `<p>A fee of <strong>$${input.amount.toFixed(2)}</strong> is due on ${input.dueDate} for ${input.studentName}.</p>`
	});
}