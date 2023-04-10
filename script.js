const CLIENT_ID = 'c5cd3f54f3264c418b632275ae824aa6';
const CLIENT_SECRET = 'baf0de03970a4248ba1ee40dabc2cc5c';
const form = document.querySelector('form');
const input = document.querySelector('input');
let currentlyPlayingIndex = -1;
let audio = new Audio();

form.addEventListener('submit', e => {
	e.preventDefault();
	const query = input.value;
	input.value = '';
	const songContainer = document.querySelector('.song-container');
	if (songContainer) {
		songContainer.remove();
	}
	main(query);
});

async function main(query = 'Eminem') {
	const tracks = await searchSpotify(query);
	createSongElements(tracks);
}

async function searchSpotify(query) {
	const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=9`;

	const token = await getToken(CLIENT_ID, CLIENT_SECRET);

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const { tracks } = await response.json();
	const { items } = tracks;

	console.log(items);
	return items;
}

async function getToken(client_id, client_secret) {
	const url = 'https://accounts.spotify.com/api/token';
	const data = new URLSearchParams();
	data.append('grant_type', 'client_credentials');
	data.append('client_id', client_id);
	data.append('client_secret', client_secret);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: data,
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const json = await response.json();
	return json.access_token;
}

function createSongElements(songs) {
	const songContainer = document.createElement('div');
	songContainer.classList.add('song-container');

	songs.forEach(song => {
		const songDiv = document.createElement('div');
		songDiv.classList.add('song');

		const img = document.createElement('img');
		img.src = song.album.images[0].url;

		const title = document.createElement('h3');
		title.textContent = song.name;

		const artist = document.createElement('p');
		artist.textContent = song.artists.map(artist => artist.name).join(', ');

		const audio = document.createElement('audio');
		audio.controls = true;
		audio.volume = 0.1;
		audio.src = song.preview_url;
		audio.addEventListener('play', () => {
			playTrack(songs.indexOf(song));
		});

		songDiv.appendChild(img);
		songDiv.appendChild(title);
		songDiv.appendChild(artist);
		songDiv.appendChild(audio);

		songContainer.appendChild(songDiv);
	});

	document.body.appendChild(songContainer);
}

function playTrack(index) {
	const songElements = Array.from(document.querySelectorAll('.song'));

	const nowToPlayElement = songElements[index];
	const nowToPlayAudio = nowToPlayElement.children[3];

	const currentlyPlayingElement = songElements[currentlyPlayingIndex];
	const currentlyPlayingAudio = currentlyPlayingElement?.children[3] ?? null;

	if (currentlyPlayingAudio) {
		currentlyPlayingAudio.pause();
	}

	currentlyPlayingIndex = index;
	updateCurrentlyPlaying();
}

function updateCurrentlyPlaying() {
	const songElements = document.querySelectorAll('.song');
	songElements.forEach(element => {
		element.classList.remove('currently-playing');
	});

	// Add the "currently-playing" class to the track element for the currently playing track
	if (currentlyPlayingIndex >= 0) {
		const currentlyPlayingElement = songElements[currentlyPlayingIndex];
		currentlyPlayingElement.classList.add('currently-playing');
	}
}

main();
