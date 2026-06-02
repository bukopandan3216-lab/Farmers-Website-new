import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { applicationApi } from '../services/api';

export const ApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'form' | 'success'>('role');
  const [role, setRole] = useState<'BUYER' | 'FARMER' | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notificationPreference: 'EMAIL',
    profileImage: null as File | null,
    profileImagePreview: '' as string | null,
    // Farmer specific
    farmName: '',
    farmAddress: '',
    description: '',
    commissionFrequency: 'MONTHLY',
    validId: null as File | null,
    validIdPreview: '' as string | null,
    photoWithId: null as File | null,
    photoWithIdPreview: '' as string | null,
    businessPermit: null as File | null,
    businessPermitPreview: '' as string | null,
  });

  const handleRoleSelect = (selectedRole: 'BUYER' | 'FARMER') => {
    setRole(selectedRole);
    setStep('form');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Preview`]: preview,
      } as any));
    }
  };

  const validateForm = (): boolean => {
    // Common validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }

    // Farmer-specific validation
    if (role === 'FARMER') {
      if (!formData.farmName.trim()) {
        setError('Farm name is required');
        return false;
      }

      if (!formData.farmAddress.trim()) {
        setError('Farm address is required');
        return false;
      }

      if (!formData.description.trim()) {
        setError('Farm description is required');
        return false;
      }

      if (!formData.validId) {
        setError('Valid ID upload is required');
        return false;
      }

      if (!formData.photoWithId) {
        setError('A selfie holding your ID is required');
        return false;
      }
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
      const uploadedProfileImageUrl = formData.profileImage
        ? await applicationApi.uploadFile('profiles', formData.profileImage)
        : null;
      const uploadedValidIdUrl = formData.validId
        ? await applicationApi.uploadFile('ids', formData.validId)
        : null;
      const uploadedPhotoWithIdUrl = formData.photoWithId
        ? await applicationApi.uploadFile('ids', formData.photoWithId)
        : null;
      const uploadedBusinessPermitUrl = formData.businessPermit
        ? await applicationApi.uploadFile('permits', formData.businessPermit)
        : null;

      const response = await applicationApi.submit({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: role || 'BUYER',
        notificationPreference: formData.notificationPreference,
        commissionFrequency: role === 'FARMER' ? formData.commissionFrequency : undefined,
        profileImageUrl: uploadedProfileImageUrl?.url || null,
        farmName: formData.farmName || undefined,
        farmAddress: formData.farmAddress || undefined,
        description: formData.description || undefined,
        validIdUrl: uploadedValidIdUrl?.url || null,
        photoWithIdUrl: uploadedPhotoWithIdUrl?.url || null,
        businessPermitUrl: uploadedBusinessPermitUrl?.url || null,
      });

      setSuccessData(response);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Join FarmDirect</h1>
              <p className="text-lg text-gray-600">Select your account type to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer Option */}
              <button
                onClick={() => handleRoleSelect('BUYER')}
                className="p-8 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors mb-4">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Buyer Account</h3>
                <p className="text-gray-600">Browse and purchase fresh products from local farmers</p>
                <div className="mt-4 text-emerald-600 font-semibold text-sm">Get Started →</div>
              </button>

              {/* Farmer Option */}
              <button
                onClick={() => handleRoleSelect('FARMER')}
                className="p-8 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors mb-4">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m-8 4v10l8-4M9 5l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer/Seller Account</h3>
                <p className="text-gray-600">Sell your products and grow your farm business</p>
                <div className="mt-4 text-emerald-600 font-semibold text-sm">Get Started →</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Application Form */}
        {step === 'form' && role && (
          <div>
            <div className="mb-8">
              <button
                onClick={() => setStep('role')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2 mb-4"
              >
                ← Change Account Type
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {role === 'BUYER' ? 'Buyer' : 'Farmer/Seller'} Application
              </h1>
              <p className="text-gray-600 mt-2">Please fill out the form below to apply</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notification Preference *
                      </label>
                      <select
                        name="notificationPreference"
                        value={formData.notificationPreference}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notificationPreference: e.target.value as 'EMAIL' | 'PHONE' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="PHONE">Phone / SMS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profileImage')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      {formData.profileImagePreview && (
                        <div className="mt-2 h-32 rounded overflow-hidden border">
                          <img src={formData.profileImagePreview as string} alt="profile-preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </div>

              {/* Farmer-specific fields */}
              {role === 'FARMER' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm Name *
                      </label>
                      <input
                        type="text"
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Green Valley Farm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm Address *
                      </label>
                      <textarea
                        name="farmAddress"
                        value={formData.farmAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Enter your farm's location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Farm/Product Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Tell us about your farm and the products you sell..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission Frequency *
                      </label>
                      <select
                        name="commissionFrequency"
                        value={formData.commissionFrequency}
                        onChange={(e) => setFormData((prev) => ({ ...prev, commissionFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid ID (Government-issued) *
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileChange(e, 'validId')}
                          className="hidden"
                          id="validIdInput"
                        />
                        <label
                          htmlFor="validIdInput"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            Upload your ID (PDF or Image)
                          </span>
                          <span className="text-xs text-gray-500">Max 5MB</span>
                        </label>
                      </div>
                      {formData.validId && (
                        <p className="mt-2 text-sm text-emerald-600">✓ {formData.validId.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo Holding Your ID *
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'photoWithId')}
                          className="hidden"
                          id="photoWithIdInput"
                        />
                        <label
                          htmlFor="photoWithIdInput"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            Upload a selfie holding your ID
                          </span>
                          <span className="text-xs text-gray-500">Max 5MB</span>
                        </label>
                      </div>
                      {formData.photoWithId && (
                        <p className="mt-2 text-sm text-emerald-600">✓ {formData.photoWithId.name}</p>
                      )}
                      {formData.photoWithIdPreview && (
                        <div className="mt-2 h-36 rounded overflow-hidden border">
                          <img src={formData.photoWithIdPreview as string} alt="photo-with-id-preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Permit (Optional)
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileChange(e, 'businessPermit')}
                          className="hidden"
                          id="businessPermitInput"
                        />
                        <label
                          htmlFor="businessPermitInput"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            Upload your business permit (PDF or Image)
                          </span>
                          <span className="text-xs text-gray-500">Max 5MB</span>
                        </label>
                      </div>
                      {formData.businessPermit && (
                        <p className="mt-2 text-sm text-emerald-600">✓ {formData.businessPermit.name}</p>
                      )}
                      {formData.businessPermitPreview && (
                        <div className="mt-2 h-36 rounded overflow-hidden border">
                          <img src={formData.businessPermitPreview as string} alt="business-permit-preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Message */}
        {step === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
              <p className="text-gray-700 mb-4">
                Thank you for your application! We will review your information and send you a link to create your account when you are approved.
              </p>
              <p className="text-gray-600 font-semibold mb-2">What's next?</p>
              <ul className="text-gray-600 space-y-2 text-left max-w-md mx-auto">
                <li>✓ Your application is currently under review</li>
                <li>✓ We'll send you an approval link via {formData.notificationPreference === 'EMAIL' ? 'email' : 'SMS'}</li>
                <li>✓ Once you receive the link, you'll create your account</li>
                <li>✓ Then log in and start using FarmDirect</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Application ID: <span className="font-mono font-semibold">{successData?.id}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
