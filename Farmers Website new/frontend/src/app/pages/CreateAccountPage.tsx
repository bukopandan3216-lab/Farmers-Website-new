/*
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Mail, Eye, EyeOff, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { authApi } from '../services/api';

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFarmer, setIsFarmer] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    storeName: '',
  });

  // Verify application exists and is approved
  useEffect(() => {
    const verifyApplication = async () => {
      try {
        // If token is present, skip applicationId verification and show form
        if (token) {
          setStep('form');
          return;
        }

        if (!applicationId) {
          setError('Invalid application ID');
          setStep('error');
          return;
        }

        // You may want to add an API endpoint to verify the application exists and is approved
        // For now, we'll just proceed with the form
        setStep('form');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify application');
        setStep('error');
      }
    };

    verifyApplication();
  }, [applicationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (isFarmer && !formData.storeName.trim()) {
      setError('Store name is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (token) {
        await authApi.createAccountWithToken(token, {
          password: formData.password,
          storeName: isFarmer ? formData.storeName : undefined,
        });
      } else {
        const response = await authApi.createAccount(applicationId!, {
          password: formData.password,
          storeName: isFarmer ? formData.storeName : undefined,
        });
      }

      setStep('success');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create account. Please try again.'
      );
      setIsLoading(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Verifying your application...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account Created!
          </h1>
          <p className="text-gray-600 mb-6">
            Your account has been successfully created. You can now log in with your email and password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-emerald-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          </div>
          <p className="text-center text-gray-600 mb-6">
            Set your password to activate your FarmDirect account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isFarmer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name (Optional)
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Your farm/store name"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Keep your password secure and remember it for future logins.
          </p>
        </div>
      </div>
    </div>
  );
}
*/

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Lock, Clock } from 'lucide-react';
import { API_URL, authApi } from '../services/api';

// ─── Token verification endpoint ─────────────────────────────────────────────
// Calls the backend to validate a token BEFORE showing the form so users see
// a clear error (expired / already used) instead of hitting it on submit.
async function verifyToken(token: string): Promise<{ valid: boolean; role?: string; fullName?: string; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/applications/verify-token?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      return { valid: true, role: data.data?.role, fullName: data.data?.fullName };
    }
    const data = await res.json().catch(() => ({}));
    return { valid: false, error: data.message || 'Invalid or expired link.' };
  } catch {
    // If the verify endpoint doesn't exist yet, just show the form optimistically.
    // The real error will surface on submit if the token is bad.
    return { valid: true };
  }
}

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFarmer, setIsFarmer] = useState(false);
  const [applicantName, setApplicantName] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    storeName: '',
  });

  // ── Verify token / applicationId on mount ───────────────────────────────
  useEffect(() => {
    const verify = async () => {
      if (token) {
        // Token-based flow: verify token so we can show role-aware UI
        const result = await verifyToken(token);
        if (!result.valid) {
          setError(result.error || 'This link has expired or already been used. Please contact support.');
          setStep('error');
          return;
        }
        if (result.role === 'FARMER') setIsFarmer(true);
        if (result.fullName) setApplicantName(result.fullName);
        setStep('form');
        return;
      }

      if (!applicationId) {
        setError('No application ID or token found in this link. Please use the link from your approval email.');
        setStep('error');
        return;
      }

      // Legacy applicationId flow — just show the form
      setStep('form');
    };

    verify();
  }, [token, applicationId]);

  // ── Input handling ───────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!formData.password) { setError('Password is required'); return false; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    if (isFarmer && !formData.storeName.trim()) { setError('Store name is required'); return false; }
    return true;
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 8) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
    const score = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pwd)).length;
    if (score === 0) return { label: 'Weak', color: 'bg-orange-400', width: 'w-1/3' };
    if (score === 1) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-1/2' };
    if (score === 2) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (token) {
        await authApi.createAccountWithToken(token, {
          password: formData.password,
          storeName: isFarmer ? formData.storeName : undefined,
        });
      } else {
        await authApi.createAccount(applicationId!, {
          password: formData.password,
          storeName: isFarmer ? formData.storeName : undefined,
        });
      }
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
          <p className="text-gray-600">Verifying your link…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">Link Expired or Invalid</h1>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
            >
              Return Home
            </button>
            <p className="text-center text-sm text-gray-500">
              Need help?{' '}
              <a href="mailto:support@farmdirect.com" className="text-emerald-600 hover:underline">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-emerald-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Account Created!</h1>
          <p className="text-gray-600 mb-8">
            Your account is ready. Log in with your email and the password you just set.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition text-lg"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────
  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header card */}
        <div className="bg-emerald-600 rounded-t-2xl p-6 text-white text-center">
          <div className="bg-white/20 rounded-full p-3 w-14 h-14 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {applicantName ? `Welcome, ${applicantName}!` : 'Activate Your Account'}
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            {isFarmer ? 'Set your password to start selling on FarmDirect' : 'Set your password to start shopping on FarmDirect'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Strength indicator */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            {/* Store name — shown for FARMER accounts */}
            {isFarmer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store / Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g. Green Valley Farm"
                />
                <p className="text-xs text-gray-500 mt-1">This is the name buyers will see in the marketplace.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating your account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">⏱ Reminder:</span> This account setup link is valid for 24 hours. If it has expired, contact{' '}
            <a href="mailto:support@farmdirect.com" className="underline">support@farmdirect.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
