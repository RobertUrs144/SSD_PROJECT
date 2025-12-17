import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { 
  collection, addDoc, query, where, deleteDoc, doc, orderBy, onSnapshot, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth"; 
import { useNavigate } from 'react-router-dom';
import './SpotifyTheme.css'; // IMPORT THE SHARED THEME

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- Initialized

  const [songs, setSongs] = useState([]);
  const [uploadMode, setUploadMode] = useState('single'); 
  const [name, setName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCover, setAlbumCover] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]); 
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isUploading, setIsUploading] = useState(false);
  
  // Player state
  const [currentAudio, setCurrentAudio] = useState(null);
  const [activeCommentsSongId, setActiveCommentsSongId] = useState(null); 
  const [comments, setComments] = useState([]); 

  // --- 1. AUTH LISTENER ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // --- 2. DATA LISTENER (Real-time updates for likesCount) ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'songs'), where('artistUid', '==', user.uid));
    
    // onSnapshot is the correct listener for real-time updates (like likesCount)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(songsData);
    }, (error) => console.error(error));
    
    return () => unsubscribe();
  }, [user]);

  // --- 3. FETCH COMMENTS ---
  const fetchComments = async (songId) => {
    if (activeCommentsSongId === songId) {
      setActiveCommentsSongId(null);
      setComments([]);
      return;
    }
    try {
      setActiveCommentsSongId(songId);
      const q = query(collection(db, 'comments'), where('songId', '==', songId), orderBy('createdAt', 'desc'));
      onSnapshot(q, (snap) => setComments(snap.docs.map(d => d.data())));
    } catch (err) { console.error(err); }
  };

  // --- Helpers & Upload Logic (Same as before) ---
  const uploadFileToStorage = async (file, folder) => {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on("state_changed",
        (snap) => { setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100); },
        (err) => reject(err),
        async () => { const url = await getDownloadURL(uploadTask.snapshot.ref); resolve(url); }
      );
    });
  };

  const notifyFollowers = async (type, title) => {
    if (!user) return; 
    try {
      const q = query(collection(db, 'follows'), where('artistUid', '==', user.uid));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const notifications = snapshot.docs.map(doc => {
        return addDoc(collection(db, 'notifications'), {
          userId: doc.data().followerUid, 
          artistName: user.displayName || user.email,
          message: type === 'album' ? `uploaded a new album: "${title}"` : `uploaded a new song: "${title}"`,
          type: type,
          read: false,
          createdAt: serverTimestamp()
        });
      });
      await Promise.all(notifications);
    } catch (err) { console.error("Error sending notifications:", err); }
  };

  const handleSingleUpload = async () => {
    if (!user) { setMessage("Logging in..."); return; }
    if (!name || !audioFile || !coverFile) { setMessage('All fields are required'); return; }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage('Uploading assets...');
      const coverURL = await uploadFileToStorage(coverFile, 'covers');
      const audioURL = await uploadFileToStorage(audioFile, 'songs');
      await addDoc(collection(db, 'songs'), {
        name, artist: user.displayName || user.email, artistUid: user.uid, audio: audioURL, cover: coverURL, likesCount: 0, createdAt: serverTimestamp(), type: 'single'
      });
      await notifyFollowers('single', name);
      setName(''); setAudioFile(null); setCoverFile(null); setUploadProgress(0); setIsUploading(false);
      setMessage('Single uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err); setMessage('Error: ' + err.message); setIsUploading(false);
    }
  };

  const handleAlbumUpload = async () => {
    if (!user) { setMessage("Logging in..."); return; }
    if (!albumTitle || !albumCover || albumSongs.length === 0) { setMessage('Please fill all fields.'); return; }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage('Uploading Cover...');
      const coverURL = await uploadFileToStorage(albumCover, 'covers');
      const albumRef = await addDoc(collection(db, 'albums'), {
        title: albumTitle, artist: user.displayName || user.email, artistUid: user.uid, cover: coverURL, createdAt: serverTimestamp(), songCount: albumSongs.length
      });
      let count = 0;
      for (const file of albumSongs) {
        count++;
        setUploadProgress(0); 
        setMessage(`Uploading song ${count} of ${albumSongs.length}...`);
        const audioURL = await uploadFileToStorage(file, 'songs');
        await addDoc(collection(db, 'songs'), {
          name: file.name.replace(/\.[^/.]+$/, ""), artist: user.displayName || user.email, artistUid: user.uid, audio: audioURL, cover: coverURL, likesCount: 0, createdAt: serverTimestamp(), albumId: albumRef.id, albumTitle: albumTitle, type: 'album-track'
        });
      }
      await notifyFollowers('album', albumTitle);
      setAlbumTitle(''); setAlbumCover(null); setAlbumSongs([]); setUploadProgress(0); setIsUploading(false);
      setMessage(`Album "${albumTitle}" uploaded!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err); setMessage('Error: ' + err.message); setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete song?")) return;
    try { await deleteDoc(doc(db, 'songs', id)); } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>Loading...</div>;

  return (
    <div>
      {/* 1. SIDEBAR - CORRECTED NAVIGATION */}
      <div className="sidebar">
        <div className="logo">
          <span style={{ fontSize: '30px', color: 'white', marginRight: '8px' }}>◎</span>
          <span>Definitely not Spotify</span>
        </div>
        <div className="navigation">
          <ul>
            <li>
                {/* Dashboard Button */}
                <button onClick={() => navigate('/dashboard-artist')} style={{color:'white'}}>
                    🏠 Dashboard
                </button>
            </li>
            <li>
                {/* ANALYTICS BUTTON: Now correctly uses navigate */}
                <button onClick={() => navigate('/analytics-artist')}>
                    📊 Analytics
                </button>
            </li>
            <li><button>⚙️ Settings</button></li>
          </ul>
        </div>
        
        {/* Helper Upload Button in Sidebar (Optional) */}
        <div style={{marginTop: '20px', padding: '0 10px'}}>
           <div style={{color:'#b3b3b3', fontSize:'12px', marginBottom:'10px'}}>ARTIST TOOLS</div>
           <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
             ↑ Upload New Music
           </button>
        </div>
      </div>

      {/* 2. MAIN CONTAINER */}
      <div className="main-container">
        
        {/* Topbar */}
        <div className="topbar">
          <div style={{color:'white', fontWeight:'bold', fontSize:'20px'}}>Artist Studio</div>
          <div className="navbar">
             {/* Edit Profile Button */}
             <button onClick={() => navigate('/edit-artist-profile')} className="btn-white-outline" style={{marginRight:'10px', padding:'8px 15px', fontSize:'14px'}}>
               👤 Edit Profile
             </button>
             <button onClick={() => { auth.signOut(); navigate('/'); }} className="btn-white-outline" style={{padding:'8px 15px', fontSize:'14px'}}>
               Log Out
             </button>
          </div>
        </div>

        <div className="spotify-playlists">
          
          {/* 3. UPLOAD SECTION */}
          <div className="upload-container">
            <h2 style={{color:'white', marginBottom:'20px'}}>Upload Music</h2>
            
            {/* Tabs */}
            <div className="upload-tabs">
              <button className={`tab-btn ${uploadMode === 'single' ? 'active' : ''}`} onClick={() => setUploadMode('single')}>
                Upload Single
              </button>
              <button className={`tab-btn ${uploadMode === 'album' ? 'active' : ''}`} onClick={() => setUploadMode('album')}>
                Upload Album
              </button>
            </div>

            {/* Status Messages */}
            {message && <p style={{background:'#2a2a2a', color:'#1DB954', padding:'10px', borderRadius:'5px', textAlign:'center', marginBottom:'15px', border:'1px solid #1DB954'}}>{message}</p>}
            
            {isUploading && (
              <div style={{width:'100%', background:'#333', height:'6px', borderRadius:'5px', marginBottom:'20px'}}>
                <div style={{width: `${uploadProgress}%`, background:'#1DB954', height:'100%', transition:'width 0.2s', borderRadius:'5px'}}></div>
              </div>
            )}

            {/* Single Upload Form */}
            {uploadMode === 'single' && (
              <div style={{maxWidth:'500px'}}>
                <input type="text" placeholder="Song Name" className="dark-input" value={name} onChange={e => setName(e.target.value)} />
                
                <div className="file-input-group">
                  <label>Audio File (MP3/WAV)</label>
                  <input type="file" accept="audio/*" className="dark-input" onChange={e => setAudioFile(e.target.files[0])} />
                </div>

                <div className="file-input-group">
                   <label>Cover Art</label>
                   <input type="file" accept="image/*" className="dark-input" onChange={e => setCoverFile(e.target.files[0])} />
                </div>
                
                <button onClick={handleSingleUpload} disabled={isUploading} className="btn-green" style={{padding:'12px 30px', borderRadius:'30px', fontWeight:'bold', cursor:'pointer'}}>
                  Publish Single
                </button>
              </div>
            )}

            {/* Album Upload Form */}
            {uploadMode === 'album' && (
              <div style={{maxWidth:'500px'}}>
                <input type="text" placeholder="Album Title" className="dark-input" value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} />
                
                <div className="file-input-group">
                   <label>Album Cover Art</label>
                   <input type="file" accept="image/*" className="dark-input" onChange={e => setAlbumCover(e.target.files[0])} />
                </div>

                <div className="file-input-group">
                   <label>Album Songs (Select Multiple)</label>
                   <input type="file" accept="audio/*" multiple className="dark-input" onChange={e => setAlbumSongs(Array.from(e.target.files))} />
                </div>
                
                <button onClick={handleAlbumUpload} disabled={isUploading} className="btn-green" style={{padding:'12px 30px', borderRadius:'30px', fontWeight:'bold', cursor:'pointer'}}>
                  Publish Album
                </button>
              </div>
            )}
          </div>

          {/* 4. MANAGE SONGS SECTION */}
          <h2 style={{color:'white', marginBottom:'20px'}}>Your Discography</h2>
          
          <div className="list" style={{display:'flex', flexWrap:'wrap', gap:'20px'}}>
            {songs.length === 0 && <p style={{color:'#b3b3b3'}}>You haven't uploaded any songs yet.</p>}
            
            {songs.map(song => (
              <div key={song.id} className="item" style={{width:'220px'}}>
                <div style={{position:'relative'}}>
                   <img src={song.cover} alt={song.name} style={{width:'100%', borderRadius:'6px', marginBottom:'10px', objectFit:'cover', aspectRatio:'1'}} />
                   
                   {/* Play Button Overlay */}
                   <div 
                     className="play-btn" 
                     onClick={() => setCurrentAudio(song.audio)}
                     style={{cursor:'pointer'}}
                   >▶</div>
                </div>

                <h4 style={{marginBottom:'5px', color:'white'}}>{song.name}</h4>
                <p style={{fontSize:'12px', color:'#b3b3b3', marginBottom:'10px'}}>
                  {/* This uses song.likesCount || 0 which is fetched in useEffect 2 */}
                  ❤️ {song.likesCount || 0} Likes
                  {song.albumTitle && <span style={{marginLeft:'10px', color:'#1DB954'}}>💿 Album</span>}
                </p>

                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                  <button className="btn-white-outline" style={{fontSize:'11px', padding:'5px 10px'}} onClick={() => fetchComments(song.id)}>
                    {activeCommentsSongId === song.id ? 'Hide Comments' : 'Comments'}
                  </button>
                  <button style={{background:'transparent', color:'#ff4444', border:'1px solid #ff4444', borderRadius:'20px', padding:'5px 10px', fontSize:'11px', cursor:'pointer'}} onClick={() => handleDelete(song.id)}>
                    Delete
                  </button>
                </div>

                {/* Comments Dropdown */}
                {activeCommentsSongId === song.id && (
                   <div className="comments-box">
                    {comments.length === 0 ? <p style={{color:'#777'}}>No comments yet.</p> : (
                       <ul>
                         {comments.map((c, i) => (
                           <li key={i}><b style={{color:'white'}}>{c.userDisplayName}:</b> <span style={{color:'#ccc'}}>{c.text}</span></li>
                         ))}
                       </ul>
                     )}
                   </div>
                 )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 5. FLOATING PLAYER (Only when playing) */}
      {currentAudio && (
          <div className="bottom-player" style={{justifyContent:'center', gap:'20px'}}>
             <audio controls autoPlay src={currentAudio} style={{ width: '60%' }} />
             <button onClick={() => setCurrentAudio(null)} style={{background:'#333', color:'white', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', fontWeight:'bold'}}>✕</button>
          </div>
      )}

    </div>
  );
}