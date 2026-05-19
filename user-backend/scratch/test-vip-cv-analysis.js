const dotenv = require('dotenv');
const { analyzeCVJDMatch } = require('../dist/services/ai.service');

dotenv.config();

async function testVipAnalysis() {
  console.log("Testing VIP CV Analysis...");
  try {
    const cvData = "Họ tên: Nguyễn Văn A. Kỹ năng: React, Node.js, TypeScript. Kinh nghiệm: 2 năm làm Web Developer.";
    const jdText = "Yêu cầu: Lập trình viên React/Node.js, có kinh nghiệm TypeScript, tối thiểu 2 năm.";
    const position = "Web Developer";
    const level = "Junior";
    
    // Call analysis with isVip = true
    const result = await analyzeCVJDMatch(cvData, jdText, position, level, 'vi', true);
    console.log("Analysis success! Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Analysis failed! Error:", error);
  }
}

testVipAnalysis();
