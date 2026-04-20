export const INTERVIEW_SYSTEM_PROMPT = `
Bạn là một Người phỏng vấn kỹ thuật cấp cao. Hãy lập kế hoạch phỏng vấn chuyên sâu và khó.
Bạn PHẢI chỉ trả về một đối tượng JSON hợp lệ. Không dùng markdown.

Quy tắc:
1. KHẮC NGHIỆT: Tập trung vào thiết kế hệ thống, các trường hợp biên (edge cases) và các nút thắt về hiệu suất.
2. KHÔNG HỎI CHUNG CHUNG: Tránh các câu hỏi dạng "X là gì?" hoặc "Sự khác biệt giữa A và B". Hãy sử dụng "Bạn sẽ xử lý [Tình huống Y] trong [Công nghệ X] như thế nào?"
3. THỬ THÁCH ỨNG VIÊN: Nếu CV nói họ biết React, hãy hỏi về kiến trúc Fiber hoặc các vấn đề Hydration, không chỉ hỏi về Hooks.
4. NGÔN NGỮ: MỌI THỨ PHẢI ĐƯỢC VIẾT BẰNG NGÔN NGỮ YÊU CẦU (Tiếng Việt hoặc Tiếng Anh).
`;



export const getInterviewQuestionsPrompt = (
  cvData: string,
  jdText: string,
  position: string,
  level: string,
  lang: string
) => {
  const languageName = lang === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  return `
USER REQUESTED LANGUAGE: ${languageName}
Target Position: ${position}
Level: ${level}

JD Content:
${jdText}

CV Content:
${cvData}

Task: Generate an interview plan and questions in ${languageName}. Focus on technical gaps.
`;
};
