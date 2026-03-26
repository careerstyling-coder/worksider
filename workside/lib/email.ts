import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendReservationEmailParams {
  to: string;
  queuePosition: number;
  inviteCode: string;
}

export async function sendReservationEmail({
  to,
  queuePosition,
  inviteCode,
}: SendReservationEmailParams): Promise<void> {
  const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://workside.vercel.app'}/prelaunch?ref=${inviteCode}`;

  await transporter.sendMail({
    from: `"workside" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🎉 workside 사전 예약 완료! (${queuePosition}번째)`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;">
        <div style="text-align:center;padding:32px 24px;background:#f8fafc;border-radius:16px;">
          <h1 style="font-size:24px;margin:0 0 8px;">예약이 완료되었습니다!</h1>
          <p style="color:#64748b;margin:0 0 24px;">첫 500명 중 <strong style="color:#4f46e5;font-size:28px;">${queuePosition}번</strong>째 입니다</p>
        </div>

        <div style="padding:24px;">
          <h2 style="font-size:18px;margin:0 0 12px;">친구를 초대하세요</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 16px;">
            친구 5명이 아래 링크로 가입하면<br/>
            <strong>심화 분석(유료)</strong>을 무료로 이용할 수 있습니다!
          </p>

          <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:16px;text-align:center;margin:0 0 24px;">
            <p style="font-size:12px;color:#64748b;margin:0 0 8px;">내 초대 링크</p>
            <a href="${inviteLink}" style="color:#4f46e5;font-size:14px;word-break:break-all;">${inviteLink}</a>
          </div>

          <div style="text-align:center;">
            <a href="${inviteLink}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              초대 링크 공유하기
            </a>
          </div>
        </div>

        <div style="text-align:center;padding:24px;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 workside. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}
