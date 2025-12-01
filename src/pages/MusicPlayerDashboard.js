import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  AiFillHeart,
  AiOutlineHeart,
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineStepBackward,
  AiOutlineStepForward,
} from 'react-icons/ai';
import './SignUpListener.css';

export default function MusicPlayerDashboard() {
  const user = auth.currentUser;
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchSongs = async () => {
      try {
        const songSnap = await getDocs(collection(db, 'songs'));
        const songList = songSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isFavourite: false }));
        setSongs(songList);
        setFilteredSongs(songList);
      } catch (err) {
        setMessage(`Error fetching songs: ${err.message}`);
      }
    };

    fetchSongs();
  }, [user]);

  useEffect(() => {
    const filtered = songs.filter(
      song =>
        song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const handleSelectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="signup-listener-container" style={{ paddingBottom: '120px' }}>
      <div className="signup-listener-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <h2>Music Player</h2>

        {message && <p className="error">{message}</p>}

        <input
          type="text"
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />

        {filteredSongs.length === 0 && <p>No songs found.</p>}

        {filteredSongs.map((song, index) => (
          <div
            key={song.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              cursor: 'pointer',
              background: currentSongIndex === index ? '#f0f0ff' : 'transparent',
              padding: '0.5rem',
              borderRadius: '8px',
            }}
            onClick={() => handleSelectSong(index)}
          >
            <img
              src={song.cover}
              alt={song.name}
              style={{ width: 50, height: 50, borderRadius: 6, marginRight: 10 }}
            />
            <div style={{ flex: 1 }}>
              <strong>{song.name}</strong> - {song.artist}
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: song.isFavourite ? 'red' : 'gray',
              }}
            >
              {song.isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Mini Player */}
      {songs.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: '#fff',
            borderTop: '1px solid #ddd',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={songs[currentSongIndex].cover}
              alt={songs[currentSongIndex].name}
              style={{ width: 50, height: 50, borderRadius: 6 }}
            />
            <div>
              <strong>{songs[currentSongIndex].name}</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
                {songs[currentSongIndex].artist}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={playPrev}
              style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <AiOutlineStepBackward />
            </button>
            <button
              onClick={togglePlayPause}
              style={{ fontSize: '2.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isPlaying ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
            </button>
            <button
              onClick={playNext}
              style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <AiOutlineStepForward />
            </button>
          </div>

          <audio ref={audioRef} src={songs[currentSongIndex].audio} autoPlay={isPlaying} onEnded={playNext} />
        </div>
      )}
    </div>
  );
}
