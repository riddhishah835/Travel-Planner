import React, { useState, useEffect } from 'react';
import { Palmtree, PlusCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import TripCard from '../components/TripCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const tripsRef = collection(db, 'users', currentUser.uid, 'trips');
    const q = query(tripsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'trips', tripId));
      } catch (err) {
        console.error("Error deleting trip:", err);
        alert("Failed to delete the trip.");
      }
    }
  };

  return (
    <div className="animate-fade-in pb-12 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6 mt-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Your Adventures
          </h1>
          {trips.length > 0 && !loading && (
            <span className="bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              {trips.length} Trip{trips.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button 
          onClick={() => navigate('/create-trip')}
          className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 transform"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">New Trip</span>
        </button>
      </div>
      
      {/* Trips Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-500 text-lg font-medium">Loading your itineraries...</p>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-teal-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-teal-50 p-6 rounded-full mb-6">
            <Palmtree className="w-16 h-16 text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No trips planned yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
            Your passport is waiting. Use our AI to organize your dream destination seamlessly.
          </p>
          <button 
            onClick={() => navigate('/create-trip')}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:scale-105 transition-all font-bold flex items-center gap-2 text-lg"
          >
            <PlusCircle className="w-6 h-6" />
            Create Your First Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
