import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  id: number;
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
  category: 'start' | 'interview' | 'vip' | 'tech';
}

const HelpPage = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'start',
      questionVi: 'Làm thế nào để bắt đầu một buổi phỏng vấn thử?',
      questionEn: 'How do I start a mock interview?',
      answerVi: 'Bạn chỉ cần truy cập vào mục "Luyện phỏng vấn", tải lên CV của bạn định dạng PDF, dán nội dung mô tả công việc (JD) bạn đang hướng tới, chọn vị trí và cấp bậc thích hợp. Sau đó nhấn "Khởi tạo Phiên" để bắt đầu.',
      answerEn: 'Simply navigate to the "Interview Prep" section, upload your CV in PDF format, paste the Job Description (JD) details of your target role, select your seniority level, and click "Initialize Sequence" to begin.'
    },
    {
      id: 2,
      category: 'interview',
      questionVi: 'Hệ thống phỏng vấn AI hoạt động như thế nào?',
      questionEn: 'How does the AI interview simulator work?',
      answerVi: 'Sau khi khởi động, AI sẽ sử dụng mô hình ngôn ngữ tiên tiến để phân tích CV & JD của bạn nhằm trích xuất các kỹ năng cần thiết. AI sẽ đưa ra câu hỏi, bạn trả lời bằng giọng nói hoặc gõ chữ. AI sẽ liên tục đặt câu hỏi đào sâu hoặc vặn vẹo (follow-up questions) dựa trên những gì bạn trả lời trước khi chuyển sang câu hỏi tiếp theo.',
      answerEn: 'Once launched, the AI analyzes your CV and JD to map required competencies. It then generates contextual questions. You can reply using audio/microphone or typing. The AI will dynamically analyze your responses and ask probing follow-up questions to test your depth before moving to the next topic.'
    },
    {
      id: 3,
      category: 'vip',
      questionVi: 'Tài khoản Premium VIP có lợi ích gì?',
      questionEn: 'What are the benefits of the Premium VIP package?',
      answerVi: 'Tài khoản VIP sẽ mở khóa số lượt phỏng vấn không giới hạn, sử dụng mô hình AI cao cấp nhất (GPT-4o) để phân tích chi tiết hơn, hỗ trợ tương tác nói chuyện qua giọng nói thời gian thực (Voice-to-Voice), và cho phép xuất/tải báo cáo phân tích CV nâng cao không giới hạn.',
      answerEn: 'Premium VIP unlocks unlimited mock interviews, gives access to our advanced intelligence model (GPT-4o) for high-fidelity evaluation, enables live Voice-to-Voice audio dialogue, and supports exporting detailed ATS CV analytics reports.'
    },
    {
      id: 4,
      category: 'interview',
      questionVi: 'Làm thế nào tôi có thể xem lại kết quả phỏng vấn trước đây?',
      questionEn: 'How can I review my previous interview performance?',
      answerVi: 'Tất cả các phiên phỏng vấn đã hoàn tất đều được lưu trữ trong "Lịch sử Phỏng vấn" (Results). Tại đó bạn có thể xem điểm số tổng, điểm độ khớp CV, và bảng phân tích ưu nhược điểm chi tiết từng câu trả lời cùng gợi ý cải thiện từ chuyên gia AI.',
      answerEn: 'All completed interview sessions are saved in your "Interview History" (Results) tab. You can view overall assessment scores, ATS CV matches, strengths/weaknesses breakdown, and expert suggestions for every question answered.'
    },
    {
      id: 5,
      category: 'tech',
      questionVi: 'Tôi có cần cấp quyền sử dụng camera và micro không?',
      questionEn: 'Do I need to grant camera and microphone access?',
      answerVi: 'Có, để đảm bảo trải nghiệm chân thực nhất và giúp AI phân tích phong thái phỏng vấn (pacing, nhịp độ thở, filler words), bạn nên cấp quyền truy cập webcam và mic. Tuy nhiên, nếu không muốn, bạn vẫn có thể tắt camera và nhập câu trả lời bằng văn bản.',
      answerEn: 'Yes, granting camera and microphone access is highly recommended for the most immersive experience, allowing the AI to analyze verbal pacing and body language. However, you can choose to disable the camera and complete the interview entirely using keyboard text inputs.'
    },
    {
      id: 6,
      category: 'start',
      questionVi: 'Tôi có thể tải lên file CV định dạng Docx không?',
      questionEn: 'Can I upload my CV in Docx format?',
      answerVi: 'Hiện tại hệ thống chỉ hỗ trợ phân tích và hiển thị trực tiếp file định dạng PDF để đảm bảo tính nhất quán về bố cục hiển thị và cấu trúc văn bản. Bạn có thể dễ dàng chuyển đổi file Word/Docx của mình sang PDF trước khi tải lên.',
      answerEn: 'Currently, the platform only supports the PDF format to ensure layout preservation and structural accuracy during semantic parsing. You can easily save or convert your Word/Docx document to PDF before uploading it.'
    }
  ];

  const categories = [
    { value: 'all', labelVi: 'Tất cả chủ đề', labelEn: 'All Topics' },
    { value: 'start', labelVi: 'Bắt đầu', labelEn: 'Getting Started' },
    { value: 'interview', labelVi: 'Phỏng vấn', labelEn: 'Mock Interview' },
    { value: 'vip', labelVi: 'Tài khoản VIP', labelEn: 'VIP Packages' },
    { value: 'tech', labelVi: 'Kỹ thuật', labelEn: 'Technical Issues' }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const qText = isVi ? faq.questionVi : faq.questionEn;
    const aText = isVi ? faq.answerVi : faq.answerEn;
    const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          aText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-12 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">help_center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {isVi ? 'Trung Tâm Trợ Giúp' : 'Help Center'}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {isVi 
              ? 'Tìm kiếm câu trả lời nhanh chóng cho các câu hỏi thường gặp về cách hoạt động của hệ thống.'
              : 'Find quick answers to common questions about our features, billing, and system operations.'}
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto mt-8 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm câu hỏi...' : 'Search questions...'}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setSelectedCategory(cat.value);
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedCategory === cat.value
                ? 'bg-primary text-on-primary border border-primary'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container'
            }`}
          >
            {isVi ? cat.labelVi : cat.labelEn}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-low border border-outline-variant/10 rounded-[32px]">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3">search_off</span>
            <p className="text-on-surface-variant font-medium text-sm">
              {isVi ? 'Không tìm thấy câu hỏi phù hợp.' : 'No questions matching your search.'}
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`bg-surface-container-low border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-primary/30 shadow-sm' : 'border-outline-variant/15 hover:border-outline-variant/30'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-on-surface text-sm sm:text-base"
                >
                  <span>{isVi ? faq.questionVi : faq.questionEn}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-60 border-t border-outline-variant/10' : 'max-h-0'
                  }`}
                >
                  <p className="p-6 text-sm text-on-surface-variant leading-relaxed">
                    {isVi ? faq.answerVi : faq.answerEn}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Support CTA */}
      <div className="mt-16 text-center p-8 bg-gradient-to-tr from-primary/5 to-transparent rounded-[32px] border border-outline-variant/10">
        <h3 className="font-black text-on-surface text-lg mb-2">
          {isVi ? 'Vẫn còn câu hỏi thắc mắc?' : 'Still have questions?'}
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
          {isVi 
            ? 'Đừng ngần ngại liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi để được giải đáp tận tình.' 
            : 'If you could not find the solution, contact our support team directly for personal assistance.'}
        </p>
        <a 
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-colors shadow-md shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[16px]">contact_support</span>
          {isVi ? 'Liên hệ với chúng tôi' : 'Get in Touch'}
        </a>
      </div>
    </div>
  );
};

export default HelpPage;
