import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await updateProfile({ firstName, lastName, bio });
    if (!res.success) setError(res.error || 'Failed to save');
    setSaving(false);
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadAvatar(file);
    if (!res.success) setError(res.error || 'Failed to upload avatar');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your profile settings</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {user?.avatar ? <img alt="avatar" src={user.avatar} className="w-full h-full object-cover" /> : null}
            </div>
            <label className="btn-outline text-sm cursor-pointer">
              Change Avatar
              <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            </label>
          </div>
        </div>

        <form onSubmit={onSave} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea rows={4} className="input-field" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

