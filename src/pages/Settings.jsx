import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account</p>

        {/* Profile Card */}
        <div className="card mt-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
              {(user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Account</h3>
          <div className="card divide-y divide-gray-100">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full flex items-center justify-between py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔑</span>
                <span className="font-medium text-gray-800 text-sm">Change Password</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">About</h3>
          <div className="card divide-y divide-gray-100">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-gray-700">App Version</span>
              <span className="text-sm font-semibold text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-gray-700">Developer</span>
              <span className="text-sm font-semibold text-gray-900">Georg</span>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm text-gray-700">Subjects</span>
              <span className="text-sm font-semibold text-gray-900">4 (Economics, English, Govt, CRK)</span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-8">
          {!confirmOpen ? (
            <button onClick={() => setConfirmOpen(true)} disabled={loading} className="btn-danger">
              Sign Out
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-gray-700 font-medium">Are you sure you want to sign out?</p>
              <button onClick={handleSignOut} disabled={loading} className="btn-danger">
                {loading ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
              <button onClick={() => setConfirmOpen(false)} disabled={loading} className="btn-secondary">
                Cancel
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 pb-4">
          Post-UTME Quiz Practice • Developed by Georg
        </p>
      </div>
    </div>
  );
}