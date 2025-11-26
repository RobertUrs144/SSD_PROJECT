import React from 'react';
import './DashboardListener.css';

const DashboardListener = ({ user }) => {
  return (
    <div className="dashboard-listener-container">
      <div className="dashboard-listener-card">
        <h2>Bine ai venit, {user?.username || 'Listener'}!</h2>
        <p>Email: {user?.email}</p>
        <p>Rol: Listener</p>
        <div className="dashboard-listener-actions">
          <button>Explore Artists</button>
          <button>My Playlists</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardListener;
