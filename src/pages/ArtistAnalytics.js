
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SpotifyTheme.css';

export default function ArtistAnalytics() {
    const [user, setUser] = useState(null);
    const [songs, setSongs] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- Core Data Listener ---
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/');
            }
        });
        return () => unsubscribeAuth();
    }, [navigate]);

    // --- Real-time Analytics Listener ---
    useEffect(() => {
        if (!user) return;

        // 1. Listen to the Artist's Songs (for Plays and Likes)
        const songsQuery = query(collection(db, 'songs'), where('artistUid', '==', user.uid));
        const unsubscribeSongs = onSnapshot(songsQuery, (snapshot) => {
            const songsData = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setSongs(songsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching songs analytics:", error);
            setLoading(false);
        });

        // 2. Listen to Follower Count
        const followsQuery = query(collection(db, 'follows'), where('artistUid', '==', user.uid));
        const unsubscribeFollows = onSnapshot(followsQuery, (snapshot) => {
            setFollowersCount(snapshot.size);
        }, (error) => console.error("Error fetching followers:", error));

        return () => {
            unsubscribeSongs();
            unsubscribeFollows();
        };
    }, [user]);

    // --- Calculations (Using || 0 for robust data retrieval) ---
    // This ensures that if a field (like playsCount) doesn't exist, it defaults to 0 instead of NaN.
    const totalPlays = songs.reduce((sum, song) => sum + (song.playsCount || 0), 0);
    const totalLikes = songs.reduce((sum, song) => sum + (song.likesCount || 0), 0);
    const songCount = songs.length;

    if (loading) {
        return <div className="dark-background" style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Loading Analytics...</div>;
    }

    // --- RENDERING ---
    return (
        <div className="dark-background" style={{ minHeight: '100vh', padding: '20px' }}>
            
            <button 
                onClick={() => navigate('/dashboard-artist')}
                style={{
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    backgroundColor: '#333', 
                    color: 'white', 
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: '1px solid #555',
                    cursor: 'pointer'
                }}
            >
                ← Back to Dashboard
            </button>

            <h1 style={{ color: '#1DB954', marginBottom: '30px' }}>
                {user?.displayName || "Artist"} Analytics
            </h1>

            {/* CORE METRICS SUMMARY */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <MetricBox title="Total Plays" value={totalPlays.toLocaleString()} />
                <MetricBox title="Total Likes" value={totalLikes.toLocaleString()} />
                <MetricBox title="Total Followers" value={followersCount.toLocaleString()} />
                <MetricBox title="Songs Uploaded" value={songCount.toLocaleString()} />
            </div>

            {/* SONG BREAKDOWN */}
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Song Performance Breakdown</h2>

            <div style={{ background: '#181818', borderRadius: '8px', padding: '10px' }}>
                {songs.length === 0 ? (
                    <p style={{ color: '#b3b3b3', padding: '20px' }}>Upload songs to see performance data. Ensure your songs have the 'artistUid' field matching your user ID.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '10px 0', width: '40%' }}>Title</th>
                                <th style={{ padding: '10px 0' }}>Plays</th>
                                <th style={{ padding: '10px 0' }}>Likes</th>
                                <th style={{ padding: '10px 0' }}>Engagement Rate (Likes/Plays)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.sort((a, b) => (b.playsCount || 0) - (a.playsCount || 0)).map((song) => {
                                // Fallback to 0 if fields are null/undefined
                                const plays = song.playsCount || 0;
                                const likes = song.likesCount || 0;
                                
                                // Robust engagement rate calculation
                                const engagementRate = plays > 0 ? ((likes / plays) * 100).toFixed(1) + '%' : 'N/A';
                                
                                return (
                                    <tr key={song.id} style={{ borderBottom: '1px solid #282828' }}>
                                        <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{song.name || song.title || "Untitled"}</td>
                                        <td style={{ padding: '10px 0' }}>{plays.toLocaleString()}</td>
                                        <td style={{ padding: '10px 0' }}>{likes.toLocaleString()}</td>
                                        <td style={{ padding: '10px 0', color: engagementRate.includes('N/A') ? '#777' : (parseFloat(engagementRate) > 5 ? '#1DB954' : '#b3b3b3') }}>{engagementRate}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

const MetricBox = ({ title, value }) => (
    <div style={{ 
        background: '#181818', 
        padding: '25px', 
        borderRadius: '8px', 
        flex: 1, 
        border: '1px solid #333',
        textAlign: 'center'
    }}>
        <h3 style={{ color: '#b3b3b3', fontSize: '14px', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>{value}</p>
    </div>
);