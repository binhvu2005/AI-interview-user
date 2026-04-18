import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Admin Data State
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token && name) {
      setUserName(name);
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/questions');
      const data = await res.json();
      if (res.ok) setQuestions(data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newQuestion,
          category: newCategory,
          difficulty: newDifficulty
        })
      });
      if (res.ok) {
        setNewQuestion('');
        fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to add question', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/questions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUserName(null);
    navigate('/login');
  };

  const firstName = userName ? userName.split(' ')[userName.split(' ').length - 1] : '';

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-md border-b border-outline-variant/15 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-on-surface">{t('app_name')}</span>
          <div className="flex gap-6 items-center">
            <a onClick={() => navigate('/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.dashboard')}</a>
            <a onClick={() => navigate('/cv-analysis')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.cv_match')}</a>
            <a onClick={() => navigate('/preparation')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.setup')}</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="text-on-surface-variant hover:text-primary font-bold transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 ml-2 uppercase text-xs" title="Toggle Language">
            {i18n.language === 'en' ? 'EN' : 'VI'}
          </button>
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 ml-2" title="Toggle Theme">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {userName && (
            <div className="flex items-center gap-4 relative">
              <span className="text-on-surface font-medium">{t('nav.hi')}, {firstName}</span>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors focus:outline-none">
                <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyPz5x4PBhVYD5STvbLUInbycvf3EdIahvnESGHsxcPGIF9PHdXIIIBJvfxOqHtDcZzIlJv2cA_6kyzGlHRQSY5qTvUpeZYggo3oEKTThgygxp6ENEjUQZnHFVveDB2F2GwYuw35Wm6bu_2vVzRvsJ9CJNgOCA8f1pQxGt3GTiFc6R6_krBDrEeW79qWCq6Az9RfjVah7lfgRr_EJTMkwz5cHVwNlksNcZbu9ATdvBnbshnw57luJiGy1HbKg-0vqi7Qq3F-IhvqbK" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-12 right-0 w-48 bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-lg py-2 flex flex-col z-50">
                  <button onClick={handleLogout} className="px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-2 w-full text-left">
                    <span className="material-symbols-outlined text-[18px]">logout</span> {t('sidebar.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* SideNavBar (Admin variant) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] sticky left-0 top-16 bg-background text-primary font-manrope text-sm w-64 border-r border-outline-variant/15">
          <div className="px-6 py-8 flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-error-container border border-error/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-error text-xl">admin_panel_settings</span>
            </div>
            <h2 className="text-lg font-black text-on-surface tracking-tight">System Admin</h2>
            <span className="text-on-surface-variant text-xs">Core Configuration</span>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border-r-4 border-primary transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px] material-symbols-fill text-primary">database</span>
              <span className="font-medium">Question Bank</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">group</span>
              <span>User Management</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span>System Analytics</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto min-h-screen bg-surface-container-lowest">
          <div className="max-w-5xl mx-auto px-8 py-16">
            
            <div className="mb-12 flex justify-between items-end">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold tracking-widest uppercase mb-4 border border-error/20">
                  <span className="material-symbols-outlined text-[14px]">security</span>
                  Admin Access Level
                </div>
                <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2 font-headline">
                  Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dim to-secondary">Bank</span>
                </h1>
                <p className="text-on-surface-variant text-base max-w-xl">
                  Manage the central repository of interview questions used by the AI engine.
                </p>
              </div>
            </div>

            {/* Add Question Form */}
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/15 shadow-sm mb-8">
              <h3 className="text-lg font-bold text-on-surface font-headline mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                Add New Question
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Question Text</label>
                  <textarea 
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    rows={3}
                    placeholder="E.g., Explain the virtual DOM in React..."
                    className="w-full bg-surface-container-highest border border-outline-variant/15 text-on-surface text-sm rounded-xl px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none resize-none" 
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Category</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 text-on-surface text-sm rounded-xl px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="DevOps">DevOps</option>
                      <option value="System Design">System Design</option>
                      <option value="Behavioral">Behavioral</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Difficulty</label>
                    <select 
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/15 text-on-surface text-sm rounded-xl px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dim transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">save</span>}
                    Save Question
                  </button>
                </div>
              </form>
            </div>

            {/* Questions List */}
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                <h3 className="font-bold text-on-surface font-headline">Existing Questions ({questions.length})</h3>
                <button onClick={fetchQuestions} className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {questions.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-sm">No questions found. Add one above.</div>
                ) : (
                  questions.map((q) => (
                    <div key={q._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-surface-container-highest transition-colors group">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold uppercase tracking-widest">{q.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${q.difficulty === 'Hard' ? 'bg-error/10 text-error' : q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-on-surface text-sm font-medium leading-relaxed">{q.text}</p>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q._id)} className="w-10 h-10 rounded-full bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant border border-outline-variant/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
