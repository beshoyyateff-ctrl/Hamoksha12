import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const securityQuestion = StorageService.getSecurityQuestion();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (StorageService.verifyPassword(password)) {
      StorageService.setLoginSession(true);
      onSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مرة أخرى.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoverySuccess(null);

    const result = StorageService.resetPasswordWithSecurityAnswer(securityAnswer, newPassword);
    if (result.success) {
      setRecoverySuccess('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
      setPassword(newPassword);
      setIsForgotMode(false);
    } else {
      setError(result.error || 'فشلت عملية الاستعادة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md text-right overflow-y-auto">
      <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[400px] w-full p-5 shadow-2xl border border-[var(--border-medium)] text-[var(--text-on-dark)] relative">
        <div className="text-center space-y-2 mb-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--bg-card-elevated)] text-[var(--lemon-primary)] border border-[var(--border-medium)] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-[var(--text-on-dark)]">
            {isForgotMode ? 'استعادة كلمة مرور المدير' : 'تسجيل دخول لوحة التحكم'}
          </h2>
          <p className="text-xs text-[var(--text-muted-on-dark)]">
            {isForgotMode
              ? 'أجب عن سؤال الأمان لتعيين كلمة مرور جديدة لحساب حموكشة'
              : 'إدارة العروض والحملات والريلز والمعرض ورفع الصور والفيديوهات'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/75 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {recoverySuccess && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--lemon-olive)] text-[var(--lemon-bright)] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
            <span>{recoverySuccess}</span>
          </div>
        )}

        {!isForgotMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1.5">
                كلمة مرور المدير:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="input-lemon w-full text-base px-4 py-3 pl-11 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted-on-dark)] hover:text-[var(--lemon-primary)] cursor-pointer p-1"
                  aria-label="إظهار أو إخفاء كلمة المرور"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 bg-[var(--bg-section-dark)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                كلمة المرور الافتراضية:{' '}
                <code className="text-[var(--lemon-primary)] font-mono font-black">
                  hamoksha2026
                </code>
              </p>
            </div>

            <button
              type="submit"
              className="btn-lemon-primary w-full py-3.5 rounded-xl text-sm cursor-pointer min-h-[48px]"
            >
              دخول إلى لوحة التحكم
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsForgotMode(true);
                }}
                className="text-[var(--lemon-primary)] hover:text-[var(--lemon-bright)] underline font-bold cursor-pointer py-1"
              >
                نسيت كلمة المرور؟
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="text-[var(--text-muted-on-dark)] hover:text-[var(--text-on-dark)] font-bold cursor-pointer py-1"
              >
                العودة للموقع
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3.5 bg-[var(--bg-section-dark)] rounded-xl border border-[var(--border-medium)] text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--lemon-primary)]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>سؤال الأمان:</span>
              </div>
              <p className="font-bold text-[var(--text-on-dark)]">{securityQuestion}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                إجابة سؤال الأمان:
              </label>
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="اكتب الإجابة (الافتراضية: جهينة)"
                className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                كلمة المرور الجديدة:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 أحرف أو أرقام على الأقل"
                className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="btn-lemon-primary w-full py-3 rounded-xl text-sm cursor-pointer min-h-[46px]"
            >
              حفظ كلمة المرور الجديدة والدخول
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsForgotMode(false);
              }}
              className="w-full text-center text-xs text-[var(--text-muted-on-dark)] hover:text-[var(--text-on-dark)] font-bold py-2 cursor-pointer"
            >
              إلغاء والعودة لشاشة الدخول
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
