import React, { useState } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ArtistUpload.css';

export default function ArtistUpload() {
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [songName, setSongName] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file || !cover || !songName) {
      setMessage("Please select song, cover, and name.");
      return;
    }

    setMessage("Uploading...");
    setProgress(0);

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in.");
        return;
      }

      // -----------------------
      // Upload Audio File
      // -----------------------
      const audioRef = ref(storage, `songs/${Date.now()}-${file.name}`);
      const audioTask = uploadBytesResumable(audioRef, file);

      await new Promise((resolve, reject) => {
        audioTask.on(
          'state_changed',
          snap => {
            const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
            setProgress(Math.round(prog));
          },
          err => reject(err),
          () => resolve()
        );
      });

      const audioURL = await getDownloadURL(audioTask.snapshot.ref);

      // -----------------------
      // Upload Cover Image
      // -----------------------
      const coverRef = ref(storage, `covers/${Date.now()}-${cover.name}`);
      const coverTask = uploadBytesResumable(coverRef, cover);

      await new Promise((resolve, reject) => {
        coverTask.on(
          'state_changed',
          () => {},
          err => reject(err),
          () => resolve()
        );
      });

      const coverURL = await getDownloadURL(coverTask.snapshot.ref);

      // -----------------------
      // Save Song to Firestore
      // -----------------------
      await addDoc(collection(db, 'songs'), {
        name: songName,
        artist: user.email,
        artistUid: user.uid,
        audio: audioURL,
        cover: coverURL,
        createdAt: serverTimestamp(),
      });

      setMessage("Upload complete!");
      setProgress(0);
      setSongName('');
      setFile(null);
      setCover(null);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setMessage("Error uploading. Check console.");
      setProgress(0);
    }
  };

  return (
    <div className="artist-upload-container">
      <h2>Upload Song</h2>

      <input
        type="text"
        placeholder="Song name"
        value={songName}
        onChange={e => setSongName(e.target.value)}
      />

      <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} />

      <button className="btn btn-primary" onClick={handleUpload}>
        Upload
      </button>

      {message && <p>{message}</p>}
      {progress > 0 && <p>{progress}%</p>}
    </div>
  );
}
