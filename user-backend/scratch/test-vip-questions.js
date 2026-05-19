const dotenv = require('dotenv');
const { generateInterviewQuestions } = require('../dist/services/ai.service');

dotenv.config();

async function testVipQuestions() {
  console.log("Testing VIP Questions Generation...");
  try {
    const cvData = "Họ tên: Nguyễn Văn A. Kỹ năng: React, Node.js, TypeScript. Kinh nghiệm: 2 năm làm Web Developer.";
    const jdText = "Yêu cầu: Lập trình viên React/Node.js, có kinh nghiệm TypeScript, tối thiểu 2 năm.";
    const position = "Web Developer";
    const level = "Junior";
    
    // Call generateInterviewQuestions with isVip = true
    const result = await generateInterviewQuestions(cvData, jdText, position, level, 'vi', true);
    console.log("Questions success! Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Questions failed! Error:", error);
  }
}

testVipQuestions();
