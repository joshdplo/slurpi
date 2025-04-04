import RadioStation from '../db/RadioStation.js';

const stations = [
  {
    id: 'somafm_indiepoprocks',
    name: 'Indie Pop Rocks (Soma FM)',
    genres: ['indie', 'indie pop', 'indie rock'],
    url: 'https://somafm.com/indiepop/',
    super: false,
    mega: true
  },
  {
    id: 'somafm_deepspaceone',
    name: 'Deep Space One (Soma FM)',
    genres: ['electronic', 'ambient'],
    url: 'https://somafm.com/deepspaceone/',
    super: false,
    mega: false
  },
  {
    id: 'difm_vocaltrance',
    name: 'Vocal Trance (DI FM)',
    genres: ['electronic', 'vocal trance'],
    url: 'https://www.di.fm/vocaltrance',
    super: false,
    mega: false
  },
  {
    id: 'difm_deephouse',
    name: 'Deep House (DI FM)',
    genres: ['electronic', 'house', 'deep house'],
    url: 'https://www.di.fm/deephouse',
    super: false,
    mega: false
  },
  {
    id: 'difm_spacedreams',
    name: 'Space Dreams (DI FM)',
    genres: ['electronic', 'ambient'],
    url: 'https://www.di.fm/spacemusic',
    super: false,
    mega: false
  },
];

export function populateRadioStations() {
  console.log('-> Populating Radio Station Entries...');
  return new Promise((resolve, reject) => {
    try {
      stations.forEach(async station => {
        const dbStation = await RadioStation.findByPk(station.id);
        if (dbStation) {
          await dbStation.update(station);
        } else {
          await RadioStation.create(station);
        }
      });

      console.log('-> Finished Populating Radio Stations');
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}
