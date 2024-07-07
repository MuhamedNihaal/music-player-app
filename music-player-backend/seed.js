const mongoose = require('mongoose');
const Song = require('./Song'); // Adjust the import according to your file structure

mongoose.connect('mongodb://localhost:27017/music-player', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');

  const initialSongs = [
    {
      id: 1,
      title: 'Billie Jean',
      playCount: 1040814084,
      duration: '4:53',
      album: 'Thriller 25 Super Deluxe Edition',
      coverImage: 'billie-jean.png'
    },
    {
      id: 2,
      title: 'Beat It',
      playCount: 643786045,
      duration: '4:18',
      album: 'Thriller 25 Super Deluxe Edition',
      coverImage: 'beat-it.png'
    },
    {
      id: 3,
      title: 'Smooth Criminal',
      playCount: 719669203,
      duration: '4:17',
      album: 'Bad 25th Anniversary',
      coverImage: 'smooth-criminal.png'
    },
    {
      id: 4,
      title: 'Thriller',
      playCount: 604132781,
      duration: '5:57',
      album: 'Thriller 25 Super Deluxe Edition',
      coverImage: 'thriller.png'
    },
    // Add more songs as needed
  ];

  Song.insertMany(initialSongs, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Successfully seeded database');
    }
    mongoose.connection.close();
  });
});
