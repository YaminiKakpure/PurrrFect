import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./components/Auth/Start"; // Import Start component
import RoleSelection from "./SpComponents/Auth/RoleSelection";
import AuthPage from "./components/Auth/AuthPage";
import PetProfile from "./components/profile/PetProfile";
import HomePage from "./components/Home/HomePage";
import LocationSelection from "./components/Home/LocationSelection";
import OwnerProfile from "./components/profile/OwnerProfile";
import HealthCare from "./components/Services_all/HealthCare";
import Grooming from "./components/Services_all/Grooming";
import Training from "./components/Services_all/Training";
import Boarding from "./components/Services_all/Boarding";
import Hotels from "./components/Services_all/Hotels";
import Places from "./components/Services_all/Places";
import ServiceDetails from "./components/ServiceDetails/ServiceDetails";
import ConfirmationPage from "./components/ConfirmationPage/ConfirmationPage";
import EndPage from "./components/End/EndPage";
import Notifications from "./components/SettingPages/Notifications";
import AboutUs from "./components/SettingPages/AboutUs";
import Help from "./components/SettingPages/Help";
import Parks from "./components/Services_all/parks";
import Cafes from "./components/Services_all/cafes";
import Marts from "./components/Services_all/marts";
import PlaceDetails from "./components/ServiceDetails/PlacesDetails";


import SpAuth from "./SpComponents/Auth/SpAuth";
import SpHome from "./SpComponents/Home/SpHome";
import SpServiceDetails from "./SpComponents/SP_Details/SpServiceDetails";
import SpConfirmation from "./SpComponents/Confirmation/SpConfirmation";
import SpDone from "./SpComponents/Confirmation/SpDone";
import DashBoard from "./SpComponents/Home/DashBoard";
import SpBookings from "./SpComponents/Options/SpBookings";
import SpNotif from "./SpComponents/Options/SpNotif";
import SpTrans from "./SpComponents/Options/SpTrans";
import SpProfile from "./SpComponents/Profile/SpProfile";
import BookingsPage from "./components/SettingPages/BookingsPage";
import BookingDetailsPage from "./components/SettingPages/BookingDetailsPage";
import SpBasicInfo from "./SpComponents/SP_Details/SpBasicInfo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} /> 
        <Route path="/RoleSelect" element={<RoleSelection />} /> 
        <Route path="/AuthPage" element={<AuthPage />} />
        <Route path="/create-profile" element={<PetProfile />} />
        <Route path="/edit-profile/:petId" element={<PetProfile />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/LocationSelection" element={<LocationSelection />} />
        <Route path="/OwnerProfile" element={<OwnerProfile />} />
        <Route path="/HealthCare" element={<HealthCare />} />
        <Route path="/Grooming" element={<Grooming />} />
        <Route path="/Training" element={<Training />} />
        <Route path="/Boarding" element={<Boarding />} />
        <Route path="/Hotels" element={<Hotels />} />
        <Route path="/Places" element={<Places />} />
        <Route path="/ServiceDetails" element={<ServiceDetails />} />
        <Route path="/Confirmation" element={<ConfirmationPage />} />
        <Route path="/end" element={<EndPage />} />
        <Route path="/notif" element={<Notifications />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/parks" element={<Parks />} />
        <Route path="/cafes" element={<Cafes />} />
        <Route path="/marts" element={<Marts />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/booking-details" element={<BookingDetailsPage />} />
        <Route path="/places/:placeId" element={<PlaceDetails />} />
        <Route path="/places/:placeId/reviews" element={<PlaceDetails />} />


        <Route path="/SpAuth" element={<SpAuth />} />
        <Route path="/SpHome" element={<SpHome />} />
        <Route path="/SpServiceDetails" element={<SpServiceDetails />} /> 
        <Route path="/SpConfirmation" element={<SpConfirmation />} /> 
        <Route path="/SpDone" element={<SpDone/>} /> 
        <Route path="/DashBoard" element={<DashBoard/>} /> 
        <Route path="/SpProfile" element={<SpProfile/>} /> 
        <Route path="/SpBookings" element={<SpBookings/>} /> 
        <Route path="/SpNotif" element={<SpNotif/>} /> 
        <Route path="/SpTrans" element={<SpTrans/>} /> 
        <Route path="/BasicF" element={<SpBasicInfo/>} /> 
        
      </Routes>
    </Router>
  );
}

// Component to check auth status and redirect
function AuthCheck() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const hasPets = localStorage.getItem('pets');
      if (!hasPets) {
        navigate('/create-profile');
      } else {
        navigate('/HomePage');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) return <LoadingScreen />;
  return null;
}

export default App;
