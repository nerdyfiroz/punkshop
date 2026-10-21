import { MediaItem } from '../types';

export const SAMPLE_VIDEOS = {
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  bigBuckBunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  elephantsDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  weAreGoingOnBullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  subaruOutback: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
};

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: 'cyber-chronicles-2099',
    title: 'Cyber Chronicles: 2099',
    slug: 'cyber-chronicles-2099',
    type: 'movie',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    overview: 'In a rain-drenched neon metropolis governed by synthetic intelligence, a rogue neural detective uncovers a forbidden memory archive that could dismantle the megacity hierarchy.',
    editorialReview: 'Cyber Chronicles: 2099 stands as a benchmark in modern science-fiction cinema. Combining atmospheric practical set design with groundbreaking visual effects, the film explores poignant questions of identity, synthetic consciousness, and humanity in a hyper-digitized age. The pacing is tight, accompanied by an electronic analog synth score that enhances every action sequence.',
    releaseYear: 2025,
    releaseDate: '2025-11-14',
    rating: 8.8,
    voteCount: 48920,
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    duration: '2h 14m',
    ageRating: 'PG-13',
    director: 'Denis V. Laurent',
    cast: [
      { name: 'Kaelen Voss', character: 'Detective Jaxon Reed', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Sora Tanaka', character: 'Echo (AI Nexus)', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      { name: 'Marcus Sterling', character: 'Councilor Vance', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'United States',
    quality: '4K UHD',
    audio: ['Dolby Atmos 7.1', 'English 5.1', 'Spanish 5.1'],
    subtitles: ['English [CC]', 'Spanish', 'French', 'German', 'Japanese', 'Arabic'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN - US)', region: 'North America', badge: 'Ultra Fast', quality: '4K / 1080p', videoUrl: SAMPLE_VIDEOS.tearsOfSteel },
      { id: 'srv-2', name: 'Server 2 (HydraStream - EU)', region: 'Europe', badge: 'Bufferless', quality: '1080p FHD', videoUrl: SAMPLE_VIDEOS.tearsOfSteel },
      { id: 'srv-3', name: 'Server 3 (AlphaMirror - ASIA)', region: 'Asia-Pacific', badge: 'HD Direct', quality: '720p HD', videoUrl: SAMPLE_VIDEOS.tearsOfSteel },
    ],
    videoUrl: SAMPLE_VIDEOS.tearsOfSteel,
    downloadOptions: [
      {
        id: 'dl-4k',
        quality: '4K UHD',
        resolution: '3840x2160',
        format: 'MKV',
        size: '4.8 GB',
        codec: 'HEVC / H.265 10-bit',
        audio: 'Dolby TrueHD 7.1',
        directUrl: SAMPLE_VIDEOS.tearsOfSteel,
        seeders: 1420,
        leechers: 85
      },
      {
        id: 'dl-1080p',
        quality: '1080p FHD',
        resolution: '1920x1080',
        format: 'MP4',
        size: '1.9 GB',
        codec: 'x264 High Profile',
        audio: 'AAC 5.1 Dual Audio',
        directUrl: SAMPLE_VIDEOS.tearsOfSteel,
        seeders: 3890,
        leechers: 210
      },
      {
        id: 'dl-720p',
        quality: '720p HD',
        resolution: '1280x720',
        format: 'MP4',
        size: '950 MB',
        codec: 'x264 Standard',
        audio: 'Stereo 2.0',
        directUrl: SAMPLE_VIDEOS.tearsOfSteel,
        seeders: 2410,
        leechers: 95
      },
      {
        id: 'dl-480p',
        quality: '480p SD',
        resolution: '854x480',
        format: 'MP4',
        size: '420 MB',
        codec: 'x264 Mobile Web',
        audio: 'AAC Mobile Stereo',
        directUrl: SAMPLE_VIDEOS.tearsOfSteel,
        seeders: 1100,
        leechers: 45
      }
    ],
    isTrending: true,
    isFeatured: true,
    isLatest: true,
    views: 312400,
    downloadsCount: 89450,
    faq: [
      { question: 'Is Cyber Chronicles: 2099 safe to download on PunkShop?', answer: 'Yes, all download links are scanned for malware and verified through MD5 checksum hash prior to indexing.' },
      { question: 'What video quality is best for mobile screens?', answer: 'For mobile viewing, the 720p or 480p SD MP4 file is highly recommended due to balanced file size (under 500MB) and smooth battery-efficient decoding.' }
    ]
  },
  {
    id: 'chronicles-of-the-abyss',
    title: 'Chronicles of the Abyss',
    slug: 'chronicles-of-the-abyss',
    type: 'tv',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    overview: 'A deep-sea research crew stumbles upon an ancient subterranean structure resting 8,000 meters beneath the Mariana Trench, harboring biological artifacts from a forgotten civilization.',
    editorialReview: 'Chronicles of the Abyss is a masterclass in cosmic dread and oceanic claustrophobia. Across each episode, the tension ratchets exponentially. High production values elevate the underwater mechanics, making it one of the premier binge-worthy TV series of the decade.',
    releaseYear: 2024,
    releaseDate: '2024-09-20',
    rating: 8.9,
    voteCount: 62100,
    genres: ['Sci-Fi', 'Mystery', 'Drama', 'Horror'],
    duration: '2 Seasons',
    ageRating: 'TV-MA',
    director: 'Elena Rostova',
    cast: [
      { name: 'Dr. Aaron Meyer', character: 'Marine Biologist', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Cmdr. Naomi Price', character: 'Submarine Captain', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
      { name: 'Tarek Chen', character: 'Acoustic Engineer', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'United Kingdom',
    quality: '4K UHD',
    audio: ['English 5.1', 'German 5.1'],
    subtitles: ['English', 'Spanish', 'French', 'Russian'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'North America', badge: 'Recommended', quality: '4K UHD', videoUrl: SAMPLE_VIDEOS.elephantsDream },
      { id: 'srv-2', name: 'Server 2 (TitanStream)', region: 'Europe', badge: 'Fast', quality: '1080p FHD', videoUrl: SAMPLE_VIDEOS.elephantsDream },
    ],
    videoUrl: SAMPLE_VIDEOS.elephantsDream,
    downloadOptions: [
      {
        id: 'dl-s1-batch',
        quality: '1080p FHD',
        resolution: '1920x1080',
        format: 'ZIP / MKV',
        size: '12.4 GB',
        codec: 'HEVC x265',
        audio: 'Dolby Atmos',
        directUrl: SAMPLE_VIDEOS.elephantsDream,
        seeders: 5120,
        leechers: 310
      }
    ],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Deep Silence',
        episodeCount: 4,
        episodes: [
          {
            id: 's01e01',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'Descent into Trench Zero',
            duration: '52m',
            overview: 'The research vessel Leviathan launches its submersible into the uncharted depths of the Mariana Trench.',
            stillUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.elephantsDream,
            downloadOptions: [
              { id: 'ep1-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.2 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.elephantsDream },
              { id: 'ep1-720', quality: '720p HD', resolution: '720p', format: 'MP4', size: '580 MB', codec: 'x264', audio: 'Stereo', directUrl: SAMPLE_VIDEOS.elephantsDream }
            ]
          },
          {
            id: 's01e02',
            episodeNumber: 2,
            seasonNumber: 1,
            title: 'Sonar Anomalies',
            duration: '48m',
            overview: 'Unexplained rhythmic seismic pulses force the crew to decide whether to ascend or breach the mysterious monolith.',
            stillUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.tearsOfSteel,
            downloadOptions: [
              { id: 'ep2-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.1 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.tearsOfSteel },
              { id: 'ep2-720', quality: '720p HD', resolution: '720p', format: 'MP4', size: '540 MB', codec: 'x264', audio: 'Stereo', directUrl: SAMPLE_VIDEOS.tearsOfSteel }
            ]
          },
          {
            id: 's01e03',
            episodeNumber: 3,
            seasonNumber: 1,
            title: 'The Biometric Seal',
            duration: '54m',
            overview: 'A hazardous EVA expedition reveals organic markings etched on impervious metallic alloys.',
            stillUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.sintel,
            downloadOptions: [
              { id: 'ep3-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.3 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.sintel }
            ]
          },
          {
            id: 's01e04',
            episodeNumber: 4,
            seasonNumber: 1,
            title: 'Resonance',
            duration: '59m',
            overview: 'The crew discovers the structure is not a ruin—it is an active beacon reaching outward into interstellar space.',
            stillUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.bigBuckBunny,
            downloadOptions: [
              { id: 'ep4-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.4 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.bigBuckBunny }
            ]
          }
        ]
      }
    ],
    isTrending: true,
    isFeatured: true,
    isLatest: false,
    views: 450100,
    downloadsCount: 120500,
    faq: [
      { question: 'Will there be a Season 3 for Chronicles of the Abyss?', answer: 'Official confirmation has indicated production is scheduled for late 2026.' }
    ]
  },
  {
    id: 'valkyrie-rising',
    title: 'Valkyrie: Rising Dawn',
    slug: 'valkyrie-rising-dawn',
    type: 'movie',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
    overview: 'In an alternate Nordic empire where mythological runes fuel celestial dreadnoughts, a disgraced warrior pilot fights to protect the world tree Yggdrasil from orbital siege.',
    editorialReview: 'Spectacular world-building merges ancient mythological folklore with high-octane steampunk starfighter warfare. Valkyrie: Rising Dawn offers visual splendor with grand cinematic scale, heart-pounding combat maneuvers, and deep emotional resonance.',
    releaseYear: 2025,
    releaseDate: '2025-06-18',
    rating: 8.4,
    voteCount: 31200,
    genres: ['Action', 'Fantasy', 'Adventure'],
    duration: '2h 08m',
    ageRating: 'PG-13',
    director: 'Astrid Lindholm',
    cast: [
      { name: 'Freja Solberg', character: 'Captain Sigrid', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
      { name: 'Erik Thorvaldsen', character: 'High Admiral Olaf', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'Sweden / USA',
    quality: '4K UHD',
    audio: ['English Atmos', 'Swedish 5.1'],
    subtitles: ['English', 'Spanish', 'Portuguese', 'Japanese'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'Global', badge: 'High Bandwidth', quality: '4K UHD', videoUrl: SAMPLE_VIDEOS.sintel },
      { id: 'srv-2', name: 'Server 2 (Backup Mirror)', region: 'Europe', badge: 'Stable', quality: '1080p', videoUrl: SAMPLE_VIDEOS.sintel }
    ],
    videoUrl: SAMPLE_VIDEOS.sintel,
    downloadOptions: [
      { id: 'valk-4k', quality: '4K UHD', resolution: '3840x2160', format: 'MKV', size: '5.1 GB', codec: 'x265', audio: 'Atmos 7.1', directUrl: SAMPLE_VIDEOS.sintel, seeders: 2100, leechers: 120 },
      { id: 'valk-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MP4', size: '1.8 GB', codec: 'x264', audio: 'AAC 5.1', directUrl: SAMPLE_VIDEOS.sintel, seeders: 3900, leechers: 200 },
      { id: 'valk-720', quality: '720p HD', resolution: '1280x720', format: 'MP4', size: '890 MB', codec: 'x264', audio: 'Stereo', directUrl: SAMPLE_VIDEOS.sintel, seeders: 1400, leechers: 50 }
    ],
    isTrending: true,
    isFeatured: false,
    isLatest: true,
    views: 289000,
    downloadsCount: 76000,
    faq: [
      { question: 'Can I stream Valkyrie: Rising Dawn without buffering?', answer: 'Yes, select Server 1 (FastCDN) which automatically adapts bitrate based on your local connection speed.' }
    ]
  },
  {
    id: 'whispers-in-the-dark-anime',
    title: 'Shadow Weaver: Tokyo Eclipse',
    slug: 'shadow-weaver-tokyo-eclipse',
    type: 'anime',
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1920&q=80',
    overview: 'High school student Ren accidentally awakens a slumbering shadow entity capable of bending probability, turning the Tokyo subway tunnels into an occult arena.',
    editorialReview: 'Shadow Weaver features jaw-dropping animation fluidity and sakuga battle choreography. It marries supernatural urban fantasy with introspective psychological themes, making it a standout modern anime release.',
    releaseYear: 2026,
    releaseDate: '2026-01-10',
    rating: 9.1,
    voteCount: 51000,
    genres: ['Anime', 'Action', 'Supernatural', 'Fantasy'],
    duration: '1h 56m',
    ageRating: 'PG-13',
    director: 'Kenji Ishikawa',
    cast: [
      { name: 'Ren Kurusu', character: 'Protagonist (Voice)', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      { name: 'Ayame Sato', character: 'Shrine Maiden (Voice)', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'Japan',
    quality: '1080p FHD',
    audio: ['Japanese Original 5.1', 'English Dub 5.1'],
    subtitles: ['English', 'Spanish', 'German', 'Indonesian', 'Thai'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (SakuraCDN)', region: 'Asia-Japan', badge: 'Subbed & Dubbed', quality: '1080p 60fps', videoUrl: SAMPLE_VIDEOS.bigBuckBunny },
      { id: 'srv-2', name: 'Server 2 (HydraStream)', region: 'Global', badge: 'Ultra Smooth', quality: '1080p', videoUrl: SAMPLE_VIDEOS.bigBuckBunny }
    ],
    videoUrl: SAMPLE_VIDEOS.bigBuckBunny,
    downloadOptions: [
      { id: 'anime-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MKV Dual Audio', size: '1.6 GB', codec: 'x264 Hi10P', audio: 'Dual Audio (JP/EN)', directUrl: SAMPLE_VIDEOS.bigBuckBunny, seeders: 4500, leechers: 320 },
      { id: 'anime-720', quality: '720p HD', resolution: '1280x720', format: 'MP4', size: '750 MB', codec: 'x264', audio: 'Japanese AAC', directUrl: SAMPLE_VIDEOS.bigBuckBunny, seeders: 2800, leechers: 110 }
    ],
    isTrending: true,
    isFeatured: true,
    isLatest: true,
    views: 520000,
    downloadsCount: 165000,
    faq: [
      { question: 'Does this download include English subtitles?', answer: 'Yes, both the 1080p and 720p packages include styled ASS/SRT soft subtitles and multiple audio tracks.' }
    ]
  },
  {
    id: 'solitude-martian-odyssey',
    title: 'Red Frontier: Martian Odyssey',
    slug: 'red-frontier-martian-odyssey',
    type: 'movie',
    posterUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80',
    overview: 'After a coronal mass ejection severs communications between Earth and the first permanent colony on Mars, an engineer undertakes a perilous 3,000 km trek across the red planet.',
    editorialReview: 'Grounded in authentic orbital physics and terraforming science, Red Frontier delivers a gripping survival tale reminiscent of The Martian and Interstellar. Visually stunning panoramas and a stirring symphonic score make it a cinematic triumph.',
    releaseYear: 2024,
    releaseDate: '2024-10-05',
    rating: 8.7,
    voteCount: 42000,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    duration: '2h 21m',
    ageRating: 'PG-13',
    director: 'Claire Henderson',
    cast: [
      { name: 'David Mercer', character: 'Dr. Lucas Shaw', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Maya Lin', character: 'Mission Specialist Lin', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'Canada / USA',
    quality: '4K UHD',
    audio: ['English Atmos 7.1', 'French 5.1'],
    subtitles: ['English', 'Spanish', 'French', 'Italian'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'Global', badge: '4K HDR', quality: '4K UHD', videoUrl: SAMPLE_VIDEOS.forBiggerBlazes },
      { id: 'srv-2', name: 'Server 2 (HydraStream)', region: 'North America', badge: 'Ultra HD', quality: '1080p', videoUrl: SAMPLE_VIDEOS.forBiggerBlazes }
    ],
    videoUrl: SAMPLE_VIDEOS.forBiggerBlazes,
    downloadOptions: [
      { id: 'red-4k', quality: '4K UHD', resolution: '3840x2160', format: 'MKV', size: '5.4 GB', codec: 'HEVC HDR10', audio: 'TrueHD Atmos', directUrl: SAMPLE_VIDEOS.forBiggerBlazes, seeders: 1800, leechers: 70 },
      { id: 'red-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MP4', size: '2.1 GB', codec: 'x264', audio: 'AAC 5.1', directUrl: SAMPLE_VIDEOS.forBiggerBlazes, seeders: 3200, leechers: 140 }
    ],
    isTrending: false,
    isFeatured: false,
    isLatest: true,
    views: 198000,
    downloadsCount: 52000,
    faq: [
      { question: 'Is Red Frontier available in 4K HDR?', answer: 'Yes, PunkShop provides high-bitrate HDR10 download and streaming options with Dolby Atmos sound.' }
    ]
  },
  {
    id: 'kingdom-of-cinders',
    title: 'Kingdom of Cinders',
    slug: 'kingdom-of-cinders',
    type: 'tv',
    posterUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    overview: 'As dragons awaken from volcanic hibernation, rival feudal houses must choose between perpetual civil war and uniting before their kingdoms turn to ash.',
    editorialReview: 'With dark political intrigue, Shakespearean dialogue, and breathtaking dragon aerial battles, Kingdom of Cinders fills the high fantasy television void with supreme craftsmanship.',
    releaseYear: 2025,
    releaseDate: '2025-04-12',
    rating: 9.0,
    voteCount: 88400,
    genres: ['Fantasy', 'Action', 'Drama', 'Adventure'],
    duration: '3 Seasons',
    ageRating: 'TV-MA',
    director: 'Julian Blackwood',
    cast: [
      { name: 'Lord Corvus', character: 'House of Cinders Regent', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Princess Lyanna', character: 'Dragon Rider', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'United Kingdom / Ireland',
    quality: '4K UHD',
    audio: ['English Atmos', 'German 5.1', 'Spanish 5.1'],
    subtitles: ['English', 'Spanish', 'German', 'Dutch', 'Portuguese'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'EU/US', badge: 'Ultra HD', quality: '4K UHD', videoUrl: SAMPLE_VIDEOS.weAreGoingOnBullrun }
    ],
    videoUrl: SAMPLE_VIDEOS.weAreGoingOnBullrun,
    downloadOptions: [
      { id: 'koc-s3-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'ZIP / MKV', size: '14.2 GB', codec: 'x265', audio: 'E-AC-3 5.1', directUrl: SAMPLE_VIDEOS.weAreGoingOnBullrun, seeders: 6200, leechers: 450 }
    ],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: The Ash Embers',
        episodeCount: 3,
        episodes: [
          {
            id: 'koc-s01e01',
            episodeNumber: 1,
            seasonNumber: 1,
            title: 'Flames in the North',
            duration: '61m',
            overview: 'The slumbering volcano Mount Drakon rumbles for the first time in four centuries.',
            stillUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.weAreGoingOnBullrun,
            downloadOptions: [
              { id: 'koc-ep1-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.4 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.weAreGoingOnBullrun }
            ]
          },
          {
            id: 'koc-s01e02',
            episodeNumber: 2,
            seasonNumber: 1,
            title: 'The Obsidian Treaty',
            duration: '58m',
            overview: 'Envoys from the Sun Court arrive to negotiate an alliance sealed with royal blood.',
            stillUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.tearsOfSteel,
            downloadOptions: [
              { id: 'koc-ep2-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.3 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.tearsOfSteel }
            ]
          },
          {
            id: 'koc-s01e03',
            episodeNumber: 3,
            seasonNumber: 1,
            title: 'Winged Calamity',
            duration: '66m',
            overview: 'A gargantuan elder dragon assaults the western garrison fortress.',
            stillUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
            videoUrl: SAMPLE_VIDEOS.sintel,
            downloadOptions: [
              { id: 'koc-ep3-1080', quality: '1080p FHD', resolution: '1080p', format: 'MP4', size: '1.5 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.sintel }
            ]
          }
        ]
      }
    ],
    isTrending: true,
    isFeatured: false,
    isLatest: false,
    views: 610000,
    downloadsCount: 198000,
    faq: [
      { question: 'Are all seasons available for download as batch files?', answer: 'Yes, batch torrent and direct ZIP downloads are provided with English and multilingual subtitle packs.' }
    ]
  },
  {
    id: 'velocity-overdrive',
    title: 'Velocity: Overdrive',
    slug: 'velocity-overdrive',
    type: 'movie',
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    overview: 'An underground street racer turned precision getaway driver is coerced into an impossible heist through the mountain switchbacks of the Alps.',
    editorialReview: 'An adrenaline rush from the opening gear shift to the climax. Grounded stunt choreography and authentic vehicular sound design make Velocity: Overdrive an absolute treat for gearheads and thrill seekers alike.',
    releaseYear: 2024,
    releaseDate: '2024-07-22',
    rating: 7.9,
    voteCount: 29500,
    genres: ['Action', 'Thriller', 'Crime'],
    duration: '1h 49m',
    ageRating: 'PG-13',
    director: 'Marco Rossi',
    cast: [
      { name: 'Leon Hayes', character: 'Dom Vance', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Giselle Moreau', character: 'The Mechanic', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'France / Italy',
    quality: '1080p FHD',
    audio: ['English 5.1', 'French 5.1'],
    subtitles: ['English', 'Spanish', 'French'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'Europe', badge: 'High Speed', quality: '1080p FHD', videoUrl: SAMPLE_VIDEOS.subaruOutback }
    ],
    videoUrl: SAMPLE_VIDEOS.subaruOutback,
    downloadOptions: [
      { id: 'vel-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MP4', size: '1.7 GB', codec: 'x264', audio: 'AAC 5.1', directUrl: SAMPLE_VIDEOS.subaruOutback, seeders: 2200, leechers: 90 },
      { id: 'vel-720', quality: '720p HD', resolution: '1280x720', format: 'MP4', size: '820 MB', codec: 'x264', audio: 'Stereo', directUrl: SAMPLE_VIDEOS.subaruOutback, seeders: 1300, leechers: 40 }
    ],
    isTrending: false,
    isFeatured: false,
    isLatest: true,
    views: 184000,
    downloadsCount: 47000,
    faq: [
      { question: 'What is the format of the direct download?', answer: 'PunkShop provides standard MP4 format playable on any smart TV, PC, tablet, or smartphone without converting.' }
    ]
  },
  {
    id: 'haunting-of-blackwood-manor',
    title: 'The Haunting of Blackwood',
    slug: 'the-haunting-of-blackwood',
    type: 'movie',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    overview: 'A grieving architect accepts an assignment to restore a secluded Victorian estate, only to discover that the building’s floor plan mirrors an occult summoning seal.',
    editorialReview: 'Rich in Gothic atmosphere, slow-burn psychological dread, and exquisite sound design. The Haunting of Blackwood shuns cheap jump scares in favor of genuine spine-chilling atmospheric terror.',
    releaseYear: 2024,
    releaseDate: '2024-10-25',
    rating: 8.1,
    voteCount: 38700,
    genres: ['Horror', 'Mystery', 'Thriller'],
    duration: '1h 58m',
    ageRating: 'R',
    director: 'Guillermo De Sola',
    cast: [
      { name: 'Sarah Sterling', character: 'Architect Allison Cole', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
      { name: 'Arthur Pendelton', character: 'The Caretaker', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }
    ],
    country: 'United States',
    quality: '1080p FHD',
    audio: ['English 5.1 Dolby', 'Spanish 5.1'],
    subtitles: ['English', 'Spanish', 'French'],
    servers: [
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'US', badge: 'Crisp Audio', quality: '1080p', videoUrl: SAMPLE_VIDEOS.elephantsDream }
    ],
    videoUrl: SAMPLE_VIDEOS.elephantsDream,
    downloadOptions: [
      { id: 'blk-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MP4', size: '1.85 GB', codec: 'x264', audio: '5.1 AAC', directUrl: SAMPLE_VIDEOS.elephantsDream, seeders: 1950, leechers: 80 }
    ],
    isTrending: false,
    isFeatured: false,
    isLatest: false,
    views: 210000,
    downloadsCount: 59000,
    faq: [
      { question: 'Is this movie suitable for minors?', answer: 'The movie is rated R for pervasive atmospheric dread, psychological themes, and brief horror violence.' }
    ]
  }
];

export const GENRES_LIST = [
  'All Genres',
  'Action',
  'Sci-Fi',
  'Drama',
  'Thriller',
  'Mystery',
  'Fantasy',
  'Horror',
  'Anime',
  'Adventure',
  'Crime'
];

export const YEARS_LIST = ['All Years', '2026', '2025', '2024', '2023', '2022', 'Older'];
export const QUALITY_LIST = ['All Qualities', '4K UHD', '1080p FHD', '720p HD'];
export const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending Now' },
  { value: 'rating', label: 'Highest Rated (IMDb)' },
  { value: 'latest', label: 'Latest Releases' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'views', label: 'Most Viewed' }
];

export const INITIAL_REVIEWS: Record<string, import('../types').UserReview[]> = {
  'cyber-chronicles-2099': [
    {
      id: 'rev-1',
      mediaId: 'cyber-chronicles-2099',
      author: 'Cinemaphile_99',
      rating: 9,
      date: '2 days ago',
      content: 'The 4K stream and download was blazing fast on Server 1! The soundtrack is unreal, especially during the neon motorcycle pursuit.',
      likes: 42
    },
    {
      id: 'rev-2',
      mediaId: 'cyber-chronicles-2099',
      author: 'CyberpunkNerd',
      rating: 8.5,
      date: '1 week ago',
      content: 'Downloaded the 1080p MP4 file in under 2 minutes. English subs were perfectly synced. One of the best sci-fi movies of 2025.',
      likes: 27
    }
  ],
  'chronicles-of-the-abyss': [
    {
      id: 'rev-3',
      mediaId: 'chronicles-of-the-abyss',
      author: 'AbyssExplorer',
      rating: 10,
      date: '3 days ago',
      content: 'Episode 4 left me completely speechless. Super clean UI, zero intrusive popups, and the episode switch works flawlessly!',
      likes: 64
    }
  ]
};
