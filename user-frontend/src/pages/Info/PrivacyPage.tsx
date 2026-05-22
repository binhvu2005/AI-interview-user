import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const sections = [
    {
      titleVi: '1. Thông tin chúng tôi thu thập',
      titleEn: '1. Information We Collect',
      contentVi: 'Chúng tôi thu thập thông tin để cung cấp dịch vụ tốt hơn cho người dùng. Bao gồm: Thông tin tài khoản (Họ tên, email, mật khẩu mã hóa), Hồ sơ cá nhân (CV/Resume tải lên định dạng PDF), và Dữ liệu phiên phỏng vấn (Nội dung câu trả lời, bản ghi âm giọng nói hoặc hình ảnh camera nếu được cấp quyền để phân tích phong thái).',
      contentEn: 'We collect information to provide better services to our users. This includes: Account Details (Name, email address, and encrypted passwords), Professional Resumes (CVs uploaded in PDF format), and Mock Interview Data (text responses, audio voice, or webcam video frames if authorized for pacing/body language analytics).'
    },
    {
      titleVi: '2. Cách chúng tôi sử dụng thông tin',
      titleEn: '2. How We Use Your Information',
      contentVi: 'Dữ liệu của bạn được dùng để chạy quy trình phỏng vấn thử nghiệm bằng trí tuệ nhân tạo, đối khớp CV & JD để phát hiện khoảng trống kỹ năng, gửi báo cáo phân tích hiệu suất qua email của bạn, và cải thiện độ chính xác của các thuật toán nhận dạng giọng nói hoặc phản hồi phỏng vấn của chúng tôi.',
      contentEn: 'Your data is processed to execute the AI mock interview simulations, calculate ATS match percentages against target JDs, deliver performance reports to your email, and refine the accuracy of our cognitive evaluation algorithms.'
    },
    {
      titleVi: '3. Bảo mật & Lưu trữ dữ liệu',
      titleEn: '3. Data Security & Storage',
      contentVi: 'Tất cả dữ liệu hồ sơ CV và bản ghi âm giọng nói của bạn được mã hóa an toàn khi truyền tải và lưu trữ (encryption at rest & in transit). Chúng tôi cam kết không chia sẻ thông tin cá nhân của bạn với bên thứ ba ngoại trừ các nhà cung cấp dịch vụ xử lý dữ liệu đám mây đáng tin cậy phục vụ vận hành hệ thống.',
      contentEn: 'All CV files and voice recordings are safely encrypted during transmission and storage (encryption at rest & in transit). We do not share, sell, or rent your personal information to third parties, except for certified hosting and cloud service providers essential for platform operations.'
    },
    {
      titleVi: '4. Quyền kiểm soát của bạn',
      titleEn: '4. Your Rights & Control',
      contentVi: 'Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình. Bạn có thể truy cập "Kho lưu trữ CV" để xóa vĩnh viễn bất kỳ CV nào đã tải lên, xem lại hoặc xóa lịch sử phỏng vấn, chỉnh sửa thông tin cá nhân trong mục cài đặt, hoặc yêu cầu xóa bỏ hoàn toàn tài khoản bất kỳ lúc nào.',
      contentEn: 'You maintain full ownership of your data. You can access the "CV Vault" to permanently delete any uploaded resume, review or purge your mock interview history, modify profile settings, or request full account termination at any time.'
    },
    {
      titleVi: '5. Thay đổi chính sách bảo mật',
      titleEn: '5. Changes to This Policy',
      contentVi: 'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian để phù hợp với sự thay đổi về mặt kỹ thuật hoặc pháp lý. Mọi thay đổi lớn sẽ được thông báo rõ ràng trên trang chủ hoặc gửi email trực tiếp tới bạn.',
      contentEn: 'We may update this privacy statement periodically to reflect system updates or legal changes. We will notify you of major revisions through dashboard banners or email updates.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-12 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {isVi ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {isVi 
              ? 'Tìm hiểu cách chúng tôi thu thập, bảo vệ thông tin và tôn trọng quyền riêng tư của bạn.'
              : 'Learn how we collect, safeguard, and respect your privacy throughout the platform.'}
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 sm:p-10 shadow-sm space-y-8">
        <div className="border-b border-outline-variant/10 pb-6">
          <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-wider">
            {isVi ? 'Cập nhật lần cuối: 22 tháng 5, 2026' : 'Last Updated: May 22, 2026'}
          </p>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {isVi
            ? 'Chào mừng bạn đến với Obsidian AI. Việc bảo vệ thông tin cá nhân và dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi. Tài liệu này mô tả chi tiết cách thức chúng tôi xử lý thông tin cá nhân thu thập được trong quá trình bạn sử dụng hệ thống phỏng vấn giả lập của chúng tôi.'
            : 'Welcome to Obsidian AI. Your privacy is paramount. This statement describes in detail our practices regarding the acquisition, protection, and consumption of user data during mock interview simulations.'}
        </p>

        <div className="space-y-8 pt-4">
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg font-black text-on-surface">
                {isVi ? section.titleVi : section.titleEn}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {isVi ? section.contentVi : section.contentEn}
              </p>
            </section>
          ))}
        </div>

        <div className="border-t border-outline-variant/10 pt-8 mt-12 text-center text-xs text-on-surface-variant/50">
          {isVi
            ? 'Mọi thắc mắc về Chính sách bảo mật, vui lòng gửi email về support@obsidianai.com'
            : 'If you have questions regarding this Privacy Policy, contact us at support@obsidianai.com'}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
