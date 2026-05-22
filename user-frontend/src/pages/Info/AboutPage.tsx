import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const team = [
    {
      name: 'Vũ Thanh Bình',
      role: isVi ? 'Sáng lập & Kỹ sư trưởng' : 'Founder & Lead Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Placeholder using unsplash placeholder image
      bio: isVi ? 'Sinh viên CNTT đam mê AI và công nghệ Fullstack.' : 'IT Student passionate about AI and Fullstack technologies.'
    },
    {
      name: 'Obsidian Assistant',
      role: isVi ? 'Đồng sáng lập & Cố vấn AI' : 'Co-Founder & AI Advisor',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      bio: isVi ? 'Trợ lý AI chuyên sâu về đánh giá và đào tạo kỹ năng lập trình.' : 'AI assistant specializing in evaluating and training programming skills.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center mb-16 relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">psychiatry</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {isVi ? 'Về Chúng Tôi' : 'About Us'}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {isVi 
              ? 'Obsidian AI là nền tảng phỏng vấn lập trình giả lập tích hợp trí tuệ nhân tạo, giúp các ứng viên vượt qua các kỳ đánh giá kỹ thuật đầy thách thức.'
              : 'Obsidian AI is an AI-powered mock technical interview platform helping candidates conquer challenging technical assessments.'}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 sm:p-10 mb-12 shadow-sm">
        <h2 className="text-2xl font-black text-on-surface mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">emoji_objects</span>
          {isVi ? 'Sứ Mệnh Của Chúng Tôi' : 'Our Mission'}
        </h2>
        <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base mb-6">
          {isVi
            ? 'Chúng tôi tin rằng mọi lập trình viên đều xứng đáng có một môi trường chuẩn bị phỏng vấn công bằng, trực quan và thực tế. Obsidian AI được thiết kế để cá nhân hóa lộ trình ôn luyện, phát hiện lỗ hổng kiến thức và cung cấp những phản hồi chuyên sâu giúp bạn tự tin nhất khi bước vào phòng phỏng vấn thực tế.'
            : 'We believe every developer deserves a fair, intuitive, and realistic preparation environment. Obsidian AI is designed to personalize your learning path, detect knowledge gaps, and provide deep technical feedback so you can walk into any interview room with absolute confidence.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="p-5 bg-surface-container/50 rounded-2xl border border-outline-variant/10 text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">auto_awesome</span>
            <h4 className="font-bold text-on-surface text-sm mb-2">{isVi ? 'Phân Tích AI Tức Thì' : 'Instant AI Analytics'}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{isVi ? 'Nhận phản hồi chấm điểm và cải thiện ngay lập tức.' : 'Get feedback, scoring, and paths for improvement instantly.'}</p>
          </div>
          <div className="p-5 bg-surface-container/50 rounded-2xl border border-outline-variant/10 text-center">
            <span className="material-symbols-outlined text-secondary text-3xl mb-3">clinical_notes</span>
            <h4 className="font-bold text-on-surface text-sm mb-2">{isVi ? 'Mẫu JD Thực Tế' : 'Real JD Templates'}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{isVi ? 'Kiểm tra sát sườn theo từng yêu cầu công việc thực tế.' : 'Test against actual job description requirements.'}</p>
          </div>
          <div className="p-5 bg-surface-container/50 rounded-2xl border border-outline-variant/10 text-center">
            <span className="material-symbols-outlined text-green-400 text-3xl mb-3">shield_person</span>
            <h4 className="font-bold text-on-surface text-sm mb-2">{isVi ? 'Mô Phỏng Chuyên Sâu' : 'Realistic Simulation'}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">{isVi ? 'Trải nghiệm áp lực phỏng vấn và câu hỏi vặn vẹo thật.' : 'Experience real interview pressure and follow-up questions.'}</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-on-surface mb-8 text-center">
          {isVi ? 'Đội Ngũ Sáng Lập' : 'Our Founding Team'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:border-primary/20 transition-all">
              <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-2xl object-cover border border-outline-variant/10 flex-shrink-0" />
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-on-surface">{member.name}</h3>
                <p className="text-xs font-black text-primary uppercase tracking-wider mb-2">{member.role}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
