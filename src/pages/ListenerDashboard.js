import React, { useState, useEffect, useRef } from "react";
import "./SpotifyTheme.css"; 
import { db, auth } from "../firebase"; 
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  orderBy, 
  serverTimestamp,
  setDoc,
  getDocs,
  updateDoc, 
  increment 
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth"; 
import { useNavigate } from 'react-router-dom'; 

const ListenerDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(null); 
  const [songs, setSongs] = useState([]); 
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]); 
  
  const [view, setView] = useState("home"); 
  const [likedSongs, setLikedSongs] = useState([]); 
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  
  // FOLLOW & NOTIFICATION STATE
  const [following, setFollowing] = useState([]); 
  const [notifications, setNotifications] = useState([]); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // COMMENTS STATE
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [songForComments, setSongForComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Modals
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [songToAdd, setSongToAdd] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); 
  const [showHistory, setShowHistory] = useState(false);

  const audioRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- 1. AUTH & DATA LOADING (useEffect) ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        
        const userHistoryKey = `history_${user.uid}`;
        const savedHistory = JSON.parse(localStorage.getItem(userHistoryKey)) || [];
        setHistory(savedHistory);

        subscribeToLikes(user.uid); 
        
        const notifQuery = query(
          collection(db, "notifications"), 
          where("userId", "==", user.uid), 
          orderBy("createdAt", "desc")
        );
        
        const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.read).length);
        });

        return () => unsubNotif();
      } else {
        window.location.href = "/";
      }
    });

    const unsubSongs = onSnapshot(collection(db, "songs"), (snapshot) => {
      const songList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data, 
          title: data.name || data.title || "Untitled", 
          cover: data.cover || "https://via.placeholder.com/150",
          url: data.audio || data.url || null
        };
      });
      setSongs(songList);
    }, (error) => {
      console.error("Error fetching songs:", error);
    });
    
    setPlaylists(JSON.parse(localStorage.getItem("userPlaylists")) || []);

    return () => {
      unsubscribeAuth();
      unsubSongs(); 
    };
  }, []);

  // --- 2. REAL-TIME FOLLOWS LISTENER ---
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "follows"), where("followerUid", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
           const followingIds = snap.docs.map(doc => doc.data().artistUid);
           setFollowing(followingIds);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- 3. REAL-TIME LIKES LISTENER ---
  const subscribeToLikes = (uid) => {
    const q = query(collection(db, "user_likes"), where("userId", "==", uid));
    
    onSnapshot(q, (snapshot) => {
      const likes = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
             id: data.id || doc.id.split("_")[1], 
             ...data 
        };
      });
      setLikedSongs(likes); 
    });
  };

  // --- 4. REAL-TIME COMMENTS LISTENER ---
  useEffect(() => {
    if (!songForComments) return;

    const q = query(
      collection(db, "comments"),
      where("songId", "==", songForComments.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommentsList(comments);
    });

    return () => unsubscribe();
  }, [songForComments]);

  // --- 5. DERIVED DATA (Moved up to fix scope issues) ---

  const getSongsForView = () => {
    if (view === "liked") return likedSongs;
    if (view === "playlist") {
      const activePl = playlists.find(p => p.id === activePlaylistId);
      return activePl ? activePl.songs : [];
    }
    return songs;
  };

  // This variable is now correctly defined before skipSong/handlePlaySong
  const filteredSongs = getSongsForView().filter((song) => {
    if (searchTerm === "") return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(lowerSearch) ||
      song.artist.toLowerCase().includes(lowerSearch)
    );
  });


  // --- HANDLERS (Now defined after derived data) ---
  
  const handleFollowToggle = async (artistUid, artistName, e) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (!artistUid) { alert("This artist profile is incomplete."); return; }

    const isFollowing = following.includes(artistUid);

    try {
      if (isFollowing) {
        const q = query(
          collection(db, "follows"), 
          where("followerUid", "==", currentUser.uid),
          where("artistUid", "==", artistUid)
        );
        const snapshot = await getDocs(q); 
        snapshot.forEach(async (d) => { await deleteDoc(d.ref); });
      } else {
        await addDoc(collection(db, "follows"), {
          followerUid: currentUser.uid,
          artistUid: artistUid,
          artistName: artistName,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const markNotificationsRead = async () => {
    setUnreadCount(0);
  };

  const clearNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error clearing notification", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setHistory([]); 
    window.location.href = "/";
  };
  
  const handlePlaySong = async (song) => { 
    if (!song.url) { alert("Missing Audio URL"); return; }
    
    // CRITICAL: LOG THE PLAY COUNT
    const songRef = doc(db, "songs", song.id);
    try {
      await updateDoc(songRef, { 
        playsCount: increment(1)
      });
    } catch (e) {
      console.warn("Could not increment play count for song:", song.id, e);
    } 

    setCurrentSong(song);
    setIsPlaying(true);

    const newHistory = [song, ...history.filter(s => s.id !== song.id)].slice(0, 20);
    setHistory(newHistory);
    
    if (currentUser) {
      const userHistoryKey = `history_${currentUser.uid}`;
      localStorage.setItem(userHistoryKey, JSON.stringify(newHistory));
    }
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = { id: Date.now(), name: newPlaylistName, songs: [] };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem("userPlaylists", JSON.stringify(updated));
    setNewPlaylistName("");
    setShowCreatePlaylistModal(false);
    setActivePlaylistId(newPlaylist.id);
    setView('playlist');
  };

  const openAddToModal = (song, e) => {
    e.stopPropagation();
    setSongToAdd(song);
    setShowAddToPlaylistModal(true);
  };

  const addSongToPlaylist = (playlistId) => {
    const updated = playlists.map(pl => {
      if (pl.id === playlistId) {
        if (pl.songs.find(s => s.id === songToAdd.id)) return pl;
        return { ...pl, songs: [...pl.songs, songToAdd] };
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem("userPlaylists", JSON.stringify(updated));
    setShowAddToPlaylistModal(false);
  };

  const deletePlaylist = (id, e) => {
    e.stopPropagation();
    if(window.confirm("Delete playlist?")) {
      const updated = playlists.filter(p => p.id !== id);
      setPlaylists(updated);
      localStorage.setItem("userPlaylists", JSON.stringify(updated));
      if(activePlaylistId === id) setView('home');
    }
  };

  const toggleLike = async (song, e) => {
    e.stopPropagation();
    if (!currentUser) {
        alert("Please log in to like songs");
        return;
    }

    const likeDocId = `${currentUser.uid}_${song.id}`;
    const isLiked = likedSongs.some(s => s.id === song.id);

    if (isLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
    } else {
        setLikedSongs(prev => [...prev, song]);
    }

    try {
        const songRef = doc(db, "songs", song.id); 

        if (isLiked) {
            await deleteDoc(doc(db, "user_likes", likeDocId));
            await updateDoc(songRef, { likesCount: increment(-1) });
        } else {
            await setDoc(doc(db, "user_likes", likeDocId), {
                userId: currentUser.uid,
                id: song.id, 
                title: song.title,
                artist: song.artist,
                cover: song.cover,
                url: song.url,
                likedAt: serverTimestamp()
            });
            await updateDoc(songRef, { likesCount: increment(1) });
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        if (isLiked) setLikedSongs(prev => [...prev, song]);
        else setLikedSongs(prev => prev.filter(s => s.id !== song.id));
    }
  };

  const openCommentsModal = (song, e) => {
    e.stopPropagation();
    setSongForComments(song);
    setShowCommentsModal(true);
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    if (!currentUser) { alert("Please log in to comment"); return; }

    try {
      await addDoc(collection(db, "comments"), {
        songId: songForComments.id,
        songTitle: songForComments.title,
        artistUid: songForComments.artistUid, 
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        text: newCommentText,
        createdAt: serverTimestamp()
      });
      setNewCommentText(""); 
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment.");
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // No longer an error because filteredSongs is defined above
  const skipSong = (dir) => {
    const idx = filteredSongs.findIndex(s => s.id === currentSong.id);
    const newIdx = (idx + dir + filteredSongs.length) % filteredSongs.length;
    handlePlaySong(filteredSongs[newIdx]);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const width = e.target.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    audioRef.current.currentTime = (clickX / width) * duration;
  };

  const handleVolumeChange = (e) => {
    const newVol = e.nativeEvent.offsetX / e.target.clientWidth;
    setVolume(newVol);
    audioRef.current.volume = newVol;
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
    }
  }, [currentSong]);

  const checkIsLiked = (id) => likedSongs.some(s => s.id === id);
  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div>
      {currentSong && currentSong.url && (
        <audio ref={audioRef} src={currentSong.url} onTimeUpdate={handleTimeUpdate} onEnded={() => skipSong(1)} />
      )}

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo"><span style={{ fontSize: '30px', color: 'white', marginRight: '8px' }}>◎</span>Definitely not Spotify</div>
        <div className="navigation">
          <ul>
            <li><button onClick={() => setView('home')} style={{color: view === 'home' ? 'white' : '#b3b3b3'}}>🏠 Home</button></li>
            <li><button onClick={() => searchInputRef.current?.focus()}>🔍 Search</button></li>
            <li><button onClick={() => setView('library')} style={{color: view === 'library' ? 'white' : '#b3b3b3'}}>📚 Your Library</button></li>
          </ul>
        </div>
        <div className="navigation">
          <ul>
            <li><button onClick={() => setShowCreatePlaylistModal(true)} style={{color:'white'}}>➕ Create Playlist</button></li>
            <li><button onClick={() => setView('liked')} style={{color: view === 'liked' ? 'white' : '#b3b3b3'}}>💜 Liked Songs</button></li>
            <li><button onClick={() => setShowHistory(true)}>🕒 History</button></li>
          </ul>
        </div>
        <div className="policies" style={{bottom:'120px', top:'auto'}}>
            <div style={{fontSize:'12px', fontWeight:'bold', color:'#b3b3b3', marginBottom:'10px', paddingLeft:'5px'}}>QUICK ACCESS</div>
            <ul style={{maxHeight:'200px', overflowY:'auto'}}>
              {playlists.map(pl => (
                <li key={pl.id} style={{display:'flex', justifyContent:'space-between'}}>
                  <button onClick={() => {setActivePlaylistId(pl.id); setView('playlist');}} style={{color: (view === 'playlist' && activePlaylistId === pl.id) ? '#1DB954' : '#b3b3b3', fontSize:'13px', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{pl.name}</button>
                </li>
              ))}
            </ul>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="main-container">
        <div className="topbar">
          <div className="prev-next-buttons">
            <button>{'<'}</button><button>{'>'}</button>
          </div>
          <div style={{ flex: 1, margin: '0 20px', maxWidth: '400px' }}>
            <input ref={searchInputRef} type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width: '100%', padding: '10px 20px', borderRadius: '20px', border: 'none', outline: 'none', fontSize: '14px'}} />
          </div>
          <div className="navbar">
              <button 
                onClick={() => navigate('/edit-listener-profile')} 
                style={{marginRight:'10px', backgroundColor:'#333', color:'white'}}
              >
                👤 {currentUser?.displayName || "Profile"}
              </button>

              <div style={{ position: 'relative', cursor: 'pointer', marginRight:'10px' }} onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }}>
                <span style={{fontSize:'18px', color:'#b3b3b3'}}>🔔</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                {showNotifications && (
                  <div className="dropdown-menu">
                    <div style={{padding:'10px', borderBottom:'1px solid #333', fontWeight:'bold', fontSize:'14px'}}>Notifications</div>
                    {notifications.length === 0 ? (
                      <div style={{padding:'10px', color:'#777'}}>No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{padding:'10px', borderBottom:'1px solid #333', display:'flex', justifyContent:'space-between', fontSize:'13px', background: n.read ? 'transparent' : '#2a2a2a'}}>
                          <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{fontWeight:'bold'}}>{n.artistName}</span>
                            <span>{n.message}</span>
                          </div>
                          <span onClick={(e) => clearNotification(n.id, e)} style={{cursor:'pointer', marginLeft:'10px', color:'#ff5555'}}>✕</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>

        <div className="spotify-playlists">
          <h2>{view === 'home' ? "Trending Now" : view === 'liked' ? "Your Liked Songs" : view === 'library' ? "Your Library" : playlists.find(p => p.id === activePlaylistId)?.name}</h2>
          
          <div className="list">
              {view === 'library' && playlists.length === 0 && <p style={{color:'#b3b3b3'}}>No playlists found.</p>}
              {view === 'library' && playlists.map(pl => (
                <div key={pl.id} className="item" onClick={() => {setActivePlaylistId(pl.id); setView('playlist');}}>
                   <div style={{width:'100%', aspectRatio:'1', backgroundColor:'#333', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px'}}>
                     {pl.songs.length > 0 ? <img src={pl.songs[0].cover} alt="pl" style={{width:'100%', height:'100%', borderRadius:'6px', objectFit:'cover'}} /> : <span style={{fontSize:'40px'}}>🎵</span>}
                   </div>
                   <div style={{display:'flex', justifyContent:'space-between'}}><h4>{pl.name}</h4><span onClick={(e) => deletePlaylist(pl.id, e)} style={{cursor:'pointer', color:'#b3b3b3'}}>🗑</span></div>
                   <p>{pl.songs.length} Songs</p>
                </div>
              ))}

              {view !== 'library' && filteredSongs.map((song) => {
                const isFollowing = following.includes(song.artistUid);
                return (
                  <div key={song.id} className="item" onClick={() => handlePlaySong(song)}>
                    <div style={{position:'relative'}}>
                       <img src={song.cover} alt="cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                       <div className="play-btn">▶</div>
                    </div>
                    
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <h4 style={{width:'75%', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{song.title}</h4>
                      <div style={{display:'flex', gap:'5px'}}>
                        <button onClick={(e) => toggleLike(song, e)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', color: checkIsLiked(song.id) ? '#1DB954' : '#b3b3b3'}}>{checkIsLiked(song.id) ? '♥' : '♡'}</button>
                        <button onClick={(e) => openAddToModal(song, e)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color: '#b3b3b3'}}>+</button>
                        <button 
                            onClick={(e) => openCommentsModal(song, e)} 
                            style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', color: '#b3b3b3'}}
                            title="Comments"
                          >
                            💬
                          </button>
                      </div>
                    </div>

                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'5px'}}>
                       <p>{song.artist}</p>
                       {/* FOLLOW BUTTON */}
                       {song.artistUid && (
                         <button 
                           onClick={(e) => handleFollowToggle(song.artistUid, song.artist, e)}
                           style={{
                             background: isFollowing ? 'transparent' : '#1DB954',
                             border: isFollowing ? '1px solid #b3b3b3' : 'none',
                             color: isFollowing ? 'white' : 'black',
                             fontSize: '10px',
                             padding: '4px 8px',
                             borderRadius: '12px',
                             cursor: 'pointer',
                             fontWeight: 'bold'
                           }}
                         >
                           {isFollowing ? 'Following' : 'Follow'}
                         </button>
                       )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showAddToPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width:'350px'}}>
            <h3>Add to Playlist</h3>
            {playlists.map(pl => (
                <button key={pl.id} onClick={() => addSongToPlaylist(pl.id)} style={{width:'100%', textAlign:'left', padding:'10px', backgroundColor:'#333', border:'none', color:'white', borderRadius:'5px', cursor:'pointer', display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>{pl.name}<span style={{color:'#b3b3b3', fontSize:'12px'}}>{pl.songs.length}</span></button>
            ))}
            <button onClick={() => setShowAddToPlaylistModal(false)} style={{width:'100%', marginTop:'10px', backgroundColor:'transparent', border:'1px solid #555', color:'white', padding:'8px', borderRadius:'20px', cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {showCreatePlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width:'400px', textAlign:'center'}}>
            <h2>Create Playlist</h2>
            <input type="text" placeholder="Name" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'20px', backgroundColor:'#333', border:'1px solid #555', color:'white', borderRadius:'4px'}}/>
            <button onClick={createPlaylist} style={{backgroundColor:'#1DB954', border:'none', padding:'10px 20px', borderRadius:'20px', fontWeight:'bold', cursor:'pointer'}}>Create</button>
            <button onClick={() => setShowCreatePlaylistModal(false)} style={{marginLeft:'10px', backgroundColor:'transparent', border:'1px solid #555', color:'white', padding:'10px 20px', borderRadius:'20px', cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}><h2>Recently Played</h2><button onClick={() => setShowHistory(false)} style={{background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer'}}>×</button></div>
              {history.length === 0 ? <p style={{color:'#777'}}>No history yet.</p> : history.map((s, i) => (<div key={i} onClick={() => handlePlaySong(s)} style={{display:'flex', alignItems:'center', gap:'15px', padding:'8px', borderRadius:'4px', cursor:'pointer', backgroundColor:'#181818', marginBottom:'5px'}}><img src={s.cover} style={{width:'40px', borderRadius:'4px'}} alt=""/><div><div style={{fontSize:'14px', fontWeight:'bold'}}>{s.title}</div><div style={{fontSize:'12px', color:'#B3B3B3'}}>{s.artist}</div></div></div>))}
           </div>
        </div>
      )}

      {showCommentsModal && songForComments && (
        <div className="modal-overlay">
          <div className="modal-content" style={{width:'400px', maxHeight:'80vh', display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
               <h3>Comments for {songForComments.title}</h3>
               <button onClick={() => setShowCommentsModal(false)} style={{background:'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer'}}>×</button>
            </div>

            <div style={{flex:1, overflowY:'auto', marginBottom:'15px', paddingRight:'5px'}}>
              {commentsList.length === 0 ? <p style={{color:'#777', fontStyle:'italic'}}>No comments yet. Be the first!</p> : null}
              {commentsList.map(comment => (
                <div key={comment.id} style={{backgroundColor:'#2a2a2a', padding:'10px', borderRadius:'5px', marginBottom:'10px'}}>
                  <div style={{fontSize:'12px', color:'#1DB954', fontWeight:'bold', marginBottom:'2px'}}>
                    {comment.userName}
                  </div>
                  <div style={{fontSize:'13px', color:'#eee'}}>{comment.text}</div>
                </div>
              ))}
            </div>

            <div style={{display:'flex', gap:'10px'}}>
              <input 
                type="text" 
                value={newCommentText} 
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                style={{flex:1, padding:'10px', borderRadius:'20px', border:'none', outline:'none'}}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()} 
              />
              <button onClick={handlePostComment} style={{backgroundColor:'#1DB954', border:'none', padding:'0 15px', borderRadius:'20px', fontWeight:'bold', cursor:'pointer'}}>Post</button>
            </div>
          </div>
        </div>
      )}

      {currentSong && currentSong.url && (
        <div className="bottom-player">
           <div style={{display:'flex', alignItems:'center', width:'30%'}}>
             <img src={currentSong.cover} alt="cover" style={{height:'56px', width:'56px', borderRadius:'4px', marginRight:'15px', objectFit:'cover'}} />
             <div><div style={{fontWeight:'bold', fontSize:'14px', color:'white'}}>{currentSong.title}</div><div style={{fontSize:'11px', color:'#B3B3B3'}}>{currentSong.artist}</div></div>
           </div>
           <div className="player-controls" style={{display:'flex', flexDirection:'column', alignItems:'center', width:'40%'}}>
             <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'5px'}}>
                <button onClick={() => skipSong(-1)}>⏮</button><button onClick={togglePlayPause} className="play-circle">{isPlaying ? '⏸' : '▶'}</button><button onClick={() => skipSong(1)}>⏭</button>
             </div>
             <div style={{width:'100%', display:'flex', alignItems:'center', gap:'10px', fontSize:'11px', color:'#b3b3b3'}}>
                <span>{formatTime(currentTime)}</span>
                <div onClick={handleSeek} style={{flex:1, height:'4px', background:'#535353', borderRadius:'2px', cursor:'pointer', position:'relative'}}><div style={{width: `${(currentTime / (duration || 1)) * 100}%`, height:'100%', background:'#b3b3b3', borderRadius:'2px'}}></div></div>
                <span>{formatTime(duration)}</span>
             </div>
           </div>
           <div style={{width:'30%', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'14px', color:'#b3b3b3'}}>🔊</span>
             <div onClick={handleVolumeChange} style={{width:'80px', height:'4px', background:'#535353', borderRadius:'2px', cursor:'pointer'}}><div style={{width: `${volume * 100}%`, height:'100%', background:'#1db954', borderRadius:'2px'}}></div></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListenerDashboard;