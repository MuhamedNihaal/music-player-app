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
        <img src={`http://localhost:5000/${song.coverImage}`} alt={song.title} className="mr-2 w-12 h-12" />
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
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    axios.get('http://localhost:5000/songs')
      .then(response => {
        setSongs(response.data);
        if (response.data.length > 0) {
          setCurrentSong(response.data[0]);
        }
      })
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    if (currentSong) {
      const audioSrc = `http://localhost:5000/${currentSong.audioSrc}`;
      axios.get(audioSrc)
        .then(() => {
          audioRef.current.src = audioSrc;
          audioRef.current.currentTime = currentTime;
          audioRef.current.volume = volume;
          audioRef.current.playbackRate = playbackRate;
          if (isPlaying) {
            audioRef.current.play().catch(error => console.log('Playback error:', error));
          } else {
            audioRef.current.pause();
          }
        })
        .catch(error => console.log('Audio source error:', error));
    }
  }, [currentSong, isPlaying, currentTime, volume, playbackRate]);


  useEffect(() => {
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);


  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  }, []);

  useEffect(() => {
    const throttledHandleTimeUpdate = throttle(handleTimeUpdate, 100);
    audioRef.current.addEventListener('timeupdate', throttledHandleTimeUpdate);
    return () => {
      audioRef.current.removeEventListener('timeupdate', throttledHandleTimeUpdate);
    };
  }, []);


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
        <div className="w-1/5 bg-black p-4 flex flex-col justify-between">
          {/* Branding */}
          <div>
            <div className="flex items-center mb-8">
              <img src="http://localhost:5000/images/music.png" alt="DreamMusic Logo" className="mr-2" style={{ width: '40px', height: '40px' }} />
              <span className="text-xl font-bold">DreamMusic</span>
            </div>
            {/* Navigation */}
            <nav>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <img src="http://localhost:5000/images/home.png" alt="Home Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Home</a>
                </li>
                <li className="flex items-center">
                  <img src="http://localhost:5000/images/trend.png" alt="Trends Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Trends</a>
                </li>
                <li className="flex items-center">
                  <img src="http://localhost:5000/images/library.png" alt="Library Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Library</a>
                </li>
                <li className="flex items-center">
                  <img src="http://localhost:5000/images/compass.png" alt="Discover Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                  <a href="#" className="hover:text-zinc-400">Discover</a>
                </li>
              </ul>
            </nav>
          </div>
          {/* Settings and Logout */}
          <div>
            <ul className="space-y-4">
              <li className="flex items-center">
                <img src="http://localhost:5000/images/settings.png" alt="Settings Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
                <a href="#" className="hover:text-zinc-400">Settings</a>
              </li>
              <li className="flex items-center">
                <img src="http://localhost:5000/images/logout.png" alt="Logout Icon" className="mr-2" style={{ width: '25px', height: '25px' }} />
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
          <div className="relative bg-[url('http://localhost:5000/images/michael-jackson.png')] bg-cover bg-center rounded-lg p-6 text-white" style={{ backgroundImage: "url('http://localhost:5000/images/michael-jackson.png')" }}>
            <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
            <div className="relative z-10 flex items-center">
              <img src="http://localhost:5000/images/verified.png" alt="verified-badge" className="mr-2" style={{ width: '20px', height: '20px' }} />
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
        <div className="w-1/4 bg-red-800 p-4 flex flex-col items-center">
          {currentSong && (
            <div className="bg-black rounded-md p-4 flex flex-col items-center w-full">
              <div className="text-white mb-2">Now Playing</div>
              <img src={`http://localhost:5000/${currentSong.coverImage}`} alt={currentSong.title} className="rounded-md mb-2 w-48 h-48" />
              <div className="text-center">
                <div className="text-white font-semibold text-lg">{currentSong.title}</div>
                <div className="text-zinc-400 text-sm">{currentSong.album}</div>
              </div>
            </div>
          )}
          <AudioPlayer
            src={`http://localhost:5000/${currentSong?.audioSrc}`}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClickPrevious={handlePrevious}
            onClickNext={handleNext}
            customAdditionalControls={[]}
            customVolumeControls={[]}
            customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION,
            ]}
            volume={volume}
            onVolumeChange={(e) => setVolume(e.target.volume)}
            onListen={(e) => setCurrentTime(e.target.currentTime)}
            listenInterval={1000}
            playbackRate={playbackRate}
          />
        </div>

      </div>
    </DndProvider>
  );
}