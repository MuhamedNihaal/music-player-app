import './App.css';
import './styles/tailwind.css';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { throttle, debounce } from 'lodash';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';

const ItemType = 'SONG';

const DraggableSong = React.memo(({ song, index, moveSong, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSong(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <tr
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`py-2 px-4 ${song.isCurrent ? 'bg-red-800' : 'bg-zinc-800'}`}
      onClick={() => onClick(song)}
    >
      <td className="py-2 px-4">{index + 1}</td>
      <td className="py-2 px-4 flex items-center">
        <img src={`https://music-player-app-backend.onrender.com/${song.coverImage}`} alt={song.title} className="mr-2 w-12 h-12" />
        {song.title}
      </td>
      <td className="py-2 px-4">{song.playCount}</td>
      <td className="py-2 px-4">{song.duration}</td>
      <td className="py-2 px-4">{song.album}</td>
    </tr>
  );
});

export default function Widget() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(new Audio());
  // const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    axios.get('https://music-player-app-backend.onrender.com/songs')
      .then(response => {
        setSongs(response.data);
        if (response.data.length > 0) {
          setCurrentSong(response.data[0]);
        }
      })
      .catch(error => console.log(error));
  }, []);

  // useEffect(() => {
  //   if (currentSong) {
  //     const audioSrc = `https://music-player-app-backend.onrender.com/${currentSong.audioSrc}`;
  //     audioRef.current.src = audioSrc;
  //     audioRef.current.currentTime = currentTime;
  //     audioRef.current.volume = volume;
  //     audioRef.current.playbackRate = playbackRate;
  //     if (isPlaying) {
  //       audioRef.current.play().catch(error => console.log('Playback error:', error));
  //     } else {
  //       audioRef.current.pause();
  //     }
  //   }
  // }, [currentSong]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.volume = volume;
  //   }
  // }, [volume]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.playbackRate = playbackRate;
  //   }
  // }, [playbackRate]);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     if (isPlaying) {
  //       audioRef.current.play().catch(error => console.log('Playback error:', error));
  //     } else {
  //       audioRef.current.pause();
  //     }
  //   }
  // }, [isPlaying]);


  // useEffect(() => {
  //   audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
  //   return () => {
  //     audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
  //   };
  // }, []);


  // const handleTimeUpdate = useCallback(() => {
  //   setCurrentTime(audioRef.current.currentTime);
  //   setDuration(audioRef.current.duration);
  // }, []);

  // useEffect(() => {
  //   const throttledHandleTimeUpdate = throttle(handleTimeUpdate, 100);
  //   audioRef.current.addEventListener('timeupdate', throttledHandleTimeUpdate);
  //   return () => {
  //     audioRef.current.removeEventListener('timeupdate', throttledHandleTimeUpdate);
  //   };
  // }, [handleTimeUpdate]);

  const handlePlay = useCallback((song) => {
    setSongs(prevSongs =>
      prevSongs.map(prevSong => ({
        ...prevSong,
        isCurrent: prevSong.id === song.id // Update isCurrent for the selected song
      }))
    );
    setCurrentSong(song);
    setIsPlaying(true); // Start playing when song changes
  }, []);


  const handleNext = useCallback(() => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]);
    } else {
      setCurrentSong(songs[(songs.indexOf(currentSong) + 1) % songs.length]);
    }
  }, [songs, currentSong, isShuffle]);

  const handlePrevious = useCallback(() => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]);
    } else {
      setCurrentSong(songs[(songs.indexOf(currentSong) - 1 + songs.length) % songs.length]);
    }
  }, [songs, currentSong, isShuffle]);

  const moveSong = (fromIndex, toIndex) => {
    const updatedSongs = [...songs];
    const [movedSong] = updatedSongs.splice(fromIndex, 1);
    updatedSongs.splice(toIndex, 0, movedSong);
    setSongs(updatedSongs);
  };

  const filteredSongs = useMemo(() => songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  ), [songs, searchTerm]);

  const debouncedSetSearchTerm = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gradient-to-r from-black to-zinc-900 text-white">
        {/* Left Sidebar */}
        <div className="w-1/5 bg-dark-red-gradient p-4 flex flex-col justify-between">
          {/* Branding */}
          <div>
            <div className="flex items-center mb-8">
              <img src="https://music-player-app-backend.onrender.com/images/music.png" alt="DreamMusic Logo" className="mr-2" style={{ width: '40px', height: '40px' }} />
              <span className="text-xl font-bold">
                <span style={{ color: '#f56565' }}>Dream</span>Music
              </span>
            </div>

            {/* Navigation */}
            <nav>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <img src="https://music-player-app-backend.onrender.com/images/home.png" alt="Home Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Home</a>
                </li>
                <li className="flex items-center">
                  <img src="https://music-player-app-backend.onrender.com/images/trend.png" alt="Trends Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Trends</a>
                </li>
                <li className="flex items-center">
                  <img src="https://music-player-app-backend.onrender.com/images/library.png" alt="Library Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Library</a>
                </li>
                <li className="flex items-center">
                  <img src="https://music-player-app-backend.onrender.com/images/compass.png" alt="Discover Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Discover</a>
                </li>
              </ul>
            </nav>
          </div>
          {/* Settings and Logout */}
          <div>
            <ul className="space-y-4">
              <li className="flex items-center">
                <img src="https://music-player-app-backend.onrender.com/images/settings.png" alt="Settings Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                <a href="#" className="hover:text-zinc-400">Settings</a>
              </li>
              <li className="flex items-center">
                <img src="https://music-player-app-backend.onrender.com/images/logout.png" alt="Logout Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                <a href="#" className="hover:text-zinc-400">Logout</a>
              </li>
            </ul>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="flex justify-between items-center mb-6">
            <nav className="space-x-8">
              <a href="#" className="hover:text-zinc-400">Music</a>
              <a href="#" className="hover:text-zinc-400">Podcast</a>
              <a href="#" className="hover:text-zinc-400">Live</a>
              <a href="#" className="hover:text-zinc-400">Radio</a>
            </nav>
            {/* Search Box */}
            <div>
              <input
                type="text"
                placeholder="Search"
                className="bg-zinc-800 p-2 rounded"
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Featured Artist */}
          <div className="relative bg-[url('https://music-player-app-backend.onrender.com/images/michael-jackson.png')] bg-cover bg-center rounded-lg p-6 text-white" style={{ backgroundImage: "url('https://music-player-app-backend.onrender.com/images/michael-jackson.png')" }}>
            <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
            <div className="relative z-10 flex items-center">
              <img src="https://music-player-app-backend.onrender.com/images/verified.png" alt="verified-badge" className="mr-2" style={{ width: '20px', height: '20px' }} />
              <span className="text-sm">Verified Artist</span>
            </div>
            <div className="relative z-10 mt-4">
              <h1 className="text-4xl font-bold">Michael Jackson</h1>
              <p className="text-lg">27.852.501 monthly listeners</p>
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto">
            <table className="table-auto w-full text-left">
              <thead className="sticky top-0 bg-zinc-900">
                <tr>
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Title</th>
                  <th className="py-2 px-4">Listners</th>
                  <th className="py-2 px-4">Time</th>
                  <th className="py-2 px-4">Album</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, index) => (
                  <DraggableSong
                    key={song.id}
                    song={song}
                    index={index}
                    moveSong={moveSong}
                    onClick={handlePlay}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Now Playing */}
        <div className="w-1/5 bg-fading-red p-4 flex flex-col justify-between">
          {currentSong && (
            <div>
              <h2 className="text-xl font-bold mb-4">Now Playing</h2>
              <img
                src={`https://music-player-app-backend.onrender.com/${currentSong.coverImage}`}
                alt={currentSong.title}
                className="w-full h-auto mb-4"
              />
              <h3 className="text-lg">{currentSong.title}</h3>
              <p>{currentSong.artist}</p>
            </div>
          )}
          <AudioPlayer
            ref={audioRef}
            src={currentSong ? `https://music-player-app-backend.onrender.com/${currentSong.audioSrc}` : ""}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleNext}
            customControlsSection={[
              RHAP_UI.MAIN_CONTROLS,
              RHAP_UI.VOLUME_CONTROLS,
              RHAP_UI.ADDITIONAL_CONTROLS,
            ]}
            showSkipControls
            showJumpControls={false}
            onClickNext={handleNext}
            onClickPrevious={handlePrevious}
            onVolumeChange={(e) => setVolume(e.target.volume)}
            onListen={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            customAdditionalControls={[]}
          />
        </div>

      </div>
    </DndProvider>
  );
}
