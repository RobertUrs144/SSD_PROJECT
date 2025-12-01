// src/pages/ListenerDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import './SignUpListener.css';

export default function ListenerDashboard() {
  const user = auth.currentUser;
  const [songs, setSongs] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'songs'));
        const allSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSongs(allSongs);
      } catch (err) {
        console.error('Error fetching songs:', err);
      }
    };

    fetchSongs();
  }, []);

  // Fetch favourites of the current user
  useEffect(() => {
    if (!user) return;
    const fetchFavourites = async () => {
      try {
        const q = query(collection(db, 'favourites'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavourites(favs);
      } catch (err) {
        console.error('Error fetching favourites:', err);
      }
    };

    fetchFavourites();
  }, [user]);

  // Toggle favourite
  const toggleFavourite = async (song) => {
    if (!user) {
      setMessage('You must be logged in to favourite songs.');
      return;
    }

    const isFav = favourites.find(f => f.songId === song.id);

    try {
      if (isFav) {
        // Remove favourite
        await deleteDoc(doc(db, 'favourites', isFav.id));
        setFavourites(favourites.filter(f => f.id !== isFav.id));
      } else {
        // Add favourite
        const docRef = await addDoc(collection(db, 'favourites'), {
          uid: user.uid,
          songId: song.id,
          addedAt: new Date()
        });
        setFavourites([...favourites, { id: docRef.id, uid: user.uid, songId: song.id }]);
      }
    } catch (err) {
      console.error('Error toggling favourite:', err);
    }
  };

  const isFavourite = (songId) => favourites.some(f => f.songId === songId);

  return (
    <div className="signup-listener-container">
      <div className="signup-listener-form">
        <h2>Listener Dashboard</h2>
        {message && <p className="error">{message}</p>}

        {songs.length === 0 && <p>No songs available.</p>}

        {songs.map(song => (
          <div key={song.id} style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img
              src={song.cover}
              alt={song.name}
              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
            />
            <p>{song.name} - {song.artist}</p>

            <audio controls src={song.audio} style={{ width: '100%' }} />

            <button
              onClick={() => toggleFavourite(song)}
              style={{ marginTop: 4 }}
            >
              {isFavourite(song.id) ? '★ Remove Favourite' : '☆ Add to Favourite'}
            </button>

            <button
              onClick={() => setCurrentAudio(song.audio)}
              style={{ marginTop: 4, marginLeft: 8 }}
            >
              Play
            </button>
          </div>
        ))}

        {currentAudio && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            padding: '0.5rem',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <audio controls autoPlay src={currentAudio} style={{ width: '90%' }} />
          </div>
        )}
      </div>
    </div>
  );
}
