import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Leaf, LogOut } from 'lucide-react';

const Sidebar = () => {
    const context = useAppContext();
    const { activeSlide, setActiveSlide, currentUser, handleLogout, navItems, slideHashes } = context;
    const navigate = useNavigate();

    const handleClick = (index) => {
      setActiveSlide(index);
      const path = slideHashes[index] ? slideHashes[index].replace('#', '') : '/dashboard';
      navigate(path);
    };

    return (
        <>
            {/* Sidebar */}
      <nav className="sidebar">
        <div className="brand">
          <Leaf size={22} color="var(--accent)" />
          <h1>EcoPantry</h1>
        </div>
        
        {/* Navigation Items */}
        <div className="nav-items-container">
          {navItems.map((item, index) => (
            <div 
              key={index}
              className={`nav-item ${activeSlide === index ? 'active' : ''}`}
              onClick={() => handleClick(index)}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* User profile at the bottom of the sidebar */}
        {currentUser && (
          <div className="sidebar-profile-widget" onClick={() => { navigate('/settings/profile'); }}>
            <div className="sidebar-avatar">
              {currentUser.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} />
              ) : (
                currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
              )}
              <div className="avatar-active-dot"></div>
            </div>
            <div className="sidebar-profile-details">
              <span className="sidebar-profile-name">{currentUser.name}</span>
              <span className="sidebar-profile-tier">{currentUser.badge} Tier</span>
            </div>
            <button className="sidebar-logout-icon" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>
        </>
    );
};

export default Sidebar;
