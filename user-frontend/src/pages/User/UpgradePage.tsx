import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';
import { Button, Card, Badge } from '../../components/base';

const UpgradePage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVip, setIsVip] = useState(false);
  const [vipPlan, setVipPlan] = useState('none');
  const [vipExpiresAt, setVipExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'weekly', 'monthly', '3month'
  
  const isVi = i18n.language.startsWith('vi');

  const status = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  const checkVipStatus = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME);
      if (res.ok) {
        const data = await res.json();
        setIsVip(data.isVip || false);
        setVipPlan(data.vipPlan || 'none');
        setVipExpiresAt(data.vipExpiresAt || null);
      }
    } catch (error) {
      console.error('Error checking VIP status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleVerifyAndCheck = async () => {
      if (status === 'success' && sessionId) {
        setIsVerifyingPayment(true);
        try {
          const res = await fetchWithAuth(API_ENDPOINTS.PAYMENT.VERIFY_SESSION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          
          if (res.ok) {
            const data = await res.json();
            setIsVip(data.user.isVip || false);
            setVipPlan(data.user.vipPlan || 'none');
            setVipExpiresAt(data.user.vipExpiresAt || null);
            
            localStorage.setItem('isVip', 'true');
            localStorage.setItem('userVip', 'true');
            window.dispatchEvent(new Event('userUpdate'));
            
            toast.success(isVi ? 'Chúc mừng! Bạn đã nâng cấp thành công gói VIP! 🌟' : 'Congratulations! You successfully upgraded to VIP! 🌟');
          } else {
            const errData = await res.json().catch(() => ({}));
            toast.error(errData.message || (isVi ? 'Xác thực thanh toán thất bại.' : 'Payment verification failed.'));
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast.error(isVi ? 'Đã xảy ra lỗi kết nối khi xác thực.' : 'A connection error occurred during verification.');
        } finally {
          setIsVerifyingPayment(false);
          setSearchParams({});
        }
      } else if (status === 'cancel') {
        toast.error(isVi ? 'Thanh toán đã bị hủy.' : 'Payment was cancelled.');
        setSearchParams({});
        checkVipStatus();
      } else {
        checkVipStatus();
      }
    };

    handleVerifyAndCheck();
  }, [status, sessionId]);

  const handleUpgradeToggle = async (targetVipStatus: boolean, plan?: string) => {
    // Downgrade only
    if (targetVipStatus === true) return;

    setProcessing(true);
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.UPGRADE_VIP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip: targetVipStatus, plan })
      });

      if (res.ok) {
        const data = await res.json();
        setIsVip(data.isVip || false);
        setVipPlan(data.vipPlan || 'none');
        setVipExpiresAt(data.vipExpiresAt || null);
        
        // Notify other components (like Header/Sidebar) of the VIP status change
        localStorage.setItem('isVip', data.isVip ? 'true' : 'false');
        localStorage.setItem('userVip', data.isVip ? 'true' : 'false');
        window.dispatchEvent(new Event('userUpdate'));
        
        toast.success(isVi ? 'Tài khoản của bạn đã được chuyển về gói thường.' : 'Your account has been downgraded to Standard.');
      } else {
        toast.error(isVi ? 'Thao tác thất bại. Vui lòng thử lại.' : 'Action failed. Please try again.');
      }
    } catch (error) {
      toast.error(isVi ? 'Đã xảy ra lỗi kết nối.' : 'A connection error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInitiateStripeCheckout = async (plan: string) => {
    setProcessing(true);
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(isVi ? 'Không lấy được liên kết thanh toán.' : 'Could not retrieve payment checkout URL.');
          setProcessing(false);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || (isVi ? 'Thao tác thất bại. Vui lòng thử lại.' : 'Action failed. Please try again.'));
        setProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(isVi ? 'Đã xảy ra lỗi kết nối.' : 'A connection error occurred.');
      setProcessing(false);
    }
  };

  const getPlanName = (plan?: string) => {
    if (plan === 'weekly') return isVi ? 'Luyện thi Cấp tốc (7 Ngày)' : 'Weekly Bootcamp (7 Days)';
    if (plan === '3month') return isVi ? 'Bứt phá Sự nghiệp (3 Tháng)' : '3-Month Career Boost';
    return isVi ? 'Chuẩn bị Dài hạn (30 Ngày)' : 'Monthly Pro (30 Days)';
  };

  const formatExpiresDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const vipFeatures = [
    isVi ? 'Phỏng vấn AI không giới hạn' : 'Unlimited AI Interviews',
    isVi ? 'Mô hình AI cao cấp (GPT-4o)' : 'Advanced AI Model (GPT-4o)',
    isVi ? 'Báo cáo Độ khớp chuyên sâu' : 'Deep Match Analysis',
    isVi ? 'Tương tác giọng nói thời gian thực' : 'Real-time Voice-to-Voice Interaction',
    isVi ? 'Hỗ trợ 24/7 chuyên nghiệp' : '24/7 Professional Support',
    isVi ? 'Phân tích chuyên sâu (Advanced Analytics)' : 'Advanced Analytics'
  ];

  const freeFeatures = [
    isVi ? 'Phỏng vấn AI giới hạn (3 lượt/tháng)' : 'Limited AI Interviews (3/month)',
    isVi ? 'Mô hình AI Tiêu chuẩn' : 'Standard AI Model',
    isVi ? 'Báo cáo Độ khớp cơ bản' : 'Basic Match Report',
    isVi ? 'Hỗ trợ cộng đồng' : 'Community Support'
  ];

  if (loading) {
    return (
      <div className="p-20 text-center font-bold opacity-50 uppercase tracking-widest animate-pulse">
        {t('results.loading')}
      </div>
    );
  }

  if (isVerifyingPayment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-black text-on-surface">
          {isVi ? 'Đang xác thực thanh toán...' : 'Verifying payment...'}
        </h2>
        <p className="text-on-surface-variant max-w-sm mx-auto text-sm opacity-80 font-medium">
          {isVi 
            ? 'Vui lòng không đóng trình duyệt. Hệ thống đang đồng bộ giao dịch của bạn với Stripe.'
            : 'Please do not close your browser. We are syncing your transaction with Stripe.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Page Title */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold tracking-wider uppercase mb-6 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          {isVi ? 'BẢNG GIÁ VIP' : 'PRICING PLANS'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4 leading-none">
          {isVi ? 'Nâng Cấp Gói VIP' : 'Upgrade VIP Plan'} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-surface to-secondary">
            {isVi ? 'Để Bứt Phá Sự Nghiệp' : 'To Accelerate Your Career'}
          </span>
        </h1>
        <p className="text-on-surface-variant text-sm max-w-xl mx-auto opacity-80 leading-relaxed font-medium">
          {isVi 
            ? 'Lựa chọn gói VIP phù hợp nhất để rèn luyện tư duy phản xạ phỏng vấn và mở rộng cơ hội thành công trước mọi nhà tuyển dụng.' 
            : 'Select the best VIP tier to practice interview response logic and secure your dream job.'}
        </p>
      </div>

      {/* Active VIP Status Bar */}
      {isVip && (
        <div className="max-w-2xl mx-auto mb-10 p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl">workspace_premium</span>
            <div>
              <h4 className="font-semibold text-on-surface text-sm">
                {isVi ? 'Tài khoản VIP đang hoạt động!' : 'VIP Account Active!'}
              </h4>
              <p className="text-xs text-on-surface-variant font-medium opacity-85">
                {isVi 
                  ? `Bạn đang sử dụng gói: ${getPlanName(vipPlan)}. Hết hạn vào ngày ${formatExpiresDate(vipExpiresAt)}` 
                  : `Current plan: ${getPlanName(vipPlan)}. Expires on ${formatExpiresDate(vipExpiresAt)}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleUpgradeToggle(false)}
            disabled={processing}
            className="text-[9px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {processing ? t('setup.analyzing') : (isVi ? 'Hạ cấp xuống gói Thường' : 'Downgrade to Standard')}
          </button>
        </div>
      )}

      {/* Pricing Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
        
        {/* Plan 1: Free Plan */}
        <div className={`bg-[#121214]/40 border rounded-xl p-8 flex flex-col transition-all duration-500 relative ${!isVip ? 'border-white/[0.08] shadow-sm' : 'border-white/[0.04]'}`}>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-on-surface mb-2">{isVi ? 'Gói Thường' : 'Free Standard'}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-on-surface">0 đ</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed opacity-70">
              {isVi ? 'Phù hợp để làm quen và trải nghiệm các tính năng cốt lõi.' : 'Perfect to explore core platform features.'}
            </p>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            {freeFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[16px]">check_circle</span>
                {f}
              </div>
            ))}
            <div className="flex items-center gap-2.5 text-xs text-on-surface-variant/30 font-medium italic">
              <span className="material-symbols-outlined text-[16px]">block</span>
              {isVi ? 'Phân tích chuyên sâu (Advanced Analytics)' : 'Advanced Analytics'}
            </div>
          </div>

          {!isVip ? (
            <button disabled className="w-full py-2.5 rounded-lg bg-white/[0.02] text-on-surface-variant font-semibold text-xs uppercase tracking-wider border border-white/[0.08] opacity-60">
              {isVi ? 'Gói hiện tại' : 'Current Plan'}
            </button>
          ) : (
            <button 
              onClick={() => handleUpgradeToggle(false)}
              disabled={processing}
              className="w-full py-2.5 rounded-lg bg-white/[0.02] text-on-surface hover:bg-red-500/10 hover:text-red-500 font-semibold text-xs uppercase tracking-wider border border-white/[0.08] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? t('setup.analyzing') : (isVi ? 'Hạ cấp' : 'Downgrade')}
            </button>
          )}
        </div>

        {/* Plan 2: Premium VIP Card */}
        <div className={`relative rounded-3xl p-8 flex flex-col transition-all duration-500 overflow-hidden ambient-shadow ${
          isVip 
            ? 'border-2 border-amber-500/40 bg-surface-container-low/90' 
            : 'border border-primary/30 bg-surface-container-low/90 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10'
        }`}>
          <div className="absolute top-5 right-5">
            <Badge variant="vip" icon="workspace_premium">
              {isVip ? (isVi ? 'Đang dùng' : 'Active') : (isVi ? 'Khuyên dùng' : 'Recommended')}
            </Badge>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          <div className="mb-6 mt-2">
            <h3 className={`text-xl font-headline font-black mb-2 ${isVip ? 'text-amber-500' : 'text-primary'}`}>
              {isVi ? 'Gói Premium VIP' : 'Premium VIP'}
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xs font-semibold text-on-surface-variant mr-1">{isVi ? 'Chỉ từ' : 'From only'}</span>
              <span className="text-4xl font-headline font-black text-on-surface tracking-tight">99.000 đ</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">
              {isVi ? 'Mở khóa toàn bộ sức mạnh của AI để phỏng vấn không giới hạn và nhận kết quả chi tiết nhất.' : 'Unlock the full power of AI to practice interviews with no limits and receive deep insights.'}
            </p>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            {vipFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-on-surface font-semibold">
                <span className={`material-symbols-outlined text-[18px] ${isVip ? 'text-amber-500' : 'text-primary'}`}>check_circle</span>
                {f}
              </div>
            ))}
          </div>

          {isVip ? (
            <div className="w-full py-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              {isVi ? 'Gói hiện tại' : 'Current Plan'}
            </div>
          ) : (
            <Button 
              onClick={() => setIsCheckoutModalOpen(true)}
              loading={processing}
              size="lg"
              variant="primary"
              icon="bolt"
              className="w-full shadow-lg shadow-primary/25"
            >
              {isVi ? 'Nâng cấp VIP ngay' : 'Upgrade VIP Now'}
            </Button>
          )}
        </div>

      </div>

      {/* Checkout Selection Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#09090b] border border-white/[0.08] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {isVi ? 'Chọn Thời Hạn VIP' : 'Select VIP Plan Duration'}
                </h3>
                <p className="text-xs text-on-surface-variant opacity-75 font-medium">
                  {isVi ? 'Mở khóa đặc quyền Premium VIP để bứt phá phỏng vấn' : 'Activate Premium VIP privileges now'}
                </p>
              </div>
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.04] flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              
              {/* Option 1: Weekly Bootcamp */}
              <div 
                onClick={() => setSelectedPlan('weekly')}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4 bg-white/[0.01] ${
                  selectedPlan === 'weekly' 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-white/[0.08] hover:border-primary/30'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'weekly' ? 'border-primary' : 'border-white/[0.2]'}`}>
                    {selectedPlan === 'weekly' && <div className="w-2 h-2 rounded-full bg-primary animate-in zoom-in"></div>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-on-surface text-sm">
                      {isVi ? 'Luyện Cấp Tốc (7 Ngày)' : 'Weekly Bootcamp (7 Days)'}
                    </h4>
                    <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-white/[0.04] text-on-surface-variant rounded">
                      {isVi ? 'Cấp tốc' : 'Bootcamp'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant opacity-70 leading-relaxed font-medium mb-1">
                    {isVi ? 'Dành cho ứng viên cần luyện khẩn cấp trước buổi phỏng vấn 1 tuần.' : 'Designed for candidates preparing for immediate interviews next week.'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-on-surface">99.000 đ</span>
                </div>
              </div>

              {/* Option 2: Monthly Pro */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4 bg-white/[0.01] ${
                  selectedPlan === 'monthly' 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-white/[0.08] hover:border-primary/30'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-primary' : 'border-white/[0.2]'}`}>
                    {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-primary animate-in zoom-in"></div>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-on-surface text-sm">
                      {isVi ? 'Chuẩn Bị Dài Hạn (30 Ngày)' : 'Monthly Pro (30 Days)'}
                    </h4>
                    <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded">
                      {isVi ? 'TIẾT KIỆM 50%' : 'SAVE 50%'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant opacity-70 leading-relaxed font-medium mb-1">
                    {isVi ? 'Tốt nhất để rèn luyện phản xạ phỏng vấn bền bỉ.' : 'Best for consistent long-term training of logical answering skill.'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-on-surface">199.000 đ</span>
                </div>
              </div>

              {/* Option 3: 3-Month Career Boost */}
              <div 
                onClick={() => setSelectedPlan('3month')}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4 bg-white/[0.01] ${
                  selectedPlan === '3month' 
                    ? 'border-amber-500 bg-amber-500/5 shadow-md' 
                    : 'border-white/[0.08] hover:border-amber-500/30'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === '3month' ? 'border-amber-500' : 'border-white/[0.2]'}`}>
                    {selectedPlan === '3month' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-in zoom-in"></div>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-on-surface text-sm">
                      {isVi ? 'Bứt Phá Sự Nghiệp (3 Tháng)' : '3-Month Career Boost (3 Months)'}
                    </h4>
                    <span className="px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-600 rounded">
                      {isVi ? 'TIẾT KIỆM 67%' : 'SAVE 67%'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant opacity-70 leading-relaxed font-medium mb-1">
                    {isVi ? 'Cam kết bứt phá, tối ưu chi phí học tập vượt trội.' : 'Ultimate training package to secure elite roles in tech companies.'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-on-surface">399.000 đ</span>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-white/[0.05] bg-white/[0.01] flex flex-col gap-4">
              <button 
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  handleInitiateStripeCheckout(selectedPlan);
                }}
                disabled={processing}
                className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {processing ? t('setup.analyzing') : (isVi ? 'Xác Nhận & Thanh Toán' : 'Confirm & Pay')}
              </button>
              
              <div className="flex justify-center items-center gap-6 grayscale opacity-45">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant mr-2">Secure Checkout</span>
                <span className="font-bold text-xs tracking-tighter">STRIPE</span>
                <span className="font-bold text-xs tracking-tighter">PAYPAL</span>
                <span className="font-bold text-xs tracking-tighter">VISA</span>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-24 text-center">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-10 opacity-40">Secure Payment Powered By</p>
        <div className="flex justify-center items-center gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span className="font-bold text-xl tracking-tighter">STRIPE</span>
          <span className="font-bold text-xl tracking-tighter">PAYPAL</span>
          <span className="font-bold text-xl tracking-tighter">VISA</span>
          <span className="font-bold text-xl tracking-tighter">MASTERCARD</span>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
