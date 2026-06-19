import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RecipeModal from '../components/RecipeModal';
import ChatbotWidget from '../components/ChatbotWidget';
import DonationModal from '../components/DonationModal';
import EditItemModal from '../components/EditItemModal';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const AppLayout = () => {
  const { toast, currentUser, setActiveSlide } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Keep activeSlide in sync for sidebar highlighting and translate hash changes
  useEffect(() => {
    // Hash-based navigation removed. The app uses React Router and Sidebar navigation.
    // Keep this effect in case we want to restore hash behavior in future.
  }, [navigate, currentUser]);

  useEffect(() => {
      const path = location.pathname;
      if (path.startsWith('/dashboard')) setActiveSlide(0);
      else if (path.startsWith('/scanner')) setActiveSlide(1);
      else if (path.startsWith('/recipes')) setActiveSlide(2);
      else if (path.startsWith('/analytics') || path.startsWith('/donations')) setActiveSlide(3);
      else if (path.startsWith('/settings')) setActiveSlide(4);
      else if (path.startsWith('/community')) setActiveSlide(5);
  }, [location.pathname, setActiveSlide]);

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div className={`toast-notification ${toast.type}`}>
        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
        <span>{toast.message}</span>
      </div>
    );
  };

  return (
    <div className="app-container">
      {renderToast()}
      <Sidebar />
      <main className="main-content">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
      <RecipeModal />
      <ChatbotWidget />
      <DonationModal />
      <EditItemModal />
    </div>
  );
};

export default AppLayout;
