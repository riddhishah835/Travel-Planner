import React, { useState } from 'react';
import { Loader2, Wand2, Sun, Cloud, Moon } from 'lucide-react';
import { generateItinerary } from '../../services/aiService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../context/AuthContext';

const ItinerarySection = ({ trip, tripId, onUpdateTrip }) => {
  const { currentUser } = useAuth();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      const newItinerary = await generateItinerary(trip, setGenerating);
      const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
      await updateDoc(tripRef, { itineraryData: newItinerary });
      onUpdateTrip({ ...trip, itineraryData: newItinerary });
    } catch (error) {
      alert("Failed to generate itinerary. Ensure your API key is configured.");
    }
  };

  const isLegacyMarkdown = typeof trip.itineraryData === 'string';
  const hasItinerary = Array.isArray(trip.itineraryData) && trip.itineraryData.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-teal-500" />
            Your Intelligent Itinerary
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Curated daily plans designed to maximize your adventure.</p>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className={`px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center gap-3 text-lg ${
            generating 
              ? 'bg-teal-400 cursor-not-allowed transform-none' 
              : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:shadow-cyan-500/30 hover:scale-105 bg-[length:200%_auto] hover:bg-right'
          }`}
        >
          {generating ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Crafting Magic...</>
          ) : (
            <><Wand2 className="w-6 h-6" /> {trip.itineraryData ? 'Regenerate Plans' : 'Generate Plans'}</>
          )}
        </button>
      </div>

      {isLegacyMarkdown && (
        <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-3xl text-center shadow-inner mb-8">
          <Wand2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-amber-800 mb-2">Legacy Itinerary Detected</h3>
          <p className="text-amber-700 mb-6">Your current itinerary is using an outdated format. Please click 'Regenerate Plans' above to upgrade to the new colorful Smart Cards UI!</p>
        </div>
      )}

      {/* Empty State */}
      {!hasItinerary && !isLegacyMarkdown && (
        <div className="text-center py-20 border-2 border-dashed border-teal-200 rounded-3xl bg-teal-50/50 shadow-sm transition-all hover:bg-teal-50">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-teal-100">
             <Wand2 className="w-10 h-10 text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Blank Canvas</h3>
          <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
            Hit the magic button above, and let AI craft a stunning morning, afternoon, and evening schedule just for you.
          </p>
        </div>
      )}

      {/* Structured Day Cards */}
      {hasItinerary && (
        <div className="space-y-12">
          {trip.itineraryData.map((dayPlan, idx) => (
            <div key={idx} className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-teal-50/50 transition-all hover:shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <span className="bg-teal-600 text-white px-5 py-2 rounded-xl text-xl font-black shadow-md shadow-teal-500/30 inline-flex items-center max-w-max">
                  {dayPlan.day}
                </span>
                <h3 className="text-2xl font-bold text-gray-700">{dayPlan.theme}</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                
                <div className="group bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-8 border border-amber-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-150 transition-transform duration-700 group-hover:rotate-12">
                     <Sun className="w-24 h-24 text-amber-500" />
                   </div>
                   <div className="relative z-10">
                     <div className="flex items-center gap-2 text-amber-600 mb-4 font-black tracking-wide uppercase text-sm">
                        <Sun className="w-5 h-5" /> Morning
                     </div>
                     <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">{dayPlan.morning.activity}</h4>
                     <p className="text-base text-gray-600 leading-relaxed font-medium">{dayPlan.morning.description}</p>
                   </div>
                </div>
                
                <div className="group bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100 rounded-3xl p-8 border border-sky-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-150 transition-transform duration-700 group-hover:rotate-12">
                     <Cloud className="w-24 h-24 text-sky-500" />
                   </div>
                   <div className="relative z-10">
                     <div className="flex items-center gap-2 text-sky-600 mb-4 font-black tracking-wide uppercase text-sm">
                        <Cloud className="w-5 h-5" /> Afternoon
                     </div>
                     <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">{dayPlan.afternoon.activity}</h4>
                     <p className="text-base text-gray-600 leading-relaxed font-medium">{dayPlan.afternoon.description}</p>
                   </div>
                </div>
                
                <div className="group bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-100 rounded-3xl p-8 border border-purple-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-150 transition-transform duration-700 group-hover:rotate-12">
                     <Moon className="w-24 h-24 text-purple-600" />
                   </div>
                   <div className="relative z-10">
                     <div className="flex items-center gap-2 text-purple-600 mb-4 font-black tracking-wide uppercase text-sm">
                        <Moon className="w-5 h-5" /> Evening
                     </div>
                     <h4 className="font-bold text-gray-800 text-xl mb-3 leading-tight">{dayPlan.evening.activity}</h4>
                     <p className="text-base text-gray-600 leading-relaxed font-medium">{dayPlan.evening.description}</p>
                   </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItinerarySection;
