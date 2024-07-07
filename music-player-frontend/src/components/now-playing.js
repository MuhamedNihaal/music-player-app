import React from 'react';

const NowPlaying = ({ currentSong, audioRef, isPlaying, handlePlayPause, handleNext, handlePrevious }) => {
  return (
    <div className="w-1/4 bg-zinc-900 p-4 flex flex-col justify-between">
      <div>
        {/* Player Controls */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevious}>
            <img src="previous.png" alt="Previous" style={{ width: '25px', height: '25px' }} />
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? (
              <img src="pause.png" alt="Pause" style={{ width: '25px', height: '25px' }} />
            ) : (
              <img src="play.png" alt="Play" style={{ width: '25px', height: '25px' }} />
            )}
          </button>
          <button onClick={handleNext}>
            <img src="next.png" alt="Next" style={{ width: '25px', height: '25px' }} />
          </button>
        </div>

        {/* Current Song */}
        <div className="flex items-center mb-4">
          <img src={currentSong?.coverImage} alt={currentSong?.title} className="w-16 h-16 mr-4" />
          <div>
            <h3 className="text-lg font-bold">{currentSong?.title}</h3>
            <p>{currentSong?.artist}</p>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} controls className="w-full">
        <source src={currentSong?.audioUrl} type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default NowPlaying;
