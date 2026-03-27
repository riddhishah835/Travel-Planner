import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-teal-50 flex font-sans selection:bg-teal-200">
          <Sidebar />
          
          {/* Main Content Area - Scrollable with bottom padding for mobile Navbar */}
          <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-0">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-6 py-8 md:py-12 w-full animate-fade-in-down">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-6 py-8 md:py-12 w-full">
                      <Profile />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-trip" 
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-6 py-8 md:py-12 w-full animate-fade-in-down">
                      <CreateTrip />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trips/:tripId" 
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-6 py-8 md:py-12 w-full animate-fade-in-down">
                      <TripDetails />
                    </div>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
