const http = require('http');
const fs = require('fs');
const { url } = require('inspector');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here
    const urlParts = req.url.split('/');
    const deleteMessage = {
      message: "Successfully deleted"
    }

    if (req.method === 'GET') {
      // get all artists
      if (req.url === '/artists') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artists));
      }

      // get artist details from artistId
      if (req.url.startsWith('/artists/') && urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artist));
      }

      // get all album from artist based on artistId
      if (req.url.endsWith('albums') && urlParts.length === 4) {
        const artistId = urlParts[2];
        let artistAlbums = {};

        for (id in albums) {
          let album = albums[id];

          if (album.artistId === Number(artistId)) {
            artistAlbums[id] = album;
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artistAlbums));
      }
    }

    if (req.method === 'POST') {
      // add an artist
      if (req.url === '/artists/') {
        const newId = getNewArtistId();

        artists[newId] = {
          artistId: newId,
          ...req.body
        }

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artists[newId]));
      }
    }

    if (req.method === 'PATCH') {
      // edit artist by artistId
      if (req.url.startsWith('/artists/') && urlParts.length === 3) {
        const artistId = urlParts[2];

        artists[artistId] = {
          artistId: Number(artistId),
          ...req.body
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artists[artistId]));
      }
    }

    if (req.method === 'DELETE') {
      // delete artist by artistId
      if (req.url.startsWith('/artists/') && urlParts.length === 3) {
        const artistId = urlParts[2];
        delete artists[artistId];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(deleteMessage));
      }
    }


    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
