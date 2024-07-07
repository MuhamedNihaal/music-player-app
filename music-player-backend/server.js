const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'assets')));

const songs = [
  {
    id: 1,
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    playCount: 13570090,
    duration: '4:54',
    album: 'Thriller',
    audioSrc: 'audio/Billie-Jean.mp3',
    coverImage: 'images/billie-jean.png',
  },
  {
    id: 2,
    title: 'Beat It',
    artist: 'Michael Jackson',
    playCount: 234678099,
    duration: '4:18',
    album: 'Thriller',
    audioSrc: 'audio/Beat-it.mp3',
    coverImage: 'images/beat-it.png',
  },
  {
    id: 3,
    title: 'Smooth Criminal',
    artist: 'Michael Jackson',
    playCount: 9876567448,
    duration: '4:17',
    album: 'Bad',
    audioSrc: 'audio/Smooth-Criminal.mp3',
    coverImage: 'images/smooth-criminal.png',
  },
  {
    id: 4,
    title: 'Thriller',
    artist: 'Michael Jackson',
    playCount: 7658432001,
    duration: '5:57',
    album: 'Thriller',
    audioSrc: 'audio/Thriller.mp3',
    coverImage: 'images/thriller.png',
  },
];

app.get('/songs', (req, res) => {
  res.json(songs);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
