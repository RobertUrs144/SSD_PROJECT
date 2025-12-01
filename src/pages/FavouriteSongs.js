import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import {
  AiFillHeart,
  AiOutlineHeart,
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiOutlineStepBackward,
  AiOutlineStepForward,
} from 'react-icons/ai';
import './SignUpListener.css';

export default function FavouriteSongs() {
  const user = auth.currentUser;
  const [favourites, setFavourites] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const audioRef = useRef(null);

  // Fetch favourite songs
  useEffect(() => {
    if (!user) return;

    const fetchFavourites = async () => {
      try {
        // Get user favourites
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const favIds = userSnap.data()?.favourites || [];

        // Get all songs
        const songSnap = await getDocs(collection(db, 'songs'));
        const favSongs = songSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(song => favIds.includes(song.id));

        setFavourites(favSongs);
      } catch (err) {
        setMessage(`Error loading favourites: ${err.message}`);
      }
    };

    fetchFavourites();
  }, [user]);

  const toggleFavourite = async (songId) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);

    try {
      // Remove from Firestore favourites
      await updateDoc(userRef, { favourites: arrayRemove(songId) });

      // Update local state
      setFavourites(favourites.filter(s => s.id !== songId));

      // Adjust current song index if needed
      if (currentSongIndex >= favourites.length - 1) setCurrentSongIndex(0);
    } catch (err) {
      console.error('Error updating favourite:', err);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % favourites.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentSongIndex((prev) => (prev - 1 + favourites.length) % favourites.length);
    setIsPlaying(true);
  };

  const handleSelectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  if (!user) return <p>Please log in to see your favourite songs.</p>;

  return (
    <div className="signup-listener-container" style={{ paddingBottom: '120px' }}>
      <div className="signup-listener-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <h2>Your Favourite Songs</h2>
        {message && <p className="error">{message}</p>}

        {favourites.length === 0 && <p>No favourite songs yet.</p>}

        {favourites.map((song, index) => (
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
              onClick={() => toggleFavourite(song.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: 'red',
              }}
            >
              <AiFillHeart />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Mini Player */}
      {favourites.length > 0 && (
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
              src={favourites[currentSongIndex].cover}
              alt={favourites[currentSongIndex].name}
              style={{ width: 50, height: 50, borderRadius: 6 }}
            />
            <div>
              <strong>{favourites[currentSongIndex].name}</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
                {favourites[currentSongIndex].artist}
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

          <audio ref={audioRef} src={favourites[currentSongIndex].audio} autoPlay={isPlaying} onEnded={playNext} />
        </div>
      )}
    </div>
  );
}
