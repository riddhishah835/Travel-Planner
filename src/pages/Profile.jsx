import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, MapPin, Wallet, Compass, Leaf, Loader2, CheckCircle } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'culture', label: 'Culture & Museums' },
  { id: 'history', label: 'Historical Sites' },
  { id: 'beaches', label: 'Beaches & Ocean' },
  { id: 'adventure', label: 'Adventure & Outdoors' },
  { id: 'food', label: 'Food & Culinary' },
];

const Profile = () => {
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    homeCity: '',
    preferredBudget: 'Medium',
    travelStyle: 'Relaxed',
    interests: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            homeCity: data.homeCity || '',
            preferredBudget: data.preferredBudget || 'Medium',
            travelStyle: data.travelStyle || 'Relaxed',
            interests: data.interests || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interestId) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interestId);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interestId) };
      } else {
        return { ...prev, interests: [...prev.interests, interestId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...formData,
        email: currentUser.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-teal-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        You must be logged in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <User className="text-teal-600 w-8 h-8" />
          Your Traveler Profile
        </h1>
        <p className="text-gray-500 mt-2">
          Tell us about your preferences so our AI can personalize your itineraries.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 h-24 border-b border-teal-100"></div>
        
        <form onSubmit={handleSubmit} className="px-8 pb-8 -mt-10">
          <div className="w-20 h-20 bg-white rounded-full border-4 border-teal-50 flex items-center justify-center shadow-md mb-6 overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-teal-600">
                {formData.name ? formData.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
              </span>
            )}
          </div>

          {message && (
            <div className="mb-6 bg-teal-50 text-teal-700 p-4 rounded-xl flex items-center gap-3 border border-teal-200 animate-fade-in-down">
              <CheckCircle className="w-5 h-5 text-teal-500" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Personal Info Section */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-teal-500" />
                Personal Information
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={currentUser.email || ''}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Home City (Optional)
              </label>
              <input
                type="text"
                name="homeCity"
                value={formData.homeCity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="Where are you flying out from?"
              />
            </div>

            {/* Travel Preferences Section */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <Compass className="w-5 h-5 text-teal-500" />
                Travel Preferences
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                Preferred Budget
              </label>
              <select
                name="preferredBudget"
                value={formData.preferredBudget}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
              >
                <option value="Low">Low / Backpacker</option>
                <option value="Medium">Medium / Standard</option>
                <option value="High">High / Luxury</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-gray-400" />
                Travel Style
              </label>
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'travelStyle', value: 'Fast-paced' } })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    formData.travelStyle === 'Fast-paced' 
                      ? 'bg-white text-teal-700 shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fast-paced 🏃‍♂️
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'travelStyle', value: 'Relaxed' } })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    formData.travelStyle === 'Relaxed' 
                      ? 'bg-white text-teal-700 shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Relaxed 🏖️
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-medium text-gray-700">Specific Interests</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map(interest => (
                  <label 
                    key={interest.id}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.interests.includes(interest.id)
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.interests.includes(interest.id)}
                      onChange={() => handleInterestChange(interest.id)}
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${
                      formData.interests.includes(interest.id)
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {formData.interests.includes(interest.id) && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{interest.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-3 rounded-xl font-bold shadow-md shadow-teal-500/20 text-white transition-all transform flex items-center gap-2 ${
                saving 
                  ? 'bg-teal-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:-translate-y-0.5'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
