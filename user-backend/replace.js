const fs = require('fs');
let content = fs.readFileSync('src/controllers/interview.controller.ts', 'utf8');

content = content.replace(
  "import * as AIService from '../services/ai.service';",
  "import { User } from '../models/user.model';\nimport * as AIService from '../services/ai.service';\nimport * as EmailService from '../services/email.service';"
);

content = content.replace(
  "await newInterview.save();\r\n\r\n    res.status(201).json({",
  "await newInterview.save();\r\n\r\n    // Gửi email kết quả\r\n    const user = await User.findById(userId);\r\n    if (user && user.email) {\r\n      EmailService.sendInterviewResult(\r\n        user.email,\r\n        user.fullName || 'Ứng viên',\r\n        position,\r\n        evaluation\r\n      ).catch(err => console.error('Error sending email:', err));\r\n    }\r\n\r\n    res.status(201).json({"
);

// Fallback for LF
content = content.replace(
  "await newInterview.save();\n\n    res.status(201).json({",
  "await newInterview.save();\n\n    // Gửi email kết quả\n    const user = await User.findById(userId);\n    if (user && user.email) {\n      EmailService.sendInterviewResult(\n        user.email,\n        user.fullName || 'Ứng viên',\n        position,\n        evaluation\n      ).catch(err => console.error('Error sending email:', err));\n    }\n\n    res.status(201).json({"
);

fs.writeFileSync('src/controllers/interview.controller.ts', content);
console.log('Done');
