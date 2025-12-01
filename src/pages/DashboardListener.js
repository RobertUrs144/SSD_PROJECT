// src/pages/ListenerDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  AiFillHeart,
  AiOutlineHeart,
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineStepBackward,
  AiOutlineStepForward,
  AiFillSound,
  AiFillMuted,
} from 'react-icons/ai';
import './SignUpListener.css';

export default function ListenerDashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all or favourites
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchSongs = async () => {
      try {
        const songSnap = await getDocs(collection(db, 'songs'));
        const allSongs = songSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isFavourite: false }));

        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const favIds = userSnap.data()?.favourites || [];

        const updatedSongs = allSongs.map(s => ({ ...s, isFavourite: favIds.includes(s.id) }));
        setSongs(updatedSongs);
      } catch (err) {
        console.error('Error fetching songs:', err);
      }
    };

    fetchSongs();
  }, [user]);

  const toggleFavourite = async (songId) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const song = songs.find(s => s.id === songId);

    try {
      // Check if user document exists, if not create it with favourites array
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, { favourites: [songId] });
        setSongs(songs.map(s => s.id === songId ? { ...s, isFavourite: true } : s));
        return;
      }

      // Update existing document
      if (song.isFavourite) {
        await updateDoc(userRef, { favourites: arrayRemove(songId) });
      } else {
        await updateDoc(userRef, { favourites: arrayUnion(songId) });
      }

      setSongs(songs.map(s => s.id === songId ? { ...s, isFavourite: !s.isFavourite } : s));
    } catch (err) {
      console.error('Error updating favourite:', err);
      alert('Failed to update favourite. Please try again.');
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
    setCurrentSongIndex(0);
  };

  const filteredSongs = songs
    .filter(s => activeTab === 'all' || (activeTab === 'favourites' && s.isFavourite))
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase()));

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playNext = () => setCurrentSongIndex((prev) => (prev + 1) % filteredSongs.length);
  const playPrev = () => setCurrentSongIndex((prev) => (prev - 1 + filteredSongs.length) % filteredSongs.length);

  const handleSelectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      setVolume(previousVolume);
      if (audioRef.current) {
        audioRef.current.volume = previousVolume;
      }
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      setVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.offsetWidth;
    const clickedTime = (clickX / width) * duration;
    audioRef.current.currentTime = clickedTime;
    setCurrentTime(clickedTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (!user) return <p>Please log in to see the dashboard.</p>;

  return (
    <div className="signup-listener-container" style={{ paddingBottom: '120px' }}>
      <div className="signup-listener-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <h2>Welcome, {user.email}</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/edit-listener-profile')}>Edit Profile</button>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('all')}>All Songs</button>
          <button className={`btn ${activeTab === 'favourites' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('favourites')}>Favourites</button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {/* Song list */}
        {filteredSongs.map((song, index) => (
          <div key={song.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer', background: currentSongIndex === index ? '#f0f0ff' : 'transparent', padding: '0.5rem', borderRadius: 8 }} onClick={() => handleSelectSong(index)}>
            <img src={song.cover} alt={song.name} style={{ width: 50, height: 50, borderRadius: 6, marginRight: 10 }} />
            <div style={{ flex: 1 }}><strong>{song.name}</strong> - {song.artist}</div>
            <button onClick={(e) => { e.stopPropagation(); toggleFavourite(song.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: song.isFavourite ? 'red' : 'gray' }}>
              {song.isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
            </button>
          </div>
        ))}
      </div>

      {/* Mini-player - Centered */}
      {filteredSongs.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          background: '#fff', 
          borderTop: '1px solid #ddd', 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', 
          zIndex: 1000 
        }}>
          {/* Song Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <img src={filteredSongs[currentSongIndex].cover} alt={filteredSongs[currentSongIndex].name} style={{ width: 50, height: 50, borderRadius: 6 }} />
            <div style={{ textAlign: 'center' }}>
              <strong>{filteredSongs[currentSongIndex].name}</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>{filteredSongs[currentSongIndex].artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={playPrev} style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer' }}><AiOutlineStepBackward /></button>
            <button onClick={togglePlayPause} style={{ fontSize: '2.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>{isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}</button>
            <button onClick={playNext} style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer' }}><AiOutlineStepForward /></button>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', width: '200px' }}>
            <button 
              onClick={toggleMute} 
              style={{ 
                fontSize: '1.5rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: isMuted ? '#999' : '#333'
              }}
            >
              {isMuted || volume === 0 ? <AiFillMuted /> : <AiFillSound />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={handleVolumeChange}
              style={{ 
                flex: 1,
                cursor: 'pointer',
                accentColor: '#6e8efb'
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#666', minWidth: '35px' }}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '0.75rem' }}>
            <div 
              onClick={handleProgressClick}
              style={{ 
                width: '100%', 
                height: '6px', 
                background: '#e0e0e0', 
                borderRadius: '3px', 
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`, 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
                  borderRadius: '3px',
                  transition: 'width 0.1s ease'
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={filteredSongs[currentSongIndex].audio} 
            autoPlay={isPlaying} 
            onEnded={playNext}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </div>
      )}
    </div>
  );
}