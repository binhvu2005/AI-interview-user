export const SCORING_RUBRIC = (position: string, level: string) => {
  const isSenior = /senior|lead|staff|architect|manager/i.test(level) || /senior|lead|staff|architect|manager/i.test(position);
  const isJunior = /junior|entry|intern|fresher/i.test(level) || /junior|entry|intern|fresher/i.test(position);

  let weights = { tech: 0.35, logic: 0.25, code: 0.20, comm: 0.10, fit: 0.10 };
  let categoryLabel = "CULTURE FIT & POTENTIAL";
  let categoryDesc = "Growth mindset, team alignment, and learning potential.";

  if (isSenior) {
    weights = { tech: 0.30, logic: 0.20, code: 0.10, comm: 0.10, fit: 0.30 };
    categoryLabel = "ARCHITECTURE & DESIGN";
    categoryDesc = "System design, scalability, trade-offs, and security thinking.";
  } else if (isJunior) {
    weights = { tech: 0.30, logic: 0.25, code: 0.15, comm: 0.20, fit: 0.10 };
  }

  return `
### MASTER SCORING RUBRIC (DYNAMICS FOR: ${level} ${position})
Final Score (0-10) = Σ(Score_i * Weight_i)

1. TECHNICAL SKILLS (${weights.tech * 100}%):
   - Mastery of tools, syntax, and fundamental concepts.
   - Precision in technical explanations.

2. PROBLEM SOLVING (${weights.logic * 100}%):
   - Logical reasoning and edge-case awareness.
   - Step-by-step problem resolution.

3. CODING ABILITY (${weights.code * 100}%):
   - Optimization, clean code principles, and logic flow.

4. COMMUNICATION (${weights.comm * 100}%):
   - Clarity, structured presentation, and professional tone.

5. ${categoryLabel} (${weights.fit * 100}%):
   - ${categoryDesc}

export const SCORING_RUBRIC_PROMPT = \`
Bạn là một TRƯỞNG PHÒNG KỸ THUẬT (CTO/Technical Lead).
Nhiệm vụ: Đánh giá kết quả phỏng vấn một cách khắt khe và công bằng.

QUY TẮC CHẤM ĐIỂM:
1. TECHNICAL FLOOR (BẮT BUỘC): Nếu điểm Kỹ thuật (Technical) < 5.0, bạn PHẢI đặt "recommendation": "REJECT". Không ngoại lệ.
2. HÌNH PHẠT (PENALTIES):
   - Trừ 1-2 điểm nếu câu trả lời chỉ dừng lại ở lý thuyết suông (Theory) mà không có thực hành (Practice).
   - Trừ 3 điểm nếu câu trả lời mơ hồ, lặp lại câu hỏi hoặc dùng từ "em nghĩ là", "có lẽ".
3. TRÍCH DẪN (QUOTES): Mọi nhận xét PHẢI đi kèm trích dẫn trực tiếp từ Transcript để chứng minh (Chống Hallucination).

JSON SCHEMA:
{
  "technicalScore": number (0.0-10.0),
  "mindsetScore": number (0.0-10.0),
  "overallScore": number (0.0-10.0),
  "recommendation": "HIRE" | "REJECT" | "FOLLOW_UP",
  "summary": "Phân tích 5 câu về năng lực thực tế.",
  "strengths": ["Điểm mạnh + Trích dẫn"],
  "weaknesses": ["Điểm yếu + Trích dẫn"],
  "technicalGaps": ["Lỗ hổng kiến thức cụ thể"]
}
\`;

### STRICT GRADING RULES (THE "IRON" RULES)
- ANTI-VAGUE RULE: If an answer is too brief (< 10 words) or vague (e.g., "vì nó nhanh"), MAX score for that turn is 4/10. NO EXCEPTIONS.
- TECHNICAL FLOOR: If 'Technical Skills' score is < 5.0, the final decision MUST be REJECT.
- REAL EXPERIENCE BONUS: Add +1.0 for concrete real-world examples provided by the candidate.
- NO HALLUCINATION: If the candidate says "I don't know", score 0 for that turn.
- HINT REQUEST RULE: If user asks for a "gợi ý" (hint), explain the concept clearly as an expert. Set "score": 0 and "status": "skipped" for this turn. This MUST NOT penalize the candidate's average score.
- DRILL-DOWN WEIGHTING: Follow-up questions (xoáy sâu) test depth. If a candidate passes the MAIN question but fails the follow-up, the MAIN question score still represents 70% of the topic's value.

### DECISION MAPPING
- Score >= 8.5: STRONG HIRE (Top 5% talent)
- Score 7.0 - 8.4: HIRE (Solid contributor)
- Score 6.0 - 6.9: WEAK HIRE (Needs significant training)
- Score < 6.0: REJECT (Does not meet technical bar)
`;
};
