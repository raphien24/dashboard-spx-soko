import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Plus, Trash2, Shield, Check, X, AlertCircle } from 'lucide-react';

const WhitelistSettings = () => {
  const { whitelist, updateWhitelist, user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    setError('');
    setSuccess('');

    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!isValidEmail(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (whitelist.includes(newEmail.toLowerCase())) {
      setError('Email already exists in whitelist');
      return;
    }

    const updatedList = [...whitelist, newEmail.toLowerCase()];
    updateWhitelist(updatedList);
    setNewEmail('');
    setSuccess(`Added ${newEmail} to whitelist`);

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveEmail = (email) => {
    // Prevent removing own email
    if (email === user?.email) {
      setError('You cannot remove your own email');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Prevent removing last email
    if (whitelist.length === 1) {
      setError('Cannot remove the last email from whitelist');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updatedList = whitelist.filter((e) => e !== email);
    updateWhitelist(updatedList);
    setSuccess(`Removed ${email} from whitelist`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddEmail();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Whitelist Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Manage authorized users for dashboard access
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Add Email Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Add New Email
        </h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddEmail}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Email
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
          Enter Google Workspace email addresses to grant access
        </p>
      </div>

      {/* Whitelist Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Authorized Users
            </h2>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
              {whitelist.length} {whitelist.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {whitelist.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-slate-400">
                No emails in whitelist
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
                Add an email to get started
              </p>
            </div>
          ) : (
            whitelist.map((email) => {
              const isCurrentUser = email === user?.email;
              return (
                <div
                  key={email}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                        {email}
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        Authorized user
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    disabled={isCurrentUser || whitelist.length === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      isCurrentUser || whitelist.length === 1
                        ? 'text-gray-400 dark:text-slate-600 cursor-not-allowed'
                        : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title={
                      isCurrentUser
                        ? 'Cannot remove your own email'
                        : whitelist.length === 1
                        ? 'Cannot remove last email'
                        : 'Remove from whitelist'
                    }
                  >
                    {isCurrentUser || whitelist.length === 1 ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Security Note
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Only whitelisted emails can access the dashboard</li>
              <li>• Users must sign in with their Google Workspace account</li>
              <li>• You cannot remove your own email from the whitelist</li>
              <li>• At least one email must remain in the whitelist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitelistSettings;
