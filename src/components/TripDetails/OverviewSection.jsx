import React from 'react';
import { Calendar, MapPin, Users, Compass } from 'lucide-react';

const OverviewSection = ({ trip }) => {
  const destString = trip.destinations ? trip.destinations.join(', ') : trip.destination || 'Unknown';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-lg border border-teal-50 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-8 sm:p-12 text-white relative">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Trip Summary</h3>
          <p className="text-gray-600 leading-relaxed font-medium text-lg">
            This exciting adventure to {destString} spans from {trip.startDate} to {trip.endDate} for a group of {trip.peopleCount} 
            with a {trip.budget} budget. Get ready to experience {trip.travelStyle.toLowerCase()} paces and explore 
            the best of {trip.interests.map(i => i.replace('-', ' ')).join(', ')}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
