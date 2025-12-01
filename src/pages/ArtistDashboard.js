// src/pages/ArtistDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './SignUpListener.css';

export default function ArtistDashboard() {
  const user = auth.currentUser;
  const [songs, setSongs] = useState([]);
  const [name, setName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);

  // Fetch artist's songs
  useEffect(() => {
    if (!user) return;
    const fetchSongs = async () => {
      try {
        const q = query(collection(db, 'songs'), where('artistUid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSongs(songsData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSongs();
  }, [user]);

  const handleUpload = async () => {
    if (!name || !audioFile || !coverFile) {
      setMessage('All fields are required');
      return;
    }

    try {
      setMessage('');
      setUploadProgress(0);

      // Upload audio
      const audioRef = ref(storage, `songs/${Date.now()}_${audioFile.name}`);
      const audioUploadTask = uploadBytesResumable(audioRef, audioFile);

      const audioURL = await new Promise((resolve, reject) => {
        audioUploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
            setUploadProgress(progress);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(audioUploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // Upload cover
      const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
      const coverUploadTask = uploadBytesResumable(coverRef, coverFile);

      const coverURL = await new Promise((resolve, reject) => {
        coverUploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
            setUploadProgress(progress);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(coverUploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // Save song to Firestore
      const docRef = await addDoc(collection(db, 'songs'), {
        name,
        artist: user.displayName || user.email,
        artistUid: user.uid,
        audio: audioURL,
        cover: coverURL,
        createdAt: new Date()
      });

      setSongs([...songs, { id: docRef.id, name, artist: user.displayName || user.email, audio: audioURL, cover: coverURL }]);
      setName('');
      setAudioFile(null);
      setCoverFile(null);
      setUploadProgress(0);
      setMessage('Song uploaded successfully!');
      setTimeout(() => setMessage(''), 3000); // message disappears
    } catch (err) {
      console.error(err);
      setMessage('Error uploading song: ' + err.message);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'songs', id));
      setSongs(songs.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting song:', err);
    }
  };

  return (
    <div className="signup-listener-container">
      <div className="signup-listener-form">
        <h2>Artist Dashboard</h2>

        <input type="text" placeholder="Song Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} />
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload Song</button>

        {message && <p className="error">{message}</p>}

        {uploadProgress > 0 && (
          <div style={{ marginTop: '0.5rem', width: '100%', background: '#eee', borderRadius: 8 }}>
            <div style={{
              width: `${uploadProgress}%`,
              background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
              height: '8px',
              borderRadius: 8,
              transition: 'width 0.2s'
            }} />
          </div>
        )}

        <h3>Your Songs</h3>
        {songs.length === 0 && <p>No songs uploaded yet.</p>}
        {songs.map(song => (
          <div key={song.id} style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={song.cover} alt={song.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
            <p>{song.name}</p>
            <audio controls src={song.audio} style={{ width: '100%' }} />
            <button onClick={() => handleDelete(song.id)} style={{ marginTop: 4 }}>Delete</button>
            <button onClick={() => setCurrentAudio(song.audio)} style={{ marginTop: 4 }}>Play</button>
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
