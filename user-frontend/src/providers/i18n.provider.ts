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
        "watch": "Watch",
        "hi": "Hi",
        "profile": "Profile",
        "signin": "Sign In",
        "signup": "Sign Up",
        "notifications": "Notifications",
        "mark_all_read": "Mark all as read",
        "no_notifications": "No notifications",
        "greeting": "Hi",
        "logout": "Logout"
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
        "analyzing": "Analyzing...",
        "pdf_only": "Only PDF files are allowed!",
        "pdf_size_error": "Maximum file size is 5MB!"
      },
      "analysis": {
        "title": "AI Match Analysis",
        "recommended": "Recommended",
        "consider": "Consider",
        "caution": "Caution",
        "not_recommended": "Not Recommended",
        "score": "Score",
        "summary_placeholder": "Analysis summary will appear here..."
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
        "signup": "Sign Up"
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
        "signin": "Sign in",
        "name_too_short": "Full name must be at least 2 characters",
        "invalid_email": "Invalid email address format",
        "pwd_too_short": "Password must be at least 6 characters"
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
        "title": "System Settings",
        "desc": "Manage your account settings, preferences, and display options.",
        "section1": "Personal Identity",
        "change_photo": "Change Photo",
        "upload_btn": "Upload New File",
        "change_avatar": "Change Avatar",
        "fullname": "Full Name",
        "email": "Email Address",
        "role": "Job Title / Target Role",
        "save": "Save Changes",
        "section2": "Application Preferences",
        "darkmode": "Display Mode",
        "darkmode_desc": "Switch between Light and Dark interface.",
        "email_notif": "Email Notifications",
        "email_notif_desc": "Receive interview analysis reports via email",
        "language": "Language",
        "language_desc": "Choose the display language for the entire application."
      },
      "results": {
        "title": "Interview History",
        "subtitle": "Track and review your competency assessment results.",
        "search_placeholder": "Search position or level...",
        "sort_newest": "Newest",
        "sort_oldest": "Oldest",
        "sort_highest": "Highest Score",
        "sort_lowest": "Lowest Score",
        "table_pos": "Job Position",
        "table_level": "Level",
        "table_cv": "CV Match",
        "table_int": "Int. Score",
        "table_total": "Total",
        "table_date": "Date",
        "table_action": "Action",
        "view_report": "View Report",
        "no_data": "No matching interviews found",
        "page": "Page",
        "back": "Back to history",
        "report_title": "Interview Report",
        "retry": "New Interview",
        "overall": "Overall Assessment",
        "key_highlights": "Key Highlights",
        "strengths": "Strengths",
        "weaknesses": "Weaknesses",
        "growth_plan": "Growth Plan",
        "breakdown": "Question Breakdown",
        "question": "Question",
        "your_answer": "Your Answer",
        "skipped": "Skipped",
        "expert_insight": "Expert Insight",
        "loading": "Loading results...",
        "total_interviews": "Total Interviews",
        "this_week": "this week",
        "average_score": "Average Score",
        "match_rate": "Match Rate (CV vs JD)",
        "congrats_title": "Outstanding!",
        "congrats_desc": "You scored {{score}}, placing you among top candidates. Would you like to share this achievement on the Hall of Fame Showcase?",
        "congrats_later": "Maybe Later",
        "congrats_share": "Share Now"
      },
      "vault_page": {
        "title": "CV Vault",
        "subtitle": "View and manage your resumes in their original format.",
        "upload_btn": "Upload CV (PDF)",
        "upload_success": "Uploaded successfully!",
        "upload_error": "Upload failed",
        "delete_success": "CV deleted successfully",
        "delete_error": "Could not delete this CV",
        "date_prefix": "Uploaded:",
        "view_original": "View Original",
        "empty_state": "Upload your designed CV here",
        "preview_title": "Original PDF Preview",
        "close_preview": "Close Viewer",
        "confirm_delete": "Confirm Delete?",
        "delete_desc": "Are you sure you want to remove this CV? This action cannot be undone.",
        "cancel": "Cancel",
        "delete_now": "Delete Now"
      },
      "footer": {
        "privacy": "Privacy Policy",
        "terms": "Terms of Service",
        "api": "API Docs",
        "contact": "Contact Support",
        "copyright": "© 2026 Obsidian AI. Designed for peak performance.",
        "tagline": "Next-gen AI interview platform — helping you prepare better, be more confident and conquer every career opportunity.",
        "subscribe": "Subscribe",
        "email_placeholder": "Your email...",
        "all_systems": "All systems operational",
        "products": "Products",
        "company": "Company",
        "support": "Support",
        "legal": "Legal"
      },
      "profile_page": {
        "title": "Personal Profile",
        "subtitle": "Manage identity information and security settings.",
        "change_pwd": "Change Password",
        "save_changes": "Save Changes",
        "avatar_lbl": "Avatar",
        "fullname": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "phone_placeholder": "e.g. 0912 345 678",
        "role": "Desired Position",
        "role_placeholder": "e.g. Frontend Developer",
        "bio": "Short Bio",
        "bio_placeholder": "Briefly share your experience and goals...",
        "pwd_modal": {
          "title": "Change Password",
          "old_pwd": "Current Password",
          "new_pwd": "New Password",
          "confirm_pwd": "Confirm New Password",
          "cancel": "Cancel",
          "submit": "Update Password"
        },
        "pwd_too_short": "New password must be at least 6 characters",
        "name_too_short": "Full name must be at least 2 characters",
        "invalid_phone": "Invalid phone number (must be 9 to 12 digits)"
      },
      "notifications": {
        "login_success": "Authentication successful. Welcome back!",
        "login_error": "Invalid email or password. Please try again.",
        "register_success": "Account created successfully!",
        "register_error": "Registration failed. Email might be in use.",
        "save_success": "Settings updated successfully.",
        "setup_error": "Please provide all requirements (CV, JD, and Role specifics).",
        "error_generic": "Something went wrong. Please try again later.",
        "profile_load_error": "Could not load profile",
        "profile_save_success": "Profile updated!",
        "profile_save_error": "Error while saving",
        "pwd_mismatch": "New passwords do not match",
        "pwd_success": "Password changed successfully!",
        "pwd_error": "Error changing password"
      },
      "upgrade_page": {
        "tag": "Premium Access",
        "title": "Upgrade to",
        "title_highlight": "VIP Status",
        "subtitle": "Unlock the full potential of Obsidian AI and gain an unfair advantage in your career search.",
        "plan_free_name": "Standard",
        "plan_free_price": "Free",
        "plan_free_desc": "Fundamental preparation tools for casual applicants.",
        "plan_vip_name": "Premium VIP",
        "plan_vip_price": "$19",
        "plan_vip_period": "/month",
        "plan_vip_desc": "The ultimate arsenal for serious professionals seeking top-tier roles.",
        "feature_unlimited": "Unlimited AI Interviews",
        "feature_advanced_ai": "Advanced AI Model (GPT-4o)",
        "feature_cv_export": "Premium CV Export & Analysis",
        "feature_priority": "Priority Support",
        "feature_no_ads": "Ad-free Experience",
        "feature_custom_roles": "Unlimited Custom Roles",
        "feature_voice": "Voice-to-Voice Real-time Interaction",
        "current_plan": "Your Current Plan",
        "upgrade_btn": "Upgrade to VIP Now",
        "popular_badge": "Most Popular"
      },
      "forum": {
        "title": "Community Forum",
        "subtitle": "Engage in meaningful debates, share insights, and learn from the community.",
        "search_placeholder": "Search discussions, topics, or users...",
        "new_post": "New Discussion",
        "create_title": "Start a Discussion",
        "create_placeholder_title": "Title of your discussion...",
        "create_placeholder_content": "What's on your mind? You can use Markdown...",
        "create_tags": "Tags (comma separated)",
        "create_submit": "Post Discussion",
        "sort_newest": "Newest",
        "sort_popular": "Most Liked",
        "replies": "Replies",
        "likes": "Likes",
        "views": "Views",
        "posted_by": "Posted by",
        "reply_placeholder": "Write your reply...",
        "reply_btn": "Post Reply",
        "no_discussions": "No discussions found matching your criteria.",
        "back_to_list": "Back to Discussions",
        "empty_state": "Be the first to start a conversation!",
        "save": "Save Discussion",
        "create_title_label": "Discussion Title",
        "create_content_label": "Content",
        "create_media_label": "Upload Media",
        "create_add_image": "Add Image",
        "create_guidelines": "Community Guidelines apply",
        "user_role_premium": "Premium User",
        "views_count": "{{count}} views"
      },
      "showcase": {
        "title": "Hall of Fame",
        "subtitle": "Discover top-rated interviews from the community. Learn from the best responses across various roles and levels.",
        "all_positions": "All Positions",
        "all_levels": "All Levels",
        "clear_filters": "Clear Filters",
        "loading": "Loading...",
        "no_data": "No Interviews Found",
        "no_data_desc": "No interviews match your criteria.",
        "anonymous": "Anonymous",
        "view_details": "View Details",
        "share": "Share to Showcase",
        "unshare": "Remove from Showcase",
        "shared_success": "Interview shared to Showcase!",
        "unshared_success": "Interview removed from Showcase!"
      },
      "spectator": {
        "invite_title": "Invite Friends to Watch?",
        "invite_desc": "Would you like to share a room code so friends can watch your interview simulation live?",
        "room_code_label": "YOUR ROOM CODE",
        "btn_start_share": "Start & Share Code",
        "btn_private": "No, I want a private session",
        "modal_success": "Spectator mode enabled!",
        "panel_title": "Spectators",
        "panel_empty": "No spectators yet",
        "kick_btn": "Kick",
        "kick_success": "Spectator removed",
        "live_tag": "LIVE"
      },
      "join": {
        "title": "Watch Interview",
        "subtitle": "Enter room code to join live session",
        "code_label": "ROOM CODE (6 CHARS)",
        "code_placeholder": "E.G. ABC123",
        "btn_join": "Join Now",
        "btn_back": "Go Back",
        "err_code": "Room code must be 6 characters"
      },
      "watch": {
        "status_live": "Live Viewing",
        "room_code": "Room Code",
        "btn_leave": "Leave",
        "connecting": "Connecting signal...",
        "waiting_host": "Waiting Room",
        "waiting_host_desc": "Waiting for the host to start the interview...",
        "no_signal": "No video signal",
        "err_stream": "Stream connection error",
        "kicked_msg": "You have been removed from the room by the host",
        "footer_warning": "You are watching a mock interview on Obsidian AI. Any screen recording is strictly prohibited."
      },
      "interview": {
        "thinking": "Thinking...",
        "type_answer": "Type answer...",
        "time_remaining": "TIME REMAINING",
        "camera_off": "Camera Off",
        "exit": "Exit",
        "analyzing": "Analyzing...",
        "welcome": "Welcome to your mock interview. I am Obsidian AI. Please introduce yourself briefly.",
        "error_busy": "The AI system is busy. Please resend your answer.",
        "cheat_warning": "WARNING: Tab switch detected! This will negatively impact your attitude score.",
        "no_camera_support": "Browser does not support camera/mic",
        "camera_access_denied": "Camera access denied"
      },
      "about_page": {
        "title": "About Us",
        "desc": "Obsidian AI is an AI-powered mock technical interview platform helping candidates conquer challenging technical assessments.",
        "mission_title": "Our Mission",
        "mission_desc": "We believe every developer deserves a fair, intuitive, and realistic preparation environment. Obsidian AI is designed to personalize your learning path, detect knowledge gaps, and provide deep technical feedback so you can walk into any interview room with absolute confidence.",
        "feature_analytics_title": "Instant AI Analytics",
        "feature_analytics_desc": "Get feedback, scoring, and paths for improvement instantly.",
        "feature_jd_title": "Real JD Templates",
        "feature_jd_desc": "Test against actual job description requirements.",
        "feature_simulation_title": "Realistic Simulation",
        "feature_simulation_desc": "Experience real interview pressure and follow-up questions.",
        "team_title": "Our Founding Team",
        "team_members": {
          "binh_role": "Founder & Lead Engineer",
          "binh_bio": "IT Student passionate about AI and Fullstack technologies.",
          "assistant_role": "Co-Founder & AI Advisor",
          "assistant_bio": "AI assistant specializing in evaluating and training programming skills."
        }
      },
      "blog_page": {
        "title": "Obsidian DevBlog",
        "desc": "Insights on technical interviews, AI assessments, and engineering tips from the Obsidian AI team.",
        "featured": "Featured Post",
        "all_articles": "All Articles",
        "no_articles": "No articles found in this category.",
        "read_article": "Read Article",
        "read": "Read",
        "categories": {
          "all": "All Posts",
          "prep": "Interview Prep",
          "ai": "AI Technology",
          "update": "Product Updates"
        },
        "posts": {
          "1": {
            "title": "How AI is Revolutionizing Technical Interviews",
            "excerpt": "Explore how large language models (LLMs) and real-time voice synthesis are changing the way developers prepare for high-stakes technical assessments.",
            "author": "Vinh Vu",
            "readTime": "5 min read"
          },
          "2": {
            "title": "Mastering System Design: Key Topics to Study",
            "excerpt": "A curated checklist of essential system design concepts to master, from database sharding and partitioning to message queues and custom caching layers.",
            "author": "Obsidian Assistant",
            "readTime": "8 min read"
          },
          "3": {
            "title": "Obsidian AI v2.0 Release Notes",
            "excerpt": "Introducing live spectator room codes, automated resume ATS analysis matching against job descriptions (JD), and enhanced AI cognitive follow-up questions.",
            "author": "Vinh Vu",
            "readTime": "3 min read"
          },
          "4": {
            "title": "Top 5 Essential Soft Skills for Lead Engineer Interviews",
            "excerpt": "Why structured communication, conflict resolution, and leadership paradigms matter just as much as code proficiency during engineering management interviews.",
            "author": "Obsidian Assistant",
            "readTime": "6 min read"
          }
        }
      },
      "contact_page": {
        "title": "Contact Support",
        "desc": "Our engineering team is always ready to answer your questions and troubleshoot issues.",
        "channels_title": "Support Channels",
        "channels_desc": "For webcam, audio connections, or VIP account issues, please reach out via any of the options below.",
        "response_time_label": "Response Time",
        "response_time_val": "24/7 (Within 24 Hours)",
        "faq_cta_title": "Instant Answers with AI?",
        "faq_cta_desc": "Browse our Help Center / FAQs to get instant resolutions to most common questions.",
        "faq_cta_btn": "Open FAQs",
        "form_title": "Send us a Message",
        "form_name_label": "Full Name",
        "form_name_placeholder": "John Doe",
        "form_email_label": "Email Address",
        "form_subject_label": "Subject",
        "form_subject_placeholder": "e.g. Camera connection issue",
        "form_message_label": "Message",
        "form_message_placeholder": "Describe your issue in detail...",
        "btn_sending": "Sending...",
        "btn_send": "Send Message",
        "toast_fill_fields": "Please fill in all fields.",
        "toast_send_success": "Support request sent successfully! We will get back to you soon."
      },
      "help_page": {
        "title": "Help Center",
        "desc": "Find quick answers to common questions about our features, billing, and system operations.",
        "search_placeholder": "Search questions...",
        "no_questions": "No questions matching your search.",
        "still_questions_title": "Still have questions?",
        "still_questions_desc": "If you could not find the solution, contact our support team directly for personal assistance.",
        "get_in_touch": "Get in Touch",
        "categories": {
          "all": "All Topics",
          "start": "Getting Started",
          "interview": "Mock Interview",
          "vip": "VIP Packages",
          "tech": "Technical Issues"
        },
        "faqs": {
          "1": {
            "question": "How do I start a mock interview?",
            "answer": "Simply navigate to the \"Interview Prep\" section, upload your CV in PDF format, paste the Job Description (JD) details of your target role, select your seniority level, and click \"Initialize Sequence\" to begin."
          },
          "2": {
            "question": "How does the AI interview simulator work?",
            "answer": "Once launched, the AI analyzes your CV and JD to map required competencies. It then generates contextual questions. You can reply using audio/microphone or typing. The AI will dynamically analyze your responses and ask probing follow-up questions to test your depth before moving to the next topic."
          },
          "3": {
            "question": "What are the benefits of the Premium VIP package?",
            "answer": "Premium VIP unlocks unlimited mock interviews, gives access to our advanced intelligence model (GPT-4o) for high-fidelity evaluation, enables live Voice-to-Voice audio dialogue, and supports exporting detailed ATS CV analytics reports."
          },
          "4": {
            "question": "How can I review my previous interview performance?",
            "answer": "All completed interview sessions are saved in your \"Interview History\" (Results) tab. You can view overall assessment scores, ATS CV matches, strengths/weaknesses breakdown, and expert suggestions for every question answered."
          },
          "5": {
            "question": "Do I need to grant camera and microphone access?",
            "answer": "Yes, granting camera and microphone access is highly recommended for the most immersive experience, allowing the AI to analyze verbal pacing and body language. However, you can choose to disable the camera and complete the interview entirely using keyboard text inputs."
          },
          "6": {
            "question": "Can I upload my CV in Docx format?",
            "answer": "Currently, the platform only supports the PDF format to ensure layout preservation and structural accuracy during semantic parsing. You can easily save or convert your Word/Docx document to PDF before uploading it."
          }
        }
      },
      "privacy_page": {
        "title": "Privacy Policy",
        "desc": "Learn how we collect, safeguard, and respect your privacy throughout the platform.",
        "last_updated": "Last Updated: May 22, 2026",
        "intro": "Welcome to Obsidian AI. Your privacy is paramount. This statement describes in detail our practices regarding the acquisition, protection, and consumption of user data during mock interview simulations.",
        "footer_contact": "If you have questions regarding this Privacy Policy, contact us at support@obsidianai.com",
        "sections": {
          "1": {
            "title": "1. Information We Collect",
            "content": "We collect information to provide better services to our users. This includes: Account Details (Name, email address, and encrypted passwords), Professional Resumes (CVs uploaded in PDF format), and Mock Interview Data (text responses, audio voice, or webcam video frames if authorized for pacing/body language analytics)."
          },
          "2": {
            "title": "2. How We Use Your Information",
            "content": "Your data is processed to execute the AI mock interview simulations, calculate ATS match percentages against target JDs, deliver performance reports to your email, and refine the accuracy of our cognitive evaluation algorithms."
          },
          "3": {
            "title": "3. Data Security & Storage",
            "content": "All CV files and voice recordings are safely encrypted during transmission and storage (encryption at rest & in transit). We do not share, sell, or rent your personal information to third parties, except for certified hosting and cloud service providers essential for platform operations."
          },
          "4": {
            "title": "4. Your Rights & Control",
            "content": "You maintain full ownership of your data. You can access the \"CV Vault\" to permanently delete any uploaded resume, review or purge your mock interview history, modify profile settings, or request full account termination at any time."
          },
          "5": {
            "title": "5. Changes to This Policy",
            "content": "We may update this privacy statement periodically to reflect system updates or legal changes. We will notify you of major revisions through dashboard banners or email updates."
          }
        }
      },
      "terms_page": {
        "title": "Terms of Service",
        "desc": "Please read the terms of service carefully before starting your interview preparation.",
        "last_updated": "Last Updated: May 22, 2026",
        "intro": "Welcome to Obsidian AI. By accessing and using our service, you agree to be bound by the terms outlined below. These regulations apply to all users, candidates, and spectators who access our services.",
        "footer_contact": "If you have questions regarding these Terms, contact us at support@obsidianai.com",
        "sections": {
          "1": {
            "title": "1. Acceptance of Terms",
            "content": "By registering an account and using the Obsidian AI platform, you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue using the service immediately."
          },
          "2": {
            "title": "2. Fair Use & Cheat Detection",
            "content": "Obsidian AI is designed for personal learning and interview preparation. During mock sessions, our system monitors tab-switching events to calculate integrity indicators. You agree not to employ automated tools (bots), scrape data, or record/distribute session materials without written authorization."
          },
          "3": {
            "title": "3. VIP Subscriptions & Billing",
            "content": "Certain premium features require a VIP subscription. Subscription fees are billed monthly on a recurring basis until canceled. All payments made are non-refundable except in occurrences of severe platform defects verified by our technical staff."
          },
          "4": {
            "title": "4. Limitations of AI Responsibility",
            "content": "Scoring profiles, ATS CV matches, and expert insights are generated by AI algorithms for self-educational purposes. We make no representations or guarantees that utilizing this platform will result in passing real-world technical interviews or securing employment."
          },
          "5": {
            "title": "5. Termination",
            "content": "We reserve the right to suspend or terminate your account without notice if you violate these terms (e.g. system exploitation, executing denial of service attacks, or posting abusive content in the Forums)."
          }
        }
      },
      "test_page": {
        "title": "Face-API.js Integration Test",
        "desc": "Interactive testing component running in-browser facial landmarking and expression classification.",
        "model_status": "Model Status",
        "ai_models_label": "AI Models:",
        "load_error": "Load Error",
        "ready": "Ready",
        "loading": "Loading...",
        "camera_stream_label": "Camera Stream:",
        "active": "Active",
        "inactive": "Inactive",
        "error_network": "Error: {{error}}. Verify network and CORS.",
        "start_camera": "Start Camera",
        "stop_camera": "Stop Camera",
        "expression_analysis": "Expression Analysis",
        "faces_detected": "Faces Detected:",
        "no_face_detected": "No face details detected",
        "video_placeholder": "Click \"Start Camera\" to authorize your device webcam and initialize detection overlays.",
        "models_loaded": "Face detection models loaded successfully!",
        "models_load_error": "Could not load models. Please verify connection.",
        "camera_access_denied": "Camera access denied. Please grant permission.",
        "expressions": {
          "neutral": "Neutral",
          "happy": "Happy",
          "sad": "Sad",
          "angry": "Angry",
          "fearful": "Fearful",
          "disgusted": "Disgusted",
          "surprised": "Surprised"
        }
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
        "watch": "Xem",
        "hi": "Chào",
        "profile": "Thông tin cá nhân",
        "signin": "Đăng nhập",
        "signup": "Đăng ký",
        "notifications": "Thông báo",
        "mark_all_read": "Đánh dấu đã đọc tất cả",
        "no_notifications": "Không có thông báo",
        "greeting": "Chào",
        "logout": "Đăng xuất"
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
        "analyzing": "Đang phân tích...",
        "pdf_only": "Chỉ nhận định dạng file PDF!",
        "pdf_size_error": "Kích thước file tối đa là 5MB!"
      },
      "analysis": {
        "title": "Phân tích Độ khớp AI",
        "recommended": "ĐỀ XUẤT",
        "consider": "CÂN NHẮC",
        "caution": "CẦN LƯU Ý",
        "not_recommended": "KHÔNG KHUYÊN DÙNG",
        "score": "ĐIỂM SỐ",
        "summary_placeholder": "Tóm tắt phân tích sẽ hiển thị ở đây..."
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
        "signin": "Đăng nhập",
        "name_too_short": "Họ và tên phải có ít nhất 2 ký tự",
        "invalid_email": "Địa chỉ email không hợp lệ",
        "pwd_too_short": "Mật khẩu phải có ít nhất 6 ký tự"
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
        "title": "Cài đặt Hệ thống",
        "desc": "Tùy chỉnh trải nghiệm sử dụng ứng dụng của bạn.",
        "section1": "Thông tin cá nhân",
        "change_photo": "Đổi ảnh",
        "upload_btn": "Tải ảnh từ máy",
        "change_avatar": "Đổi Ảnh đại diện",
        "fullname": "Họ và Tên",
        "email": "Địa chỉ Email",
        "role": "Chức danh / Vai trò Mục tiêu",
        "save": "Lưu Thay đổi",
        "section2": "Tùy chọn Ứng dụng",
        "darkmode": "Chế độ hiển thị",
        "darkmode_desc": "Chuyển đổi giữa giao diện Sáng và Tối.",
        "email_notif": "Thông báo Email",
        "email_notif_desc": "Nhận báo cáo phân tích phỏng vấn qua email",
        "language": "Ngôn ngữ",
        "language_desc": "Chọn ngôn ngữ hiển thị cho toàn bộ ứng dụng."
      },
      "results": {
        "title": "Lịch sử Phỏng vấn",
        "subtitle": "Theo dõi và xem lại kết quả đánh giá năng lực của bạn.",
        "search_placeholder": "Tìm vị trí hoặc cấp độ...",
        "sort_newest": "Mới nhất",
        "sort_oldest": "Cũ nhất",
        "sort_highest": "Điểm cao nhất",
        "sort_lowest": "Điểm thấp nhất",
        "table_pos": "Vị trí công việc",
        "table_level": "Cấp độ",
        "table_cv": "Khớp CV",
        "table_int": "Điểm PV",
        "table_total": "Tổng điểm",
        "table_date": "Ngày thực hiện",
        "table_action": "Hành động",
        "view_report": "Xem báo cáo",
        "no_data": "Chưa có dữ liệu phỏng vấn phù hợp",
        "page": "Trang",
        "back": "Quay lại danh sách",
        "report_title": "Báo cáo Phỏng vấn",
        "retry": "Phỏng vấn lại",
        "overall": "Đánh giá tổng quan",
        "key_highlights": "Điểm mấu chốt",
        "strengths": "Ưu điểm",
        "weaknesses": "Nhược điểm",
        "growth_plan": "Gợi ý cải thiện",
        "breakdown": "Phân tích chi tiết câu hỏi",
        "question": "Câu hỏi",
        "your_answer": "Câu trả lời của bạn",
        "skipped": "Bỏ qua",
        "expert_insight": "Gợi ý câu trả lời chuẩn",
        "loading": "Đang tải kết quả...",
        "total_interviews": "Tổng số bài thi",
        "this_week": "tuần này",
        "average_score": "Điểm trung bình",
        "match_rate": "Độ khớp (CV với JD)",
        "congrats_title": "Tuyệt vời!",
        "congrats_desc": "Bạn đã đạt {{score}} điểm, thuộc top ứng viên xuất sắc. Bạn có muốn vinh danh kết quả này lên Hội Trường Danh Vọng (Showcase) để mọi người cùng học hỏi không?",
        "congrats_later": "Để sau",
        "congrats_share": "Vinh danh ngay"
      },
      "vault_page": {
        "title": "Kho lưu trữ CV",
        "subtitle": "Xem và quản lý hồ sơ của bạn với định dạng gốc.",
        "upload_btn": "Tải lên CV (PDF)",
        "upload_success": "Đã tải lên thành công!",
        "upload_error": "Lỗi khi tải lên",
        "delete_success": "Đã xóa CV thành công",
        "delete_error": "Không thể xóa CV này",
        "date_prefix": "Ngày tải:",
        "view_original": "Xem bản gốc",
        "empty_state": "Tải lên bản CV thiết kế của bạn",
        "preview_title": "Bản xem trước PDF gốc",
        "close_preview": "Đóng trình xem",
        "confirm_delete": "Xác nhận xóa?",
        "delete_desc": "Bạn có chắc chắn muốn xóa bản CV này khỏi kho lưu trữ? Hành động này không thể hoàn tác.",
        "cancel": "Hủy",
        "delete_now": "Xóa ngay"
      },
      "footer": {
        "privacy": "Chính sách Bảo mật",
        "terms": "Điều khoản Dịch vụ",
        "api": "Tài liệu API",
        "contact": "Liên hệ Hỗ trợ",
        "copyright": "© 2026 Obsidian AI. Được thiết kế cho hiệu suất tối đa.",
        "tagline": "Nền tảng phỏng vấn AI thế hệ mới — giúp bạn chuẩn bị tốt hơn, tự tin hơn và chinh phục mọi cơ hội nghề nghiệp.",
        "subscribe": "Theo dõi",
        "email_placeholder": "Email của bạn...",
        "all_systems": "Hệ thống đang hoạt động ổn định",
        "products": "Sản phẩm",
        "company": "Công ty",
        "support": "Hỗ trợ",
        "legal": "Pháp lý"
      },
      "profile_page": {
        "title": "Hồ sơ cá nhân",
        "subtitle": "Quản lý thông tin định danh và cài đặt bảo mật.",
        "change_pwd": "Đổi mật khẩu",
        "save_changes": "Thay đổi thông tin",
        "avatar_lbl": "Ảnh đại diện",
        "fullname": "Họ và Tên",
        "email": "Địa chỉ Email",
        "phone": "Số điện thoại",
        "phone_placeholder": "Ví dụ: 0912 345 678",
        "role": "Vị trí mong muốn",
        "role_placeholder": "Ví dụ: Frontend Developer",
        "bio": "Giới thiệu ngắn",
        "bio_placeholder": "Hãy chia sẻ ngắn gọn về kinh nghiệm và định hướng của bạn...",
        "pwd_modal": {
          "title": "Đổi mật khẩu",
          "old_pwd": "Mật khẩu hiện tại",
          "new_pwd": "Mật khẩu mới",
          "confirm_pwd": "Xác nhận mật khẩu mới",
          "cancel": "Hủy",
          "submit": "Cập nhật mật khẩu"
        },
        "pwd_too_short": "Mật khẩu mới phải có ít nhất 6 ký tự",
        "name_too_short": "Họ và tên phải có ít nhất 2 ký tự",
        "invalid_phone": "Số điện thoại không hợp lệ (9 đến 12 ký tự số)"
      },
      "notifications": {
        "login_success": "Đăng nhập thành công. Chào mừng trở lại!",
        "login_error": "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
        "register_success": "Tạo tài khoản thành công!",
        "register_error": "Đăng ký thất bại. Email có thể đã được sử dụng.",
        "save_success": "Cập nhật cài đặt thành công.",
        "setup_error": "Vui lòng cung cấp đầy đủ thông tin (CV, JD và Vị trí).",
        "error_generic": "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        "profile_load_error": "Không thể tải hồ sơ",
        "profile_save_success": "Đã cập nhật hồ sơ!",
        "profile_save_error": "Lỗi khi lưu hồ sơ",
        "pwd_mismatch": "Mật khẩu mới không khớp",
        "pwd_success": "Đổi mật khẩu thành công!",
        "pwd_error": "Lỗi khi đổi mật khẩu"
      },
      "upgrade_page": {
        "tag": "Quyền truy cập Cao cấp",
        "title": "Nâng cấp tài khoản",
        "title_highlight": "VIP",
        "subtitle": "Khai phá toàn bộ tiềm năng của Obsidian AI và tạo lợi thế vượt trội trong hành trình tìm kiếm sự nghiệp.",
        "plan_free_name": "Cơ bản",
        "plan_free_price": "Miễn phí",
        "plan_free_desc": "Các công cụ chuẩn bị cơ bản cho ứng viên thông thường.",
        "plan_vip_name": "Premium VIP",
        "plan_vip_price": "499k",
        "plan_vip_period": "/tháng",
        "plan_vip_desc": "Kho vũ khí tối thượng cho các chuyên gia nghiêm túc đang tìm kiếm vị trí cao cấp.",
        "feature_unlimited": "Phỏng vấn AI không giới hạn",
        "feature_advanced_ai": "Mô hình AI cao cấp (GPT-4o)",
        "feature_cv_export": "Xuất & Phân tích CV Cao cấp",
        "feature_priority": "Hỗ trợ Ưu tiên",
        "feature_no_ads": "Trải nghiệm không quảng cáo",
        "feature_custom_roles": "Vị trí tùy chỉnh không giới hạn",
        "feature_voice": "Tương tác giọng nói thời gian thực",
        "current_plan": "Gói hiện tại của bạn",
        "upgrade_btn": "Nâng cấp lên VIP ngay",
        "popular_badge": "Phổ biến nhất"
      },
      "forum": {
        "title": "Diễn đàn Cộng đồng",
        "subtitle": "Tham gia tranh luận, chia sẻ kiến thức và học hỏi từ cộng đồng.",
        "search_placeholder": "Tìm kiếm thảo luận, chủ đề hoặc người dùng...",
        "new_post": "Tạo thảo luận mới",
        "create_title": "Bắt đầu một thảo luận",
        "create_placeholder_title": "Tiêu đề thảo luận của bạn...",
        "create_placeholder_content": "Bạn đang nghĩ gì? Bạn có thể sử dụng Markdown...",
        "create_tags": "Thẻ (cách nhau bằng dấu phẩy)",
        "create_submit": "Đăng bài ngay",
        "sort_newest": "Mới nhất",
        "sort_popular": "Yêu thích nhất",
        "replies": "Phản hồi",
        "likes": "Lượt thích",
        "views": "Lượt xem",
        "posted_by": "Đăng bởi",
        "reply_placeholder": "Viết phản hồi của bạn...",
        "reply_btn": "Gửi phản hồi",
        "no_discussions": "Không tìm thấy thảo luận nào phù hợp.",
        "back_to_list": "Quay lại danh sách",
        "empty_state": "Hãy là người đầu tiên bắt đầu cuộc trò chuyện!",
        "save": "Lưu thảo luận",
        "create_title_label": "Tiêu đề thảo luận",
        "create_content_label": "Nội dung",
        "create_media_label": "Tải lên phương tiện",
        "create_add_image": "Thêm ảnh",
        "create_guidelines": "Áp dụng quy tắc cộng đồng",
        "user_role_premium": "Thành viên VIP",
        "views_count": "{{count}} lượt xem"
      },
      "showcase": {
        "title": "Hội Trường Danh Vọng",
        "subtitle": "Khám phá những bài phỏng vấn xuất sắc nhất từ cộng đồng. Học hỏi từ cách trả lời của các ứng viên hàng đầu theo từng vị trí và cấp độ.",
        "all_positions": "Tất cả vị trí",
        "all_levels": "Tất cả cấp độ",
        "clear_filters": "Xóa bộ lọc",
        "loading": "Đang tải...",
        "no_data": "Chưa có dữ liệu",
        "no_data_desc": "Chưa có bài phỏng vấn nào phù hợp với tiêu chí lọc.",
        "anonymous": "Ứng viên ẩn danh",
        "view_details": "Xem chi tiết",
        "share": "Chia sẻ lên Showcase",
        "unshare": "Gỡ khỏi Showcase",
        "shared_success": "Đã chia sẻ bài phỏng vấn lên Showcase!",
        "unshared_success": "Đã gỡ bài phỏng vấn khỏi Showcase!"
      },
      "spectator": {
        "invite_title": "Mời bạn bè xem?",
        "invite_desc": "Bạn có muốn chia sẻ mã phòng để bạn bè có thể xem trực tiếp buổi phỏng vấn của bạn không?",
        "room_code_label": "MÃ PHÒNG CỦA BẠN",
        "btn_start_share": "Bắt đầu & Chia sẻ mã",
        "btn_private": "Không, tôi muốn phỏng vấn 1 mình",
        "modal_success": "Đã kích hoạt chế độ xem trực tiếp!",
        "panel_title": "Người xem",
        "panel_empty": "Chưa có người xem",
        "kick_btn": "Đuổi",
        "kick_success": "Đã đuổi người xem",
        "live_tag": "TRỰC TIẾP"
      },
      "join": {
        "title": "Xem Phỏng Vấn",
        "subtitle": "Nhập mã phòng để tham gia xem trực tiếp",
        "code_label": "MÃ PHÒNG (6 KÝ TỰ)",
        "code_placeholder": "VD: ABC123",
        "btn_join": "Tham gia ngay",
        "btn_back": "Quay lại",
        "err_code": "Mã phòng phải có 6 ký tự"
      },
      "watch": {
        "status_live": "Đang xem trực tiếp",
        "room_code": "Mã phòng",
        "btn_leave": "Rời khỏi",
        "connecting": "Đang kết nối tín hiệu...",
        "waiting_host": "Phòng chờ",
        "waiting_host_desc": "Đang chờ người phỏng vấn bắt đầu...",
        "no_signal": "Không có tín hiệu video",
        "err_stream": "Lỗi kết nối stream",
        "kicked_msg": "Bạn đã bị chủ phòng mời ra khỏi phòng",
        "footer_warning": "Bạn đang xem buổi phỏng vấn giả định trên hệ thống Obsidian AI. Mọi hành vi quay màn hình đều bị nghiêm cấm."
      },
      "interview": {
        "thinking": "Đang suy nghĩ...",
        "type_answer": "Nhập câu trả lời...",
        "time_remaining": "THỜI GIAN CÒN LẠI",
        "camera_off": "Camera Đã Tắt",
        "exit": "Thoát",
        "analyzing": "Đang phân tích...",
        "welcome": "Chào mừng bạn đến với buổi phỏng vấn giả định. Tôi là Obsidian AI. Hãy giới thiệu ngắn gọn về bản thân bạn.",
        "error_busy": "Hệ thống AI đang tạm thời bận. Vui lòng gửi lại câu trả lời.",
        "cheat_warning": "CẢNH BÁO: Phát hiện chuyển tab! Hành vi này sẽ bị AI ghi nhận và trừ điểm thái độ.",
        "no_camera_support": "Trình duyệt không hỗ trợ camera/mic",
        "camera_access_denied": "Không thể truy cập Camera/Mic"
      },
      "about_page": {
        "title": "Về Chúng Tôi",
        "desc": "Obsidian AI là nền tảng phỏng vấn lập trình giả lập tích hợp trí tuệ nhân tạo, giúp các ứng viên vượt qua các kỳ đánh giá kỹ thuật đầy thách thức.",
        "mission_title": "Sứ Mệnh Của Chúng Tôi",
        "mission_desc": "Chúng tôi tin rằng mọi lập trình viên đều xứng đáng có một môi trường chuẩn bị phỏng vấn công bằng, trực quan và thực tế. Obsidian AI được thiết kế để cá nhân hóa lộ trình ôn luyện, phát hiện lỗ hổng kiến thức và cung cấp những phản hồi chuyên sâu giúp bạn tự tin nhất khi bước vào phòng phỏng vấn thực tế.",
        "feature_analytics_title": "Phân Tích AI Tức Thì",
        "feature_analytics_desc": "Nhận phản hồi chấm điểm và cải thiện ngay lập tức.",
        "feature_jd_title": "Mẫu JD Thực Tế",
        "feature_jd_desc": "Kiểm tra sát sườn theo từng yêu cầu công việc thực tế.",
        "feature_simulation_title": "Mô Phỏng Chuyên Sâu",
        "feature_simulation_desc": "Trải nghiệm áp lực phỏng vấn và câu hỏi vặn vẹo thật.",
        "team_title": "Đội Ngũ Sáng Lập",
        "team_members": {
          "binh_role": "Sáng lập & Kỹ sư trưởng",
          "binh_bio": "Sinh viên CNTT đam mê AI và công nghệ Fullstack.",
          "assistant_role": "Đồng sáng lập & Cố vấn AI",
          "assistant_bio": "Trợ lý AI chuyên sâu về đánh giá và đào tạo kỹ năng lập trình."
        }
      },
      "blog_page": {
        "title": "Nhật Ký Phát Triển",
        "desc": "Nơi chia sẻ kiến thức phỏng vấn, cập nhật công nghệ AI và hướng dẫn lập trình từ đội ngũ Obsidian AI.",
        "featured": "Bài viết nổi bật",
        "all_articles": "Tất cả bài viết khác",
        "no_articles": "Không tìm thấy bài viết nào.",
        "read_article": "Đọc tiếp",
        "read": "Đọc tiếp",
        "categories": {
          "all": "Tất cả bài viết",
          "prep": "Luyện phỏng vấn",
          "ai": "Công nghệ AI",
          "update": "Bản cập nhật"
        },
        "posts": {
          "1": {
            "title": "Cách AI Đang Cách Mạng Hóa Phỏng Vấn Kỹ Thuật",
            "excerpt": "Khám phá cách các mô hình ngôn ngữ lớn (LLM) và tổng hợp giọng nói thời gian thực thay đổi cách lập trình viên chuẩn bị cho các kỳ thi kỹ thuật đầy thử thách.",
            "author": "Vũ Thanh Bình",
            "readTime": "5 phút đọc"
          },
          "2": {
            "title": "Chinh Phục Thiết Kế Hệ Thống: Các Chủ Đề Trọng Tâm",
            "excerpt": "Danh sách các khái niệm thiết kế hệ thống cốt lõi cần nắm vững, từ phân mạch cơ sở dữ liệu (sharding) đến hàng đợi tin nhắn (message queues) và bộ nhớ đệm (caching).",
            "author": "Obsidian Assistant",
            "readTime": "8 phút đọc"
          },
          "3": {
            "title": "Thông Tin Bản Cập Nhật Obsidian AI v2.0",
            "excerpt": "Giới thiệu chế độ quan sát trực tiếp (live spectator mode), phân tích hồ sơ CV tự động theo mẫu mô tả công việc (JD), và cải tiến hệ thống câu hỏi truy vấn của AI.",
            "author": "Vũ Thanh Bình",
            "readTime": "3 phút đọc"
          },
          "4": {
            "title": "Top 5 Kỹ Năng Mềm Quan Trọng Cho Kỹ Sư Trưởng / Leader",
            "excerpt": "Tại sao khả năng giao tiếp truyền đạt, giải quyết xung đột và phương pháp lãnh đạo lại quan trọng ngang hàng với trình độ code trong phỏng vấn vị trí quản lý.",
            "author": "Obsidian Assistant",
            "readTime": "6 phút đọc"
          }
        }
      },
      "contact_page": {
        "title": "Liên Hệ Hỗ Trợ",
        "desc": "Đội ngũ kỹ thuật của Obsidian AI luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc và khắc phục sự cố.",
        "channels_title": "Thông tin hỗ trợ",
        "channels_desc": "Nếu bạn gặp sự cố kỹ thuật về kết nối camera, âm thanh hoặc gói thanh toán VIP, hãy nhắn cho chúng tôi qua các kênh dưới đây.",
        "response_time_label": "Thời gian làm việc",
        "response_time_val": "24/7 (Phản hồi trong 24h)",
        "faq_cta_title": "Giải đáp tức thì với AI?",
        "faq_cta_desc": "Hãy xem qua mục Trợ giúp (FAQ) để tìm nhanh lời giải đáp cho các câu hỏi thường gặp.",
        "faq_cta_btn": "Xem FAQ",
        "form_title": "Gửi yêu cầu trợ giúp",
        "form_name_label": "Họ và tên",
        "form_name_placeholder": "Nguyễn Văn A",
        "form_email_label": "Địa chỉ Email",
        "form_subject_label": "Chủ đề cần hỗ trợ",
        "form_subject_placeholder": "VD: Lỗi thanh toán gói VIP",
        "form_message_label": "Nội dung chi tiết",
        "form_message_placeholder": "Mô tả chi tiết sự cố bạn đang gặp phải...",
        "btn_sending": "Đang gửi...",
        "btn_send": "Gửi tin nhắn",
        "toast_fill_fields": "Vui lòng điền đầy đủ các thông tin.",
        "toast_send_success": "Đã gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi sớm nhất."
      },
      "help_page": {
        "title": "Trung Tâm Trợ Giúp",
        "desc": "Tìm kiếm câu trả lời nhanh chóng cho các câu hỏi thường gặp về cách hoạt động của hệ thống.",
        "search_placeholder": "Tìm kiếm câu hỏi...",
        "no_questions": "Không tìm thấy câu hỏi phù hợp.",
        "still_questions_title": "Vẫn còn câu hỏi thắc mắc?",
        "still_questions_desc": "Đừng ngần ngại liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi để được giải đáp tận tình.",
        "get_in_touch": "Liên hệ với chúng tôi",
        "categories": {
          "all": "Tất cả chủ đề",
          "start": "Bắt đầu",
          "interview": "Phỏng vấn",
          "vip": "Tài khoản VIP",
          "tech": "Kỹ thuật"
        },
        "faqs": {
          "1": {
            "question": "Làm thế nào để bắt đầu một buổi phỏng vấn thử?",
            "answer": "Bạn chỉ cần truy cập vào mục \"Luyện phỏng vấn\", tải lên CV của bạn định dạng PDF, dán nội dung mô tả công việc (JD) bạn đang hướng tới, chọn vị trí và cấp bậc thích hợp. Sau đó nhấn \"Khởi tạo Phiên\" để bắt đầu."
          },
          "2": {
            "question": "Hệ thống phỏng vấn AI hoạt động như thế nào?",
            "answer": "Sau khi khởi động, AI sẽ sử dụng mô hình ngôn ngữ tiên tiến để phân tích CV & JD của bạn nhằm trích xuất các kỹ năng cần thiết. AI sẽ đưa ra câu hỏi, bạn trả lời bằng giọng nói hoặc gõ chữ. AI sẽ liên tục đặt câu hỏi đào sâu hoặc vặn vẹo (follow-up questions) dựa trên những gì bạn trả lời trước khi chuyển sang câu hỏi tiếp theo."
          },
          "3": {
            "question": "Tài khoản Premium VIP có lợi ích gì?",
            "answer": "Tài khoản VIP sẽ mở khóa số lượt phỏng vấn không giới hạn, sử dụng mô hình AI cao cấp nhất (GPT-4o) để phân tích chi tiết hơn, hỗ trợ tương tác nói chuyện qua giọng nói thời gian thực (Voice-to-Voice), và cho phép xuất/tải báo cáo phân tích CV nâng cao không giới hạn."
          },
          "4": {
            "question": "Làm thế nào tôi có thể xem lại kết quả phỏng vấn trước đây?",
            "answer": "Tất cả các phiên phỏng vấn đã hoàn tất đều được lưu trữ trong \"Lịch sử Phỏng vấn\" (Results). Tại đó bạn có thể xem điểm số tổng, điểm độ khớp CV, và bảng phân tích ưu nhược điểm chi tiết từng câu trả lời cùng gợi ý cải thiện từ chuyên gia AI."
          },
          "5": {
            "question": "Tôi có cần cấp quyền sử dụng camera và micro không?",
            "answer": "Có, để đảm bảo trải nghiệm chân thực nhất và giúp AI phân tích phong thái phỏng vấn (pacing, nhịp độ thở, filler words), bạn nên cấp quyền truy cập webcam và mic. Tuy nhiên, nếu không muốn, bạn vẫn có thể tắt camera và nhập câu trả lời bằng văn bản."
          },
          "6": {
            "question": "Tôi có thể tải lên file CV định dạng Docx không?",
            "answer": "Hiện tại hệ thống chỉ hỗ trợ phân tích và hiển thị trực tiếp file định dạng PDF để đảm bảo tính nhất quán về bố cục hiển thị và cấu trúc văn bản. Bạn có thể dễ dàng chuyển đổi file Word/Docx của mình sang PDF trước khi tải lên."
          }
        }
      },
      "privacy_page": {
        "title": "Chính Sách Bảo Mật",
        "desc": "Tìm hiểu cách chúng tôi thu thập, bảo vệ thông tin và tôn trọng quyền riêng tư của bạn.",
        "last_updated": "Cập nhật lần cuối: 22 tháng 5, 2026",
        "intro": "Chào mừng bạn đến với Obsidian AI. Việc bảo vệ thông tin cá nhân và dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi. Tài liệu này mô tả chi tiết cách thức chúng tôi xử lý thông tin cá nhân thu thập được trong quá trình bạn sử dụng hệ thống phỏng vấn giả lập của chúng tôi.",
        "footer_contact": "Mọi thắc mắc về Chính sách bảo mật, vui lòng gửi email về support@obsidianai.com",
        "sections": {
          "1": {
            "title": "1. Thông tin chúng tôi thu thập",
            "content": "Chúng tôi thu thập thông tin để cung cấp dịch vụ tốt hơn cho người dùng. Bao gồm: Thông tin tài khoản (Họ tên, email, mật khẩu mã hóa), Hồ sơ cá nhân (CV/Resume tải lên định dạng PDF), và Dữ liệu phiên phỏng vấn (Nội dung câu trả lời, bản ghi âm giọng nói hoặc hình ảnh camera nếu được cấp quyền để phân tích phong thái)."
          },
          "2": {
            "title": "2. Cách chúng tôi sử dụng thông tin",
            "content": "Dữ liệu của bạn được dùng để chạy quy trình phỏng vấn thử nghiệm bằng trí tuệ nhân tạo, đối khớp CV & JD để phát hiện khoảng trống kỹ năng, gửi báo cáo phân tích hiệu suất qua email của bạn, và cải thiện độ chính xác của các thuật toán nhận dạng giọng nói hoặc phản hồi phỏng vấn của chúng tôi."
          },
          "3": {
            "title": "3. Bảo mật & Lưu trữ dữ liệu",
            "content": "Tất cả dữ liệu hồ sơ CV và bản ghi âm giọng nói của bạn được mã hóa an toàn khi truyền tải và lưu trữ (encryption at rest & in transit). Chúng tôi cam kết không chia sẻ thông tin cá nhân của bạn với bên thứ ba ngoại trừ các nhà cung cấp dịch vụ xử lý dữ liệu đám mây đáng tin cậy phục vụ vận hành hệ thống."
          },
          "4": {
            "title": "4. Quyền kiểm soát của bạn",
            "content": "Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình. Bạn có thể truy cập \"Kho lưu trữ CV\" để xóa vĩnh viễn bất kỳ CV nào đã tải lên, xem lại hoặc xóa lịch sử phỏng vấn, chỉnh sửa thông tin cá nhân trong mục cài đặt, hoặc yêu cầu xóa bỏ hoàn toàn tài khoản bất kỳ lúc nào."
          },
          "5": {
            "title": "5. Thay đổi chính sách bảo mật",
            "content": "Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian để phù hợp với sự thay đổi về mặt kỹ thuật hoặc pháp lý. Mọi thay đổi lớn sẽ được thông báo rõ ràng trên trang chủ hoặc gửi email trực tiếp tới bạn."
          }
        }
      },
      "terms_page": {
        "title": "Điều Khoản Dịch Vụ",
        "desc": "Vui lòng đọc kỹ các điều khoản sử dụng hệ thống trước khi bắt đầu hành trình ôn luyện.",
        "last_updated": "Cập nhật lần cuối: 22 tháng 5, 2026",
        "intro": "Chào mừng bạn đến với Obsidian AI. Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn được xem là đã đồng ý và chịu sự ràng buộc bởi các điều khoản nêu dưới đây. Các điều khoản này áp dụng cho toàn bộ người dùng đăng ký hoặc tham gia phòng phỏng vấn của chúng tôi.",
        "footer_contact": "Mọi câu hỏi liên quan đến Điều khoản dịch vụ, vui lòng liên hệ support@obsidianai.com",
        "sections": {
          "1": {
            "title": "1. Chấp nhận các Điều khoản",
            "content": "Bằng việc đăng ký tài khoản và sử dụng nền tảng Obsidian AI, bạn đồng ý tuân thủ các Điều khoản dịch vụ này cùng Chính sách bảo mật của chúng tôi. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức."
          },
          "2": {
            "title": "2. Quy tắc sử dụng công bằng & Phát hiện gian lận",
            "content": "Obsidian AI được thiết kế cho mục đích học tập cá nhân. Trong các phiên phỏng vấn thử nghiệm, hệ thống của chúng tôi giám sát hành vi chuyển tab để đánh giá thái độ trung thực. Bạn đồng ý không sử dụng các công cụ tự động (bots), cào dữ liệu (scraping), hoặc các hình thức quay màn hình phân phối nội dung bất hợp pháp."
          },
          "3": {
            "title": "3. Thanh toán gói VIP & Gia hạn",
            "content": "Một số tính năng nâng cao yêu cầu đăng ký gói VIP trả phí. Chi phí đăng ký được tính theo tháng và có thể tự động gia hạn trừ khi bạn hủy trước ngày thanh toán tiếp theo. Tất cả các giao dịch mua gói dịch vụ đều không được hoàn lại tiền trừ trường hợp lỗi hệ thống phát sinh từ phía chúng tôi."
          },
          "4": {
            "title": "4. Giới hạn trách nhiệm của AI",
            "content": "Kết quả chấm điểm, độ khớp CV, và các lời khuyên chuyên gia đều do trí tuệ nhân tạo (AI) tính toán mang tính chất tham khảo học tập. Chúng tôi không cam kết hoặc đảm bảo rằng bạn chắc chắn sẽ vượt qua các kỳ phỏng vấn thực tế hoặc tìm được việc làm nhờ sử dụng nền tảng này."
          },
          "5": {
            "title": "5. Chấm dứt quyền sử dụng",
            "content": "Chúng tôi bảo lưu quyền đình chỉ hoặc chấm dứt vĩnh viễn tài khoản của bạn mà không cần báo trước nếu phát hiện hành vi vi phạm nghiêm trọng (như gian lận hệ thống, tấn công từ chối dịch vụ DDoS, hoặc quấy rối thành viên khác trên Diễn đàn)."
          }
        }
      },
      "test_page": {
        "title": "Thử nghiệm Face-API.js",
        "desc": "Trang kiểm tra nhận diện khuôn mặt và cảm xúc thời gian thực sử dụng mạng nơ-ron cục bộ.",
        "model_status": "Trạng thái mô hình",
        "ai_models_label": "Mô hình AI:",
        "load_error": "Lỗi Tải",
        "ready": "Đã Sẵn Sàng",
        "loading": "Đang Tải...",
        "camera_stream_label": "Camera stream:",
        "active": "Hoạt Động",
        "inactive": "Đang Tắt",
        "error_network": "Lỗi: {{error}}. Kiểm tra cấu hình CORS/Mạng.",
        "start_camera": "Mở Camera",
        "stop_camera": "Tắt Camera",
        "expression_analysis": "Phân Tích Cảm Xúc",
        "faces_detected": "Số khuôn mặt:",
        "no_face_detected": "Chưa nhận diện được khuôn mặt",
        "video_placeholder": "Bấm nút \"Mở Camera\" để truyền nguồn cấp video và thực thi kiểm tra khuôn mặt.",
        "models_loaded": "Đã tải xong mô hình nhận diện khuôn mặt!",
        "models_load_error": "Không thể tải mô hình. Vui lòng kiểm tra kết nối mạng.",
        "camera_access_denied": "Không thể truy cập camera. Vui lòng cấp quyền.",
        "expressions": {
          "neutral": "Bình thường",
          "happy": "Vui vẻ",
          "sad": "Buồn bã",
          "angry": "Giận dữ",
          "fearful": "Sợ hãi",
          "disgusted": "Ghê tởm",
          "surprised": "Ngạc nhiên"
        }
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
