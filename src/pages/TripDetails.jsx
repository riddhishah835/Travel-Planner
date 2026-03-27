import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, Layout, Receipt, StickyNote, Wand2, Paperclip } from 'lucide-react';

import OverviewSection from '../components/TripDetails/OverviewSection';
import BudgetSection from '../components/TripDetails/BudgetSection';
import NotesSection from '../components/TripDetails/NotesSection';
import ItinerarySection from '../components/TripDetails/ItinerarySection';
import DocumentsSection from '../components/TripDetails/DocumentsSection';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'budget', label: 'Budget', icon: Receipt },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'itinerary', label: 'Itinerary', icon: Wand2 },
  { id: 'documents', label: 'Documents', icon: Paperclip },
];

const TripDetails = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!currentUser || !tripId) return;
      try {
        const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        if (tripSnap.exists()) {
          setTrip({ id: tripSnap.id, ...tripSnap.data() });
        } else {
          console.error("Trip not found");
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [currentUser, tripId]);

  const handleGenerateItinerary = async () => {
    if (!trip) return;
    setGenerating(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isMockMode = !apiKey || apiKey.trim() === '';

    const destinationsStr = trip.destinations ? trip.destinations.join(', ') : trip.destination;
    const prompt = `Generate a comprehensive, day-by-day travel itinerary for a trip to ${destinationsStr} from ${trip.startDate} to ${trip.endDate}. We are traveling with ${trip.peopleCount} people. Our total budget is $${trip.budgetAmount || trip.budget}. Our travel style is ${trip.travelStyle}. We are interested in: ${trip.interests?.join(', ')}. 
    
    IMPORTANT: Return ONLY a raw JSON array. Do not wrap it in markdown backticks. 
    Format identically to this structure:
    [
      {
        "day": "Day 1",
        "theme": "Arrival & Acclimation",
        "morning": { "activity": "Airport Arrival", "description": "Settle into your hotel." },
        "afternoon": { "activity": "City Center Walk", "description": "Explore the main plaza." },
        "evening": { "activity": "Welcome Dinner", "description": "Enjoy local cuisine." }
      }
    ]
    `;

    try {
      let parsedItinerary = [];

      if (isMockMode) {
        // Mock generation logic
        await new Promise(r => setTimeout(r, 2000));
        parsedItinerary = [
          {
            day: "Day 1",
            theme: "Welcome to Paradise",
            morning: { activity: "Arrival & Check-in", description: "Settle into your beautiful resort and enjoy a welcome drink by the pool." },
            afternoon: { activity: "Coastal Walk", description: "Take a relaxed stroll down the coastline to acclimatize to the tropical weather." },
            evening: { activity: "Sunset Dinner", description: "Enjoy fresh seafood cuisine at a local beachfront restaurant celebrating your arrival." }
          },
          {
            day: "Day 2",
            theme: "Adventure Awaits",
            morning: { activity: "Snorkeling Tour", description: "Head out early to explore vibrant coral reefs and marine life." },
            afternoon: { activity: "Local Market Visit", description: "Discover unique souvenirs and taste street food delicacies." },
            evening: { activity: "Cultural Show", description: "Attend a traditional fire-dancing and local music performance." }
          }
        ];
      } else {
        // Real API Call
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        let rawText = data.candidates[0].content.parts[0].text;
        // Clean JSON formatting
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedItinerary = JSON.parse(rawText);
      }

      // Save structured JSON array to Firestore
      const tripRef = doc(db, 'users', currentUser.uid, 'trips', tripId);
      await updateDoc(tripRef, { itineraryData: parsedItinerary });
      
      // Update local state
      setTrip(prev => ({ ...prev, itineraryData: parsedItinerary }));

    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      alert("Failed to generate itinerary. Ensure API key is correct and prompt generation completed successfully.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-gray-800">Trip not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-teal-600 hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  const destString = trip.destinations ? trip.destinations.join(', ') : trip.destination;
  const isLegacyMarkdown = typeof trip.itineraryData === 'string';
  const hasItinerary = Array.isArray(trip.itineraryData) && trip.itineraryData.length > 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-24">
      
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-teal-600 font-medium hover:text-teal-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Adventures
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl shadow-lg border border-teal-50 overflow-hidden mb-12">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-8 sm:p-12 text-white relative">
          {/* Abstract background shape for premium look */}
          <div className="absolute top-0 right-0 opacity-10 blur-3xl w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">{trip.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-teal-50 font-medium text-lg">
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm"><MapPin className="w-5 h-5" /> {destString}</span>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm"><Calendar className="w-5 h-5" /> {trip.startDate} to {trip.endDate}</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 flex gap-8 shadow-2xl border border-white/20 lg:min-w-[300px]">
              <div className="flex-1 text-center">
                <p className="text-teal-100 text-sm font-bold uppercase tracking-wider mb-2">Budget</p>
                <p className="text-3xl font-bold">${trip.budgetAmount || 'N/A'}</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="flex-1 text-center">
                <p className="text-teal-100 text-sm font-bold uppercase tracking-wider mb-2">Travelers</p>
                <p className="text-3xl font-bold flex items-center justify-center gap-2"><Users className="w-6 h-6"/> {trip.peopleCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="px-8 sm:px-12 py-6 bg-teal-50/50 border-b border-teal-50 flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-white border border-teal-100 text-teal-700 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <Compass className="w-4 h-4" /> {trip.travelStyle}
          </span>
          {trip.interests?.map(interest => (
            <span key={interest} className="px-4 py-2 bg-white border border-cyan-100 text-cyan-700 rounded-xl text-sm font-bold capitalize shadow-sm">
              {interest.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* AI Generate Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-teal-500" />
            Your Intelligent Itinerary
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Curated daily plans designed to maximize your adventure.</p>
        </div>
        
        <button 
          onClick={handleGenerateItinerary}
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

      {/* Legacy Fallback for markdown strings */}
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

      {/* Magic JSON Cards Rendering */}
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
                
                {/* Morning Card */}
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
                
                {/* Afternoon Card */}
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
                
                {/* Evening Card */}
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

export default TripDetails;
