import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase/config';
import { collection, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Plus, Calendar, MapPin, Users, Wallet, Compass, PlaneTakeoff, Trash2 } from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'culture', label: 'Culture & Museums' },
  { id: 'history', label: 'Historical Sites' },
  { id: 'beaches', label: 'Beaches & Ocean' },
  { id: 'adventure', label: 'Adventure & Outdoors' },
  { id: 'food', label: 'Food & Culinary' },
];

const CreateTrip = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    destinations: [''],
    startDate: '',
    endDate: '',
    budget: 'Medium',
    budgetAmount: '',
    travelStyle: 'Relaxed',
    interests: [],
    peopleCount: 1
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData(prev => ({
            ...prev,
            budget: data.preferredBudget || 'Medium',
            travelStyle: data.travelStyle || 'Relaxed',
            interests: data.interests || []
          }));
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setFormData({ ...formData, destinations: newDestinations });
  };

  const addDestination = () => {
    setFormData({ ...formData, destinations: [...formData.destinations, ''] });
  };

  const removeDestination = (index) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData({ ...formData, destinations: newDestinations });
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

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return setError('End date must be after start date.');
    }

    if (formData.destinations.some(d => d.trim() === '')) {
      return setError('Please fill all destination fields.');
    }

    setSaving(true);
    setError('');

    try {
      const tripsRef = collection(db, 'users', currentUser.uid, 'trips');
      await addDoc(tripsRef, {
        ...formData,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      // Navigate to dashboard automatically upon success
      navigate('/');
    } catch (err) {
      console.error("Error creating trip:", err);
      setError("Failed to create trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-teal-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium text-gray-600">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12 w-full pt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <PlaneTakeoff className="text-teal-600 w-8 h-8" />
          Plan a New Adventure
        </h1>
        <p className="text-gray-500 mt-2">
          Tell us about your next destination and we'll help you organize everything.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-50">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8 text-white relative overflow-hidden">
           {/* Abstract palm tree background pattern */}
           <div className="absolute -top-10 -right-10 opacity-10">
             <PlaneTakeoff className="w-48 h-48 transform rotate-12" />
           </div>
           <h2 className="text-2xl font-bold relative z-10">Where to next?</h2>
           <p className="text-teal-100 font-medium relative z-10">We've pre-filled your preferences.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Basic Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Trip Details</h3>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Trip Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
                placeholder="e.g. Summer in Kyoto"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" /> Destinations
                </label>
                <button 
                  type="button" 
                  onClick={addDestination}
                  className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:text-teal-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Place
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.destinations.map((dest, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={dest}
                      onChange={(e) => handleDestinationChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
                      placeholder={`Destination ${index + 1} (e.g. Paris)`}
                    />
                    {formData.destinations.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeDestination(index)} 
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" /> Number of Travelers
              </label>
              <input
                type="number"
                name="peopleCount"
                required
                min="1"
                value={formData.peopleCount}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
              />
            </div>
            
            {/* Spacer */}
            <div className="hidden md:block"></div> 

            {/* Travel Preferences Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Trip Preferences</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-600" /> Total Budget Amount (USD)
              </label>
              <input
                type="number"
                name="budgetAmount"
                required
                min="0"
                value={formData.budgetAmount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-600" /> Travel Style
              </label>
              <div className="flex bg-gray-200/50 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'travelStyle', value: 'Fast-paced' } })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    formData.travelStyle === 'Fast-paced' 
                      ? 'bg-white text-teal-700 shadow border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fast-paced 🏃‍♂️
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'travelStyle', value: 'Relaxed' } })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    formData.travelStyle === 'Relaxed' 
                      ? 'bg-white text-teal-700 shadow border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Relaxed 🏖️
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 mt-2">
              <label className="text-sm font-medium text-gray-700">Activities & Interests</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map(interest => (
                  <label 
                    key={interest.id}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.interests.includes(interest.id)
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500 shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-300 hover:bg-white'
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
                        : 'border-gray-300 bg-white'
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
              className={`px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 text-white transition-all transform flex items-center gap-2 ${
                saving 
                  ? 'bg-teal-400 cursor-not-allowed scale-100' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:scale-[1.02]'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Trip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
