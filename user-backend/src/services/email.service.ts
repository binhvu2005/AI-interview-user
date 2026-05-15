import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.ai-interview.id.vn',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'no-reply@ai-interview.id.vn',
    pass: process.env.SMTP_PASS || 'Binhaz19.',
  },
});

export const sendInterviewResult = async (to: string, candidateName: string, position: string, resultDetails: any) => {
  const mailOptions = {
    from: `"AI Interview Platform" <${process.env.SMTP_USER || 'no-reply@ai-interview.id.vn'}>`,
    to,
    subject: `[Kết Quả Phỏng Vấn] ${position}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Chúc mừng bạn đã hoàn thành phỏng vấn!</h2>
        <p>Chào <strong>${candidateName}</strong>,</p>
        <p>Cảm ơn bạn đã tham gia phỏng vấn vị trí <strong>${position}</strong> trên hệ thống AI Interview.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Điểm số của bạn:</h3>
          <p style="font-size: 24px; color: #2196F3; font-weight: bold; text-align: center; margin: 10px 0;">${resultDetails.totalScore} / 100</p>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 5px;">🔧 Kỹ thuật: <strong>${resultDetails.breakdown?.technical || 0}</strong></li>
            <li style="margin-bottom: 5px;">🧩 Giải quyết vấn đề: <strong>${resultDetails.breakdown?.problemSolving || 0}</strong></li>
            <li style="margin-bottom: 5px;">💻 Code: <strong>${resultDetails.breakdown?.coding || 0}</strong></li>
            <li style="margin-bottom: 5px;">🗣️ Giao tiếp: <strong>${resultDetails.breakdown?.communication || 0}</strong></li>
            <li style="margin-bottom: 5px;">🏛️ Kiến trúc & Phù hợp: <strong>${resultDetails.breakdown?.architectureAndFit || 0}</strong></li>
          </ul>
        </div>
        
        <p><strong>Kết luận:</strong> ${resultDetails.summary}</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://ai-interview.id.vn" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Xem Chi Tiết Đánh Giá</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không phản hồi. <br />© ${new Date().getFullYear()} AI Interview Platform.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendForgotPassword = async (to: string, newPassword: string) => {
  const mailOptions = {
    from: `"AI Interview Platform" <${process.env.SMTP_USER || 'no-reply@ai-interview.id.vn'}>`,
    to,
    subject: `Yêu cầu cấp lại mật khẩu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2196F3; text-align: center;">Mật khẩu mới của bạn</h2>
        <p>Chào bạn,</p>
        <p>Hệ thống AI Interview đã nhận được yêu cầu cấp lại mật khẩu cho tài khoản của bạn.</p>
        
        <div style="background-color: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #555;">Mật khẩu mới được tạo ngẫu nhiên của bạn là:</p>
          <p style="font-size: 28px; color: #33691e; font-weight: bold; margin: 10px 0; letter-spacing: 2px;">${newPassword}</p>
          <p style="margin: 0; font-size: 13px; color: #d32f2f;">Vui lòng đăng nhập và đổi mật khẩu này ngay lập tức!</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://ai-interview.id.vn/login" style="background-color: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đăng nhập ngay</a>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ. <br />© ${new Date().getFullYear()} AI Interview Platform.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
