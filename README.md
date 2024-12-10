# slurpi
Slurp up API data!


This is an unstable node application that uses your developer API keys to pull down data, format it, and store it in a SQLite database. It can also download images associated with the data, as well as generate JSON files for the data. The code isn't pretty, so if you need to change something chances are you'll have to get your hands dirty.

The way I handle my saved items on these platform is that I "like" or "favorite" everything i want to keep so that it is automatically put into a default list. I then work backwards from there. For example: with TMDB I "favorite" every movie that i've seen. If I liked that movie a lot, I rate it. This way, I have a generic list of everything I've watched, and then a further list of things I liked. Specifically with TMDB, you get your ratings as a number 0-10 so you can sort them as you like using that.

## APIs Used

### TMDB (The Movie Database)
[themoviedb.org](https://themoviedb.org) is a place to favorite and rate Movies and TV Shows as well as the poeople who create and star in them.

**TMDB Data**
- movies
  - favorited movies
  - rated movies
- tv
  - rated tv
  - favorited tv

Movies and TV (shows) are queried separately for `favorite` and `rated` based on the TMDB API. They have a `rating` column in the DB which defaults to `null` and populates if the movie/show is rated.

**TMDB Images**
Images can be downloaded for movies and tv. The images are based off of the associated "poster" image and will be `.jpg` files named with the movie or tv show `id`.

### Steam
[steam](https://store.steampowered.com/) is a game distribution service by Valve that's been around for a long time.

**Steam Data**
- owned games
- recently played games
- owned games details (many requests, prone to rate-limiting)

Owned games returns a list of all your games by `appid`, as well as the total time played - it doesn't have any other information, not even the game's title. Same thing for recent games, however they do have the game title. So we need to get all the game details after getting the list of owned game `appid`s, which seems to require consecutive calls to *each* `appid`'s details. So that means if you have a lot of games (>200), you may get rate limited. You can try to increase the `sleep()` time in the `steamController.js` file, or you can just wait. If you get rate limited it's not really a big deal, as the data is written to the DB per-request, so it'll just pick up where it left off.

**Steam Images**
Images can be downloaded for steam games. The images are based off of the game's "capsule" image and will be `.jpg` files named with the game's `appid`.

### Spotify
[spotify](https://spotify.com) is a popular subscription music service which also has shows/podcasts and audiobooks.

**Spotify Auth**
Spotify requires authentication before getting data, so you'll need to click the "Login to Spotify" button on the Slurpi spotify page, allow it, and then you can get data. This is actually why I turned slurpi from a bunch of random scripts into a UI, I thought it would be fun to do a spotify login because i'll probably never do it anywhere else.

**Spotify Data**
I should have named these a little better, but it's not the end of the world. Sometimes I'm interchanging `song` with `track` in the DB or Meta, so just a note there.

- saved tracks
- top tracks (top 10, `long_term`)
- saved albums
- saved artists
- saved shows (podcasts)

**Spotify Images**
Images can be downloaded for spotify tracks, albums, artists, and shows. All Spotify images will be `.jpg` files named with the corresponding `id` (ie. track id, album id, artist id, show id). Note: the track images are taken from the track's `album` data - the other sources have their own image data.