import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      "app_name": "Obsidian AI",
      "nav": {
        "dashboard": "Dashboard",
        "preparation": "Preparation",
        "admin": "Admin",
        "settings": "Settings",
        "upgrade": "Upgrade",
        "hi": "Hi",
        "profile": "Profile",
        "signin": "Sign In",
        "signup": "Sign Up"
      },
      "sidebar": {
        "title": "Cognitive Sanctuary",
        "subtitle": "Peak Performance",
        "overview": "Overview",
        "interview_prep": "Interview Prep",
        "talent_pool": "Talent Pool",
        "start_interview": "Start Interview",
        "help": "Help",
        "logout": "Logout"
      },
      "setup": {
        "tag": "Preparation",
        "title1": "Define Your",
        "title2": "Crucible.",
        "desc": "Calibrate the parameters of your upcoming simulation. Select role specifics, target skills, and the intensity level to ensure maximum cognitive adaptation.",
        "mode_title": "Interview Mode",
        "mode_ai": "AI Simulation",
        "mode_human": "Human Evaluator",
        "role_title": "Target Role",
        "role_placeholder": "e.g. Senior Product Designer",
        "seniority_title": "Seniority",
        "seniority_select": "Select level",
        "seniority_entry": "Entry Level / Junior",
        "seniority_mid": "Mid-Level",
        "seniority_senior": "Senior",
        "seniority_lead": "Lead / Staff",
        "seniority_exec": "Executive / VP",
        "skills_title": "Core Competencies",
        "skills_sub": "Select up to 5",
        "skills_placeholder": "Search skills or topics...",
        "skills_add": "Add Leadership",
        "btn_init": "Initialize Sequence",
        "section_arch": "Target Architecture",
        "section_profile": "Your Profile",
        "section_job": "Job Context",
        "vault": "Vault",
        "upload_new": "Upload New",
        "vault_empty": "Your Vault is empty",
        "vault_select": "Select a CV from Vault",
        "drop_cv": "Drop PDF here or click to browse",
        "drop_hint": "Only PDF files up to 5MB",
        "uploading": "Uploading...",
        "job_desc_placeholder": "Paste the target job description here. The AI will extract key competencies and tailor the interview questions to match the exact requirements of the role...",
        "analyze_btn": "Analyze Match",
        "analyzing": "Analyzing..."
      },
      "login": {
        "title": "Welcome Back",
        "subtitle": "Sign in to continue to Obsidian AI",
        "email": "Email Address",
        "email_placeholder": "you@company.com",
        "password": "Password",
        "forgot": "Forgot password?",
        "btn": "Sign In",
        "no_account": "Don't have an account?",
        "signup": "Sign up"
      },
      "register": {
        "title": "Create Account",
        "subtitle": "Join Obsidian AI and start preparing",
        "fullname": "Full Name",
        "fullname_placeholder": "John Doe",
        "email": "Email Address",
        "email_placeholder": "you@company.com",
        "password": "Password",
        "btn": "Sign Up",
        "has_account": "Already have an account?",
        "signin": "Sign in"
      },
      "dashboard": {
        "tag": "Cognitive Sanctuary v2.0",
        "title1": "Prepare",
        "title2": "Smarter.",
        "title3": "Get Hired Faster",
        "title4": "with AI",
        "desc": "Step into an editorial, high-stakes preparation environment. Obsidian AI analyzes your CV against live job descriptions and conducts hyper-realistic mock interviews to ensure peak performance.",
        "btn_start": "Start Now",
        "btn_demo": "View Demo",
        "score_title": "Interview Score",
        "score_desc": "Exceptional",
        "section_title": "Precision Engineering for your Career",
        "section_desc": "Reject standard preparation. Our tools are built for high-stakes scenarios, providing analytical depth and actionable insights.",
        "card1_title": "AI Mock Interview",
        "card1_desc": "Engage in dynamic, voice-driven simulations adapted to your target role. The AI probes deep into your experience, reacting in real-time.",
        "card2_title": "CV vs JD Matching",
        "card2_desc": "Instantly map your resume against the job description. Identify critical keyword gaps and structural weaknesses before you apply.",
        "card3_title": "Personalized Feedback",
        "card3_desc": "Receive editorial-grade analysis of your performance. Our system highlights filler words, pacing issues, and thematic strengths with a sophisticated left-accented notation system.",
        "insight_title": "AI Insight",
        "insight_desc": "\"Your explanation of microservices lacked concrete examples. Try structuring with the STAR method next time.\""
      },
      "talent": {
        "tag": "Global Network",
        "title": "Talent",
        "title_highlight": "Pool",
        "desc": "Discover top-ranking candidates based on AI mock interview performance and ATS compatibility scores.",
        "search": "Search talents...",
        "stat1_val": "Top 5%",
        "stat1_lbl": "Your Current Rank",
        "stat2_val": "24",
        "stat2_lbl": "Interviews Completed",
        "stat3_val": "142",
        "stat3_lbl": "Profile Views",
        "list_title": "Featured Candidates",
        "view_all": "View All",
        "ai_match": "AI Match",
        "percentile": "Percentile"
      },
      "settings": {
        "title": "Settings",
        "desc": "Manage your account settings, preferences, and API integrations.",
        "section1": "Personal Identity",
        "change_photo": "Change Photo",
        "upload_btn": "Upload New File",
        "change_avatar": "Change Avatar",
        "fullname": "Full Name",
        "email": "Email Address",
        "role": "Job Title / Target Role",
        "save": "Save Changes",
        "section2": "Application Preferences",
        "darkmode": "Dark Mode",
        "darkmode_desc": "Experience the application in dark theme",
        "email_notif": "Email Notifications",
        "email_notif_desc": "Receive interview analysis reports via email"
      },
      "footer": {
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "api": "API Docs",
        "contact": "Contact Support",
        "copyright": "© 2026 Obsidian AI. Designed for peak performance."
      },
      "notifications": {
        "login_success": "Authentication successful. Welcome back!",
        "login_error": "Invalid email or password. Please try again.",
        "register_success": "Account created successfully!",
        "register_error": "Registration failed. Email might be in use.",
        "save_success": "Settings updated successfully.",
        "setup_error": "Please provide all requirements (CV, JD, and Role specifics).",
        "error_generic": "Something went wrong. Please try again later."
      }
    }
  },
  vi: {
    translation: {
      "app_name": "Obsidian AI",
      "nav": {
        "dashboard": "Bảng điều khiển",
        "preparation": "Chuẩn bị",
        "admin": "Quản trị",
        "settings": "Cài đặt",
        "upgrade": "Nâng cấp",
        "hi": "Chào",
        "profile": "Thông tin cá nhân",
        "signin": "Đăng nhập",
        "signup": "Đăng ký"
      },
      "sidebar": {
        "title": "Thánh địa Nhận thức",
        "subtitle": "Hiệu suất Tối đa",
        "overview": "Tổng quan",
        "interview_prep": "Luyện Phỏng vấn",
        "talent_pool": "Kho Nhân tài",
        "start_interview": "Bắt đầu Phỏng vấn",
        "help": "Trợ giúp",
        "logout": "Đăng xuất"
      },
      "setup": {
        "tag": "Chuẩn bị",
        "title1": "Định hình",
        "title2": "Thử thách.",
        "desc": "Hiệu chỉnh các thông số cho phiên mô phỏng sắp tới. Chọn vai trò cụ thể, kỹ năng mục tiêu và mức độ khó để đảm bảo sự thích nghi nhận thức tối đa.",
        "mode_title": "Chế độ Phỏng vấn",
        "mode_ai": "Mô phỏng AI",
        "mode_human": "Người Đánh giá",
        "role_title": "Vai trò Mục tiêu",
        "role_placeholder": "VD: Senior Product Designer",
        "seniority_title": "Cấp bậc",
        "seniority_select": "Chọn cấp độ",
        "seniority_entry": "Thực tập / Junior",
        "seniority_mid": "Mid-Level",
        "seniority_senior": "Senior",
        "seniority_lead": "Lead / Staff",
        "seniority_exec": "Executive / VP",
        "skills_title": "Năng lực Cốt lõi",
        "skills_sub": "Chọn tối đa 5",
        "skills_placeholder": "Tìm kiếm kỹ năng hoặc chủ đề...",
        "skills_add": "Thêm Lãnh đạo",
        "btn_init": "Khởi tạo Phiên",
        "section_arch": "Thông số Mục tiêu",
        "section_profile": "Hồ sơ của Bạn",
        "section_job": "Mô tả Công việc",
        "vault": "Kho lưu trữ",
        "upload_new": "Tải lên mới",
        "vault_empty": "Kho của bạn đang trống",
        "vault_select": "Chọn CV từ Kho",
        "drop_cv": "Kéo thả PDF hoặc bấm để chọn",
        "drop_hint": "Chỉ nhận file PDF dưới 5MB",
        "uploading": "Đang tải lên...",
        "job_desc_placeholder": "Dán mô tả công việc (JD) vào đây. AI sẽ trích xuất các kỹ năng trọng tâm và cá nhân hóa câu hỏi phỏng vấn để bám sát yêu cầu công việc...",
        "analyze_btn": "Phân tích Phù hợp",
        "analyzing": "Đang phân tích..."
      },
      "login": {
        "title": "Chào mừng Trở lại",
        "subtitle": "Đăng nhập để tiếp tục với Obsidian AI",
        "email": "Địa chỉ Email",
        "email_placeholder": "ban@congty.com",
        "password": "Mật khẩu",
        "forgot": "Quên mật khẩu?",
        "btn": "Đăng Nhập",
        "no_account": "Chưa có tài khoản?",
        "signup": "Đăng ký"
      },
      "register": {
        "title": "Tạo Tài khoản",
        "subtitle": "Tham gia Obsidian AI và bắt đầu chuẩn bị",
        "fullname": "Họ và Tên",
        "fullname_placeholder": "Nguyễn Văn A",
        "email": "Địa chỉ Email",
        "email_placeholder": "ban@congty.com",
        "password": "Mật khẩu",
        "btn": "Đăng Ký",
        "has_account": "Đã có tài khoản?",
        "signin": "Đăng nhập"
      },
      "dashboard": {
        "tag": "Thánh địa Nhận thức v2.0",
        "title1": "Chuẩn bị",
        "title2": "Thông minh.",
        "title3": "Trúng tuyển Nhanh hơn",
        "title4": "với AI",
        "desc": "Bước vào môi trường chuẩn bị phỏng vấn cấp độ cao. Obsidian AI phân tích CV của bạn dựa trên mô tả công việc thực tế và thực hiện các cuộc phỏng vấn giả lập siêu thực để đảm bảo hiệu suất tối đa.",
        "btn_start": "Bắt đầu Ngay",
        "btn_demo": "Xem Demo",
        "score_title": "Điểm Phỏng vấn",
        "score_desc": "Xuất sắc",
        "section_title": "Kỹ thuật Chính xác cho Sự nghiệp",
        "section_desc": "Từ chối sự chuẩn bị thông thường. Các công cụ của chúng tôi được xây dựng cho các tình huống quan trọng, cung cấp chiều sâu phân tích và thông tin hữu ích.",
        "card1_title": "Phỏng vấn Mô phỏng AI",
        "card1_desc": "Tham gia vào các mô phỏng sinh động bằng giọng nói được điều chỉnh cho vai trò mục tiêu. AI đào sâu vào kinh nghiệm của bạn, phản ứng trong thời gian thực.",
        "card2_title": "Khớp CV & JD",
        "card2_desc": "Lập bản đồ sơ yếu lý lịch của bạn với mô tả công việc ngay lập tức. Xác định khoảng trống từ khóa quan trọng và điểm yếu cấu trúc trước khi ứng tuyển.",
        "card3_title": "Phản hồi Cá nhân hóa",
        "card3_desc": "Nhận phân tích cấp độ chuyên gia về hiệu suất của bạn. Hệ thống đánh dấu từ ngữ thừa, vấn đề nhịp độ và thế mạnh chuyên môn với hệ thống ghi chú tinh vi.",
        "insight_title": "AI Chiêm nghiệm",
        "insight_desc": "\"Cách giải thích về microservices của bạn thiếu ví dụ cụ thể. Lần tới hãy thử cấu trúc bằng phương pháp STAR.\""
      },
      "talent": {
        "tag": "Mạng lưới Toàn cầu",
        "title": "Kho",
        "title_highlight": "Nhân tài",
        "desc": "Khám phá các ứng viên xếp hạng hàng đầu dựa trên hiệu suất phỏng vấn mô phỏng AI và điểm tương thích ATS.",
        "search": "Tìm kiếm nhân tài...",
        "stat1_val": "Top 5%",
        "stat1_lbl": "Hạng Hiện tại",
        "stat2_val": "24",
        "stat2_lbl": "Lượt Phỏng vấn",
        "stat3_val": "142",
        "stat3_lbl": "Lượt Xem Hồ sơ",
        "list_title": "Ứng viên Tiêu biểu",
        "view_all": "Xem Tất cả",
        "ai_match": "Độ khớp AI",
        "percentile": "Phân vị"
      },
      "settings": {
        "title": "Cài đặt",
        "desc": "Quản lý cài đặt tài khoản, tùy chọn và tích hợp API của bạn.",
        "section1": "Thông tin cá nhân",
        "change_photo": "Đổi ảnh",
        "upload_btn": "Tải ảnh từ máy",
        "change_avatar": "Đổi Ảnh đại diện",
        "fullname": "Họ và Tên",
        "email": "Địa chỉ Email",
        "role": "Chức danh / Vai trò Mục tiêu",
        "save": "Lưu Thay đổi",
        "section2": "Tùy chọn Ứng dụng",
        "darkmode": "Giao diện Tối",
        "darkmode_desc": "Trải nghiệm ứng dụng trong nền tối",
        "email_notif": "Thông báo Email",
        "email_notif_desc": "Nhận báo cáo phân tích phỏng vấn qua email"
      },
      "footer": {
        "privacy": "Chính sách Bảo mật",
        "terms": "Điều khoản Dịch vụ",
        "api": "Tài liệu API",
        "contact": "Liên hệ Hỗ trợ",
        "copyright": "© 2026 Obsidian AI. Được thiết kế cho hiệu suất tối đa."
      },
      "notifications": {
        "login_success": "Đăng nhập thành công. Chào mừng trở lại!",
        "login_error": "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
        "register_success": "Tạo tài khoản thành công!",
        "register_error": "Đăng ký thất bại. Email có thể đã được sử dụng.",
        "save_success": "Cập nhật cài đặt thành công.",
        "setup_error": "Vui lòng cung cấp đầy đủ thông tin (CV, JD và Vị trí).",
        "error_generic": "Đã có lỗi xảy ra. Vui lòng thử lại sau."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Set Vietnamese as default or fallback
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
