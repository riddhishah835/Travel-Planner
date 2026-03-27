import React from 'react';
import { Calendar, Wallet, Compass, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop', // Paris abstract
  'https://images.unsplash.com/photo-1540206351-d28x51d5?q=80&w=600&auto=format&fit=crop', // Tropical
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=600&auto=format&fit=crop', // Dubai
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600&auto=format&fit=crop', // Beach
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop', // Mountains
];

const getImageForDestination = (dest) => {
  if (!dest) return DEFAULT_IMAGES[0];
  const hash = dest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length];
};

const TripCard = ({ trip, onDelete }) => {
  const destString = trip.destinations ? trip.destinations.join(', ') : trip.destination || 'Unknown';
  const imageUrl = getImageForDestination(destString);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-teal-50 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-teal-100 group">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={destString} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }} 
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-all shadow-md"
            title="Delete Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold truncate tracking-wide">{trip.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-teal-50 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{destString}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4 text-teal-500" />
          <span>{trip.startDate} to {trip.endDate}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-teal-100">
            <Wallet className="w-3 h-3" />
            {trip.budgetAmount ? `$${trip.budgetAmount}` : trip.budget}
          </div>
          <div className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-cyan-100">
            <Compass className="w-3 h-3" />
            {trip.travelStyle}
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5">
        <Link 
          to={`/trips/${trip.id}`} 
          className="block w-full text-center py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-colors shadow-md shadow-teal-500/20"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TripCard;
