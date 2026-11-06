import { FeaturedMovie } from '../components/tv/TvHeroBillboard';

export interface LocalMediaFileItem {
  id: string;
  filename: string;
  title: string;
  path: string;
  resolution: string;
  fps: string;
  codec: string;
  container: string;
  audioTrack: string;
  fileSize: string;
  bitrate: string;
  duration: string;
  releaseYear: string;
  posterUrl: string;
  bannerUrl?: string;
  genres: string[];
  rating: number;
  certification: string;
  director: string;
  summary: string;
  streamUrl: string;
}

export interface SharedPeerLibrary {
  id: string;
  name: string;
  owner: string;
  ownerHandle: string;
  avatarInitials: string;
  avatarColor: string;
  itemCount: number;
  status: 'online' | 'streaming' | 'offline';
  pingMs: number;
  bandwidth: string;
  connectionType: string;
  storageShared: string;
  location: string;
  description: string;
  media: FeaturedMovie[];
}

// ----------------------------------------------------
// DISNEY+ TOP 20 MOVIES
// ----------------------------------------------------
export const DISNEY_PLUS_TOP_20: FeaturedMovie[] = [
  {
    id: "inside-out-2",
    title: "Inside Out 2",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    genres: ["Animation", "Family", "Comedy", "Adventure"],
    rating: 7.6,
    certification: "PG",
    director: "Kelsey Mann",
    summary: "Teenager Riley's mind headquarters undergoes a sudden demolition to make room for new unexpected Emotions: Anxiety, Envy, Ennui, and Embarrassment."
  },
  {
    id: "deadpool-wolverine-disney",
    title: "Deadpool & Wolverine",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    genres: ["Action", "Comedy", "Sci-Fi"],
    rating: 7.8,
    certification: "R",
    director: "Shawn Levy",
    summary: "Deadpool is recruited by the Time Variance Authority and drags an indifferent Wolverine on a universe-saving mission."
  },
  {
    id: "kingdom-planet-apes",
    title: "Kingdom of the Planet of the Apes",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    rating: 7.1,
    certification: "PG-13",
    director: "Wes Ball",
    summary: "Several generations after Caesar's reign, a young ape embarks on a journey that will lead him to question everything he's been taught."
  },
  {
    id: "guardians-vol-3",
    title: "Guardians of the Galaxy Vol. 3",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN2Ydgii51xQ.jpg",
    genres: ["Action", "Sci-Fi", "Adventure"],
    rating: 7.9,
    certification: "PG-13",
    director: "James Gunn",
    summary: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and protect one of their own."
  },
  {
    id: "moana-2",
    title: "Moana 2",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg",
    genres: ["Animation", "Adventure", "Family", "Musical"],
    rating: 7.0,
    certification: "PG",
    director: "David G. Derrick Jr.",
    summary: "Moana receives an unexpected call from her wayfinding ancestors and voyages to the far seas of Oceania on a dangerous journey."
  },
  {
    id: "avengers-endgame",
    title: "Avengers: Endgame",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.4,
    certification: "PG-13",
    director: "Anthony & Joe Russo",
    summary: "After the devastating events of Infinity War, the surviving Avengers assemble once more to reverse Thanos's actions and restore balance."
  },
  {
    id: "coco",
    title: "Coco",
    releaseYear: "2017",
    posterUrl: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
    genres: ["Animation", "Family", "Music", "Fantasy"],
    rating: 8.4,
    certification: "PG",
    director: "Lee Unkrich",
    summary: "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather."
  },
  {
    id: "soul",
    title: "Soul",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIiv9W07Mi4xWwfhP.jpg",
    genres: ["Animation", "Comedy", "Drama", "Music"],
    rating: 8.0,
    certification: "PG",
    director: "Pete Docter",
    summary: "After landing the gig of a lifetime, a New York jazz pianist suddenly finds himself trapped in a strange land between Earth and the afterlife."
  },
  {
    id: "elemental",
    title: "Elemental",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8riWGlHIR43UQ9qwRIYFdpMrEbi.jpg",
    genres: ["Animation", "Comedy", "Family", "Fantasy"],
    rating: 7.0,
    certification: "PG",
    director: "Peter Sohn",
    summary: "In a city where fire, water, land, and air residents live together, a fiery young woman and a go-with-the-flow guy discover how much they share."
  },
  {
    id: "encanto",
    title: "Encanto",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3As8Pzn246L37bG.jpg",
    genres: ["Animation", "Comedy", "Family", "Fantasy"],
    rating: 7.2,
    certification: "PG",
    director: "Jared Bush, Byron Howard",
    summary: "A Colombian teenage girl has to face the frustration of being the only member of her family without magical powers."
  },
  {
    id: "black-panther-wakanda",
    title: "Black Panther: Wakanda Forever",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 6.7,
    certification: "PG-13",
    director: "Ryan Coogler",
    summary: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa."
  },
  {
    id: "avatar-way-water",
    title: "Avatar: The Way of Water",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    rating: 7.6,
    certification: "PG-13",
    director: "James Cameron",
    summary: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, he must fight to protect them."
  },
  {
    id: "lion-king-classic",
    title: "The Lion King",
    releaseYear: "1994",
    posterUrl: "https://image.tmdb.org/t/p/w500/sKCr78jnOigvURM29wpu7uV5a4N.jpg",
    genres: ["Animation", "Drama", "Family"],
    rating: 8.5,
    certification: "G",
    director: "Roger Allers, Rob Minkoff",
    summary: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself."
  },
  {
    id: "rogue-one-starwars",
    title: "Rogue One: A Star Wars Story",
    releaseYear: "2016",
    posterUrl: "https://image.tmdb.org/t/p/w500/i0yw1mFbB79thipHRDXYAhKV2zf.jpg",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 7.8,
    certification: "PG-13",
    director: "Gareth Edwards",
    summary: "In a time of conflict, a group of unlikely heroes band together on a mission to steal the plans to the Death Star, the Empire's weapon."
  },
  {
    id: "turning-red",
    title: "Turning Red",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg",
    genres: ["Animation", "Comedy", "Family", "Fantasy"],
    rating: 7.0,
    certification: "PG",
    director: "Domee Shi",
    summary: "A thirteen-year-old girl turns into a giant red panda whenever she gets too excited or stressed."
  },
  {
    id: "ratatouille",
    title: "Ratatouille",
    releaseYear: "2007",
    posterUrl: "https://image.tmdb.org/t/p/w500/t3vaWRPSf6WjDSamIkK9B9uk5DE.jpg",
    genres: ["Animation", "Comedy", "Family"],
    rating: 8.1,
    certification: "G",
    director: "Brad Bird",
    summary: "A rat who can cook makes an unusual alliance with a young kitchen worker at a famous Paris restaurant."
  },
  {
    id: "up-pixar",
    title: "Up",
    releaseYear: "2009",
    posterUrl: "https://image.tmdb.org/t/p/w500/vpbaStTMt8qqGBE2587ies120bP.jpg",
    genres: ["Animation", "Adventure", "Comedy", "Family"],
    rating: 8.3,
    certification: "PG",
    director: "Pete Docter",
    summary: "78-year-old Carl Fredricksen travels to Paradise Falls in his home equipped with balloons, inadvertently taking a young stowaway."
  },
  {
    id: "wall-e",
    title: "WALL·E",
    releaseYear: "2008",
    posterUrl: "https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQMiQRS.jpg",
    genres: ["Animation", "Adventure", "Family", "Sci-Fi"],
    rating: 8.4,
    certification: "G",
    director: "Andrew Stanton",
    summary: "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind."
  },
  {
    id: "aladdin-classic",
    title: "Aladdin",
    releaseYear: "1992",
    posterUrl: "https://image.tmdb.org/t/p/w500/oakLq6q4753gVzF5N832q360K3.jpg",
    genres: ["Animation", "Adventure", "Comedy", "Family", "Fantasy"],
    rating: 8.0,
    certification: "G",
    director: "Ron Clements, John Musker",
    summary: "A kindhearted street urchin and a power-hungry Grand Vizier vie for a magic lamp that has the power to make wishes come true."
  },
  {
    id: "empire-strikes-back",
    title: "Star Wars: The Empire Strikes Back",
    releaseYear: "1980",
    posterUrl: "https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgIOizVhkKKnwiVD.jpg",
    genres: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    rating: 8.7,
    certification: "PG",
    director: "Irvin Kershner",
    summary: "After the Rebels are brutally overpowered by the Empire, Luke Skywalker begins Jedi training with Yoda, while his friends are pursued by Darth Vader."
  }
];

// ----------------------------------------------------
// DISNEY+ TOP 20 TV SHOWS
// ----------------------------------------------------
export const DISNEY_PLUS_TOP_20_SHOWS: FeaturedMovie[] = [
  {
    id: "the-mandalorian",
    title: "The Mandalorian",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/eU1iPfJxT1vVI7cvg2TTeTM8Y9P.jpg",
    genres: ["Sci-Fi", "Action", "Adventure"],
    rating: 8.7,
    certification: "TV-14",
    director: "Jon Favreau",
    summary: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic."
  },
  {
    id: "loki",
    title: "Loki",
    releaseYear: "2023",
    posterUrl: "/assets/loki-poster.jpg",
    genres: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    rating: 8.2,
    certification: "TV-14",
    director: "Michael Waldron",
    summary: "The mercurial villain Loki resumes his role as the God of Mischief following the events of Avengers: Endgame."
  },
  {
    id: "andor",
    title: "Andor",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/59SVNwL1a7G1IRoDuqdW4x80oMm.jpg",
    genres: ["Sci-Fi", "Action", "Drama", "Thriller"],
    rating: 8.4,
    certification: "TV-14",
    director: "Tony Gilroy",
    summary: "Prequel series to Star Wars' 'Rogue One'. In an era filled with danger, deception and intrigue, Cassian will embark on the path of rebellion."
  },
  {
    id: "percy-jackson",
    title: "Percy Jackson and the Olympians",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/tnx7iRvg13f9N40qj6kP8rN9G.jpg",
    genres: ["Action", "Adventure", "Family", "Fantasy"],
    rating: 7.2,
    certification: "TV-PG",
    director: "Rick Riordan",
    summary: "Demigod Percy Jackson leads a quest across America to prevent a war among the Olympian gods."
  },
  {
    id: "x-men-97",
    title: "X-Men '97",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/9ZyAUZScnh9i1N9jP1r7z3z9G8z.jpg",
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    rating: 8.9,
    certification: "TV-14",
    director: "Beau DeMayo",
    summary: "A band of mutants use their uncanny gifts to protect a world that hates and fears them in this direct continuation of the iconic 1990s series."
  },
  {
    id: "ahsoka",
    title: "Ahsoka",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/laCJxobHoPVaLQTKxc14Y2zV64C.jpg",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    rating: 7.5,
    certification: "TV-14",
    director: "Dave Filoni",
    summary: "After the fall of the Galactic Empire, former Jedi Knight Ahsoka Tano investigates an emerging threat to a vulnerable galaxy."
  },
  {
    id: "bluey",
    title: "Bluey",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/18Z5E1o3vH9Y0o4rC9g8j9m1P0.jpg",
    genres: ["Animation", "Comedy", "Family"],
    rating: 9.4,
    certification: "TV-Y",
    director: "Joe Brumm",
    summary: "The slice-of-life adventures of an energetic Australian Blue Heeler cattle dog puppy who lives with her father, mother, and little sister."
  },
  {
    id: "wandavision",
    title: "WandaVision",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/glKDVu0ArrW04YG5q0IRIP4logq.jpg",
    genres: ["Comedy", "Drama", "Fantasy", "Sci-Fi"],
    rating: 7.9,
    certification: "TV-14",
    director: "Matt Shakman",
    summary: "Living idealized suburban lives, super-powered beings Wanda and Vision begin to suspect that everything is not as it seems."
  },
  {
    id: "daredevil-born-again",
    title: "Daredevil: Born Again",
    releaseYear: "2025",
    posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Crime", "Drama"],
    rating: 8.6,
    certification: "TV-MA",
    director: "Dario Scardapane",
    summary: "Blind lawyer Matt Murdock fights for justice in the courtroom while donning his vigilante alter ego on the dark streets of Hell's Kitchen."
  },
  {
    id: "gravity-falls",
    title: "Gravity Falls",
    releaseYear: "2016",
    posterUrl: "https://image.tmdb.org/t/p/w500/m1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Animation", "Adventure", "Comedy", "Mystery"],
    rating: 8.9,
    certification: "TV-Y7",
    director: "Alex Hirsch",
    summary: "Twin siblings Dipper and Mabel Pines spend the summer at their great-uncle's tourist trap in the enigmatic town of Gravity Falls, Oregon."
  },
  {
    id: "clone-wars",
    title: "Star Wars: The Clone Wars",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/e1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    rating: 8.4,
    certification: "TV-PG",
    director: "Dave Filoni",
    summary: "Jedi Knights lead the Grand Army of the Republic against the droid armies of the Separatists across the star systems."
  },
  {
    id: "the-acolyte",
    title: "The Acolyte",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/f1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    rating: 7.0,
    certification: "TV-14",
    director: "Leslye Headland",
    summary: "An investigation into a shocking crime spree pits a respected Jedi Master against a dangerous warrior from his past during the High Republic."
  },
  {
    id: "moon-knight",
    title: "Moon Knight",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/x1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
    rating: 7.3,
    certification: "TV-14",
    director: "Mohamed Diab",
    summary: "Steven Grant discovers he's been granted the powers of an Egyptian moon god, but quickly finds out that these newfound powers can be a curse."
  },
  {
    id: "bad-batch",
    title: "Star Wars: The Bad Batch",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    rating: 7.8,
    certification: "TV-PG",
    director: "Jennifer Corbett",
    summary: "The 'Bad Batch' of elite and experimental clones make their way through an immediately changing galaxy in the aftermath of the Clone Wars."
  },
  {
    id: "hawkeye",
    title: "Hawkeye",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Adventure", "Comedy", "Crime"],
    rating: 7.5,
    certification: "TV-14",
    director: "Jonathan Igla",
    summary: "Series based on the Marvel Comics superhero Hawkeye, centering on the adventures of Young Avenger Kate Bishop."
  },
  {
    id: "secret-invasion",
    title: "Secret Invasion",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    rating: 6.0,
    certification: "TV-14",
    director: "Kyle Bradstreet",
    summary: "Nick Fury and Talos discover a faction of shapeshifting Skrulls who have been infiltrating Earth for years."
  },
  {
    id: "what-if",
    title: "What If...?",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    rating: 7.4,
    certification: "TV-14",
    director: "A.C. Bradley",
    summary: "Exploring pivotal moments from the Marvel Cinematic Universe and turning them on their head, leading the audience into uncharted territory."
  },
  {
    id: "the-simpsons",
    title: "The Simpsons",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Animation", "Comedy"],
    rating: 8.7,
    certification: "TV-PG",
    director: "Matt Groening",
    summary: "The satiric adventures of a working-class family in the misfit city of Springfield."
  },
  {
    id: "ms-marvel",
    title: "Ms. Marvel",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/pB0w0uH9Y0o4rC9g8j9m1P0w0p.jpg",
    genres: ["Action", "Adventure", "Comedy"],
    rating: 6.3,
    certification: "TV-14",
    director: "Bisha K. Ali",
    summary: "Kamala, a superhero fan with an imagination, particularly when it comes to Captain Marvel, discovers she possesses super powers of her own."
  },
  {
    id: "national-treasure-series",
    title: "National Treasure: Edge of History",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/a2E0aX8rN9Gk6rG7z7Ck0Q2Pj6.jpg",
    genres: ["Action", "Adventure", "Mystery"],
    rating: 6.0,
    certification: "TV-14",
    director: "Cormac & Marianne Wibberley",
    summary: "Jess Valenzuela, a 20-year-old Dreamer, sets off on an exploration to discover the mystery of her family history and save a lost Pan-American treasure."
  }
];

// ----------------------------------------------------
// AMAZON PRIME TOP 20 MOVIES
// ----------------------------------------------------
export const AMAZON_PRIME_TOP_20: FeaturedMovie[] = [
  {
    id: "road-house",
    title: "Road House",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/bXi6IQTomnvHD906ioPLvlW7QvV.jpg",
    genres: ["Action", "Thriller"],
    rating: 6.2,
    certification: "R",
    director: "Doug Liman",
    summary: "Ex-UFC middleweight fighter Dalton takes a job at a rowdy Florida Keys roadhouse, only to discover this paradise is not all it seems."
  },
  {
    id: "air",
    title: "Air",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/76AKQaeT3wh998V7oxGHxIE9umC.jpg",
    genres: ["Drama", "Sport"],
    rating: 7.4,
    certification: "R",
    director: "Ben Affleck",
    summary: "Follows the history of sports marketing executive Sonny Vaccaro, and how he led Nike in its pursuit of the greatest athlete in basketball history: Michael Jordan."
  },
  {
    id: "saltburn",
    title: "Saltburn",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP928KiUI9eRJ.jpg",
    genres: ["Drama", "Comedy", "Thriller"],
    rating: 7.0,
    certification: "R",
    director: "Emerald Fennell",
    summary: "A student at Oxford University finds himself drawn into the world of a charming and aristocratic classmate, who invites him to his eccentric family's estate."
  },
  {
    id: "the-idea-of-you",
    title: "The Idea of You",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    genres: ["Romance", "Comedy", "Drama"],
    rating: 6.4,
    certification: "R",
    director: "Michael Showalter",
    summary: "Solène, a 40-year-old single mother, begins an unexpected romance with 24-year-old Hayes Campbell, the lead singer of August Moon, the hottest boy band on the planet."
  },
  {
    id: "american-fiction",
    title: "American Fiction",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/6Cz0Zz1Q1dF5t0kHVR79ujTVnpI.jpg",
    genres: ["Comedy", "Drama"],
    rating: 7.5,
    certification: "R",
    director: "Cord Jefferson",
    summary: "A novelist fed up with the establishment profiting from Black entertainment writes an outlandish book under a pen name that unexpectedly propels him into the heart of hypocrisy."
  },
  {
    id: "the-beekeeper",
    title: "The Beekeeper",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/A7EByudX0eOzlkQ2FIbogzyazm2.jpg",
    genres: ["Action", "Thriller"],
    rating: 6.4,
    certification: "R",
    director: "David Ayer",
    summary: "One man's brutal campaign for vengeance takes on national stakes after he is revealed to be a former operative of a powerful clandestine organization known as Beekeepers."
  },
  {
    id: "creed-3",
    title: "Creed III",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/cvsVhAZygY0o4rC9g8j9m1P0w0p.jpg",
    genres: ["Drama", "Sport"],
    rating: 6.8,
    certification: "PG-13",
    director: "Michael B. Jordan",
    summary: "Adonis has been thriving in both his career and family life, but when a childhood friend and former boxing prodigy resurfaces, the face-off is more than just a fight."
  },
  {
    id: "sound-of-metal",
    title: "Sound of Metal",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/y6T2gq8j9m1P0w0pa2E0aX8rN9G.jpg",
    genres: ["Drama", "Music"],
    rating: 7.7,
    certification: "R",
    director: "Darius Marder",
    summary: "A heavy-metal drummer's life is thrown into freefall when he begins to lose his hearing."
  },
  {
    id: "manchester-by-sea",
    title: "Manchester by the Sea",
    releaseYear: "2016",
    posterUrl: "https://image.tmdb.org/t/p/w500/x1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama"],
    rating: 7.8,
    certification: "R",
    director: "Kenneth Lonergan",
    summary: "A depressed uncle is asked to take care of his teenage nephew after the boy's father dies."
  },
  {
    id: "the-covenant",
    title: "Guy Ritchie's The Covenant",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/a2E0aX8rN9Gk6rG7z7Ck0Q2Pj7.jpg",
    genres: ["Action", "Thriller", "War"],
    rating: 7.5,
    certification: "R",
    director: "Guy Ritchie",
    summary: "During the war in Afghanistan, a local interpreter risks his own life to carry an injured sergeant across miles of grueling terrain."
  },
  {
    id: "thirteen-lives",
    title: "Thirteen Lives",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Adventure", "Biography", "Drama"],
    rating: 7.7,
    certification: "PG-13",
    director: "Ron Howard",
    summary: "A rescue mission is assembled in Thailand where a group of young boys and their soccer coach are trapped in a system of underground caves."
  },
  {
    id: "dungeons-dragons",
    title: "Dungeons & Dragons: Honor Among Thieves",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/A7EByudX0eOzlkQ2FIbogzyazm3.jpg",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    rating: 7.3,
    certification: "PG-13",
    director: "Jonathan Goldstein, John Francis Daley",
    summary: "A charming thief and a band of unlikely adventurers embark on an epic heist to retrieve a lost relic, but things go dangerously awry."
  },
  {
    id: "john-wick-4",
    title: "John Wick: Chapter 4",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEslhZiVpvBuio.jpg",
    genres: ["Action", "Crime", "Thriller"],
    rating: 7.7,
    certification: "R",
    director: "Chad Stahelski",
    summary: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy."
  },
  {
    id: "interstellar-prime",
    title: "Interstellar",
    releaseYear: "2014",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    rating: 8.7,
    certification: "PG-13",
    director: "Christopher Nolan",
    summary: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers."
  },
  {
    id: "the-tomorrow-war",
    title: "The Tomorrow War",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/x1N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 6.6,
    certification: "PG-13",
    director: "Chris McKay",
    summary: "A family man is drafted to fight in a future war where the fate of humanity relies on his ability to confront the past."
  },
  {
    id: "borat-2",
    title: "Borat Subsequent Moviefilm",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/pB0w0uH9Y0o4rC9g8j9m1P0w0q.jpg",
    genres: ["Comedy"],
    rating: 6.6,
    certification: "R",
    director: "Jason Woliner",
    summary: "Follow-up film to the 2006 parody documentary film 'Borat' centered on Kazakh journalist Borat Sagdiyev."
  },
  {
    id: "knives-out-prime",
    title: "Knives Out",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
    genres: ["Comedy", "Crime", "Drama", "Mystery"],
    rating: 7.9,
    certification: "PG-13",
    director: "Rian Johnson",
    summary: "A detective investigates the death of a patriarch of an eccentric, combative family."
  },
  {
    id: "gladiator-prime",
    title: "Gladiator",
    releaseYear: "2000",
    posterUrl: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    genres: ["Action", "Adventure", "Drama"],
    rating: 8.5,
    certification: "R",
    director: "Ridley Scott",
    summary: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery."
  },
  {
    id: "top-gun-maverick-prime",
    title: "Top Gun: Maverick",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    genres: ["Action", "Drama"],
    rating: 8.3,
    certification: "PG-13",
    director: "Joseph Kosinski",
    summary: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates."
  },
  {
    id: "sicario-prime",
    title: "Sicario",
    releaseYear: "2015",
    posterUrl: "https://image.tmdb.org/t/p/w500/v0Q0w0uH9Y0o4rC9g8j9m1P0w0q.jpg",
    genres: ["Action", "Crime", "Drama", "Mystery", "Thriller"],
    rating: 7.7,
    certification: "R",
    director: "Denis Villeneuve",
    summary: "An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs at the border area between the U.S. and Mexico."
  }
];

// ----------------------------------------------------
// AMAZON PRIME TOP 20 TV SHOWS
// ----------------------------------------------------
export const AMAZON_PRIME_TOP_20_SHOWS: FeaturedMovie[] = [
  {
    id: "the-boys",
    title: "The Boys",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/2ZmG2n24f0c43jN8a2E0aX8rN9G.jpg",
    genres: ["Action", "Comedy", "Drama", "Sci-Fi"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Eric Kripke",
    summary: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers."
  },
  {
    id: "fallout",
    title: "Fallout",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/ansAghbNfgw9B8A7EByudX0eOz.jpg",
    genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
    rating: 8.4,
    certification: "TV-MA",
    director: "Jonathan Nolan",
    summary: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves."
  },
  {
    id: "reacher",
    title: "Reacher",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/j1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Action", "Crime", "Drama", "Thriller"],
    rating: 8.1,
    certification: "TV-MA",
    director: "Nick Santora",
    summary: "Jack Reacher, a veteran military police investigator, has just entered civilian life when he is falsely accused of murder."
  },
  {
    id: "rings-of-power",
    title: "The Lord of the Rings: The Rings of Power",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/m2E0aX8rN9Gk6rG7z7Ck0Q2Pj6.jpg",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    rating: 7.0,
    certification: "TV-14",
    director: "J.D. Payne, Patrick McKay",
    summary: "Epic drama set thousands of years before the events of J.R.R. Tolkien's 'The Hobbit' and 'The Lord of the Rings' follows an ensemble cast of characters."
  },
  {
    id: "invincible",
    title: "Invincible",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/yDWJYRAKS52895690pB0w0uH9Y0.jpg",
    genres: ["Animation", "Action", "Adventure", "Drama"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Robert Kirkman",
    summary: "An adult animated series based on the Skybound/Image comic about a teenager whose father is the most powerful superhero on the planet."
  },
  {
    id: "fleabag",
    title: "Fleabag",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/i1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy", "Drama"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Phoebe Waller-Bridge",
    summary: "A dry-witted woman, known only as Fleabag, has no filter as she navigates life and love in London while trying to cope with tragedy."
  },
  {
    id: "gen-v",
    title: "Gen V",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/f1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Action", "Adventure", "Comedy", "Sci-Fi"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Michele Fazekas, Tara Butters",
    summary: "From the world of 'The Boys' comes 'Gen V', which explores the training of the first generation of superheroes at Godolkin University."
  },
  {
    id: "mrs-maisel",
    title: "The Marvelous Mrs. Maisel",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/g1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy", "Drama"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Amy Sherman-Palladino",
    summary: "After her husband leaves her, young 1950s New York mother Miriam 'Midge' Maisel discovers that she has a talent for stand-up comedy."
  },
  {
    id: "jack-ryan",
    title: "Tom Clancy's Jack Ryan",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/h1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Action", "Drama", "Thriller"],
    rating: 8.0,
    certification: "TV-MA",
    director: "Carlton Cuse, Graham Roland",
    summary: "Up-and-coming CIA analyst, Jack Ryan, is thrust into a dangerous field assignment as he uncovers a pattern in terrorist communication."
  },
  {
    id: "the-expanse",
    title: "The Expanse",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Drama", "Mystery", "Sci-Fi"],
    rating: 8.5,
    certification: "TV-14",
    director: "Mark Fergus, Hawk Ostby",
    summary: "In the 24th century, a disparate band of antiheroes unwittingly find themselves at the center of a plot that threatens the solar system."
  },
  {
    id: "good-omens",
    title: "Good Omens",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Comedy", "Fantasy"],
    rating: 8.0,
    certification: "TV-MA",
    director: "Neil Gaiman",
    summary: "A fastidious angel and a loose-living demon, who've become overly fond of life on Earth, are forced to form an unlikely alliance to stop Armageddon."
  },
  {
    id: "bosch",
    title: "Bosch",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/a1N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Crime", "Drama", "Mystery"],
    rating: 8.5,
    certification: "TV-MA",
    director: "Eric Overmyer",
    summary: "An L.A.P.D. homicide detective works to solve the murder of a 13-year-old boy while standing trial in federal court for the murder of a serial killer."
  },
  {
    id: "wheel-of-time",
    title: "The Wheel of Time",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    rating: 7.2,
    certification: "TV-14",
    director: "Rafe Judkins",
    summary: "Set in a high fantasy world where magic exists, but only some can access it, a woman named Moiraine crosses paths with five young villagers."
  },
  {
    id: "outer-range",
    title: "Outer Range",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/81N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Drama", "Mystery", "Sci-Fi", "Western"],
    rating: 7.1,
    certification: "TV-MA",
    director: "Brian Watkins",
    summary: "A rancher fighting for his land and family stumbles upon an unfathomable mystery at the edge of Wyoming's wilderness."
  },
  {
    id: "mr-mrs-smith",
    title: "Mr. & Mrs. Smith",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Action", "Comedy", "Crime", "Thriller"],
    rating: 7.0,
    certification: "TV-MA",
    director: "Francesca Sloane, Donald Glover",
    summary: "Two lonely strangers land a job of a lifetime with a mysterious spy agency that offers them espionage, wealth, and an arranged marriage."
  },
  {
    id: "clarksons-farm",
    title: "Clarkson's Farm",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/61N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Comedy", "Documentary"],
    rating: 9.0,
    certification: "TV-14",
    director: "Jeremy Clarkson",
    summary: "Follow Jeremy Clarkson as he attempts to run a 1,000-acre farm in the English countryside with no previous farming experience."
  },
  {
    id: "patriot",
    title: "Patriot",
    releaseYear: "2018",
    posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Comedy", "Drama", "Thriller"],
    rating: 8.2,
    certification: "TV-MA",
    director: "Steve Conrad",
    summary: "To prevent Iran from going nuclear, intelligence officer John Tavner must forgo all safety nets and assume a perilous 'non-official cover'."
  },
  {
    id: "tales-from-loop",
    title: "Tales from the Loop",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Drama", "Sci-Fi"],
    rating: 7.4,
    certification: "TV-MA",
    director: "Nathaniel Halpern",
    summary: "The townspeople who live above 'The Loop', a machine built to unlock and explore the mysteries of the universe, experience things previously consigned to fiction."
  },
  {
    id: "terminal-list",
    title: "The Terminal List",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/31N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Action", "Drama", "Thriller"],
    rating: 7.9,
    certification: "TV-MA",
    director: "David DiGilio",
    summary: "A former Navy SEAL officer investigates why his entire platoon was ambushed during a high-stakes covert mission."
  },
  {
    id: "cross",
    title: "Cross",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/21N9jP1r7z3z9G8z8k9B5jP1r9.jpg",
    genres: ["Action", "Crime", "Drama", "Thriller"],
    rating: 7.2,
    certification: "TV-MA",
    director: "Ben Watkins",
    summary: "Follows Alex Cross, a detective and forensic psychologist, uniquely capable of digging into the psyches of killers and their victims."
  }
];

// ----------------------------------------------------
// APPLE TV+ TOP 20 MOVIES
// ----------------------------------------------------
export const APPLE_TV_TOP_20: FeaturedMovie[] = [
  {
    id: "killers-flower-moon",
    title: "Killers of the Flower Moon",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
    genres: ["Crime", "Drama", "History"],
    rating: 7.6,
    certification: "R",
    director: "Martin Scorsese",
    summary: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one until the FBI steps in to unravel the mystery."
  },
  {
    id: "napoleon",
    title: "Napoleon",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/vcZWJGvBZhRBgODKcOS4dHap2uQ.jpg",
    genres: ["Action", "Biography", "Drama", "History"],
    rating: 6.4,
    certification: "R",
    director: "Ridley Scott",
    summary: "An epic that details the checkered rise and fall of French Emperor Napoleon Bonaparte and his relentless journey to power through the prism of his relationship with Josephine."
  },
  {
    id: "coda",
    title: "CODA",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/BzVjmm8sys9e3HCEtlzk9v8Wio.jpg",
    genres: ["Comedy", "Drama", "Music"],
    rating: 8.0,
    certification: "PG-13",
    director: "Siân Heder",
    summary: "As a CODA (Child of Deaf Adults), Ruby is the only hearing person in her deaf family. When the family's fishing business is threatened, Ruby finds herself torn between her passion for music and family loyalty."
  },
  {
    id: "wolfs",
    title: "Wolfs",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/vQ5494nUq8B3y5xG88m4k82w6.jpg",
    genres: ["Action", "Comedy", "Crime"],
    rating: 6.5,
    certification: "R",
    director: "Jon Watts",
    summary: "Two rival fixers cross paths when they're both called in to help cover up a prominent New York official's misstep."
  },
  {
    id: "fly-me-to-moon",
    title: "Fly Me to the Moon",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    genres: ["Comedy", "Romance"],
    rating: 6.6,
    certification: "PG-13",
    director: "Greg Berlanti",
    summary: "Marketing maven Kelly Jones wreaks havoc on launch director Cole Davis's already difficult task of executing the historic Apollo 11 moon landing."
  },
  {
    id: "the-instigators",
    title: "The Instigators",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/1Q3GlCXGYWELifxANYZ5OVMRVZl.jpg",
    genres: ["Action", "Comedy", "Crime"],
    rating: 6.2,
    certification: "R",
    director: "Doug Liman",
    summary: "Rory and Cobby are reluctant partners: a desperate father and an ex-con thrown together to rob a corrupt politician's ill-gotten earnings."
  },
  {
    id: "tetris",
    title: "Tetris",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Biography", "Drama", "History", "Thriller"],
    rating: 7.4,
    certification: "R",
    director: "Jon S. Baird",
    summary: "The story of how one of the world's most popular video games found its way to players around the globe during the Cold War."
  },
  {
    id: "greyhound",
    title: "Greyhound",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/a2E0aX8rN9Gk6rG7z7Ck0Q2Pj6.jpg",
    genres: ["Action", "Drama", "History", "War"],
    rating: 7.0,
    certification: "PG-13",
    director: "Aaron Schneider",
    summary: "Early in World War II, an inexperienced U.S. Navy captain must lead an Allied convoy being stalked by Nazi U-boat wolfpacks."
  },
  {
    id: "argylle",
    title: "Argylle",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Action", "Comedy", "Thriller"],
    rating: 5.7,
    certification: "PG-13",
    director: "Matthew Vaughn",
    summary: "A reclusive author who writes espionage novels about a secret agent named Argylle realizes the plot of her new book mirrors real-world events."
  },
  {
    id: "cha-cha-real-smooth",
    title: "Cha Cha Real Smooth",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/m1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Comedy", "Drama", "Romance"],
    rating: 7.3,
    certification: "R",
    director: "Cooper Raiff",
    summary: "A young man who works as a Bar Mitzvah party-starter strikes up a friendship with a mother and her autistic daughter."
  },
  {
    id: "tragedy-of-macbeth",
    title: "The Tragedy of Macbeth",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/x1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Drama", "History", "Thriller", "War"],
    rating: 7.1,
    certification: "R",
    director: "Joel Coen",
    summary: "A Scottish lord becomes convinced by a trio of witches that he will become the next King of Scotland, and his ambitious wife supports him in his effort to seize power."
  },
  {
    id: "causeway",
    title: "Causeway",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/pB0w0uH9Y0o4rC9g8j9m1P0w0p.jpg",
    genres: ["Drama"],
    rating: 6.6,
    certification: "R",
    director: "Lila Neugebauer",
    summary: "A US soldier suffers a traumatic brain injury while deployed in Afghanistan and struggles to adjust to life back home in New Orleans."
  },
  {
    id: "sharper-apple",
    title: "Sharper",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/ow3EzTlqMvHBUVe6gPgOQcHAtaG.jpg",
    genres: ["Drama", "Thriller"],
    rating: 6.6,
    certification: "R",
    director: "Benjamin Caron",
    summary: "A con artist takes on Manhattan's billionaires in a high-stakes game of greed, desire, and deception."
  },
  {
    id: "spirited",
    title: "Spirited",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Comedy", "Family", "Musical"],
    rating: 6.6,
    certification: "PG-13",
    director: "Sean Anders",
    summary: "A musical version of Charles Dickens' story of a miserly misanthrope who is taken on a magical journey by three ghosts."
  },
  {
    id: "palmer",
    title: "Palmer",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Drama"],
    rating: 7.2,
    certification: "R",
    director: "Fisher Stevens",
    summary: "An ex-convict strikes up a friendship with a boy from a troubled home."
  },
  {
    id: "swan-song",
    title: "Swan Song",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/f1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Drama", "Sci-Fi"],
    rating: 6.8,
    certification: "R",
    director: "Benjamin Cleary",
    summary: "When a loving husband and father is diagnosed with a terminal illness, he's presented with a controversial alternative solution to shield his family from grief."
  },
  {
    id: "finch",
    title: "Finch",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/e1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    rating: 6.9,
    certification: "PG-13",
    director: "Miguel Sapochnik",
    summary: "On a post-apocalyptic Earth, a robot, built to protect the life of his dying creator's beloved dog, learns about life, love, friendship."
  },
  {
    id: "the-banker",
    title: "The Banker",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/d1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Biography", "Drama"],
    rating: 7.3,
    certification: "PG-13",
    director: "George Nolfi",
    summary: "In the 1960s, two African-American entrepreneurs hire a working-class white man to pretend to be the head of their business empire."
  },
  {
    id: "still-michael-j-fox",
    title: "Still: A Michael J. Fox Movie",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Biography", "Documentary"],
    rating: 8.1,
    certification: "R",
    director: "Davis Guggenheim",
    summary: "Follows the life of beloved actor and advocate Michael J. Fox, exploring his personal and professional triumphs and travails."
  },
  {
    id: "boys-state",
    title: "Boys State",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Documentary"],
    rating: 7.6,
    certification: "PG-13",
    director: "Amanda McBaine, Jesse Moss",
    summary: "A political coming-of-age story that tracks the journey of 1,000 Texas high school boys who gather to build a representative government from the ground up."
  }
];

// ----------------------------------------------------
// APPLE TV+ TOP 20 TV SHOWS
// ----------------------------------------------------
export const APPLE_TV_TOP_20_SHOWS: FeaturedMovie[] = [
  {
    id: "severance-apple",
    title: "Severance",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/iSaaY4Bq4U6102Q2Pj6tG3R1X8m.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    rating: 8.7,
    certification: "TV-MA",
    director: "Dan Erickson",
    summary: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives."
  },
  {
    id: "ted-lasso-apple",
    title: "Ted Lasso",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/fC2HDm5t0kHVR79ujTVnpIxNGm2.jpg",
    genres: ["Comedy", "Drama", "Sport"],
    rating: 8.8,
    certification: "TV-MA",
    director: "Jason Sudeikis",
    summary: "An American college football coach is hired to manage a British soccer team. What he lacks in knowledge, he makes up for with optimism."
  },
  {
    id: "slow-horses",
    title: "Slow Horses",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/j1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Crime", "Drama", "Thriller"],
    rating: 8.2,
    certification: "TV-MA",
    director: "Will Smith",
    summary: "Follows a dysfunctional team of MI5 agents, and their obnoxious boss, the notorious Jackson Lamb, as they navigate the espionage world."
  },
  {
    id: "silo",
    title: "Silo",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/i1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "Sci-Fi"],
    rating: 8.1,
    certification: "TV-MA",
    director: "Graham Yost",
    summary: "Men and women live in a giant subterranean silo with several regulations which they believe are in place to protect them from the toxic world outside."
  },
  {
    id: "the-morning-show",
    title: "The Morning Show",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/h1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama"],
    rating: 8.2,
    certification: "TV-MA",
    director: "Jay Carson",
    summary: "An inside look at the modern workplace through the lens of the people who help America wake up, pulling back the curtain on early morning television."
  },
  {
    id: "presumed-innocent",
    title: "Presumed Innocent",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/g1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Crime", "Drama", "Mystery", "Thriller"],
    rating: 7.8,
    certification: "TV-MA",
    director: "David E. Kelley",
    summary: "A horrific murder upends the Chicago Prosecuting Attorney's office when chief deputy prosecutor Rusty Sabich is suspected of the crime."
  },
  {
    id: "for-all-mankind",
    title: "For All Mankind",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/f1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "Sci-Fi"],
    rating: 8.1,
    certification: "TV-MA",
    director: "Ronald D. Moore",
    summary: "Explores what would have happened if the global space race had never ended, continuing a world where the Soviet Union beats the US to the Moon."
  },
  {
    id: "foundation",
    title: "Foundation",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/e1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "Sci-Fi"],
    rating: 7.6,
    certification: "TV-14",
    director: "David S. Goyer, Josh Friedman",
    summary: "A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire."
  },
  {
    id: "black-bird",
    title: "Black Bird",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/d1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Biography", "Crime", "Drama", "Mystery", "Thriller"],
    rating: 8.1,
    certification: "TV-MA",
    director: "Dennis Lehane",
    summary: "Jimmy Keene is sentenced to 10 years in a minimum security prison but cuts a deal with the FBI to befriend a suspected serial killer."
  },
  {
    id: "bad-monkey",
    title: "Bad Monkey",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/c1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy", "Crime", "Drama"],
    rating: 7.4,
    certification: "TV-MA",
    director: "Bill Lawrence",
    summary: "A detective turned restaurant inspector in Southern Florida is pulled into a world of greed and corruption after a tourist finds a severed arm."
  },
  {
    id: "shrinking",
    title: "Shrinking",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/b1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy", "Drama"],
    rating: 8.0,
    certification: "TV-MA",
    director: "Brett Goldstein, Bill Lawrence, Jason Segel",
    summary: "A grieving therapist starts to tell his clients exactly what he thinks. Ignoring his training and ethics, he makes huge changes to people's lives - including his own."
  },
  {
    id: "pachinko",
    title: "Pachinko",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/a1N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "History"],
    rating: 8.4,
    certification: "TV-MA",
    director: "Soo Hugh",
    summary: "Based on the New York Times bestseller, this sweeping saga chronicles the hopes and dreams of a Korean immigrant family across four generations."
  },
  {
    id: "dark-matter",
    title: "Dark Matter",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/91N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "Sci-Fi", "Thriller"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Blake Crouch",
    summary: "A man is abducted into an alternate version of his life. Amid the mind-bending landscape of lives he could've lived, he embarks on a harrowing journey to return."
  },
  {
    id: "sugar",
    title: "Sugar",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/81N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Crime", "Drama", "Mystery"],
    rating: 7.4,
    certification: "TV-MA",
    director: "Mark Protosevich",
    summary: "An enigmatic private detective struggles with personal demons while investigating the disappearance of a legendary Hollywood producer's beloved granddaughter."
  },
  {
    id: "monarch-legacy",
    title: "Monarch: Legacy of Monsters",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/71N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 7.0,
    certification: "TV-14",
    director: "Chris Black, Matt Fraction",
    summary: "Set after the battle between Godzilla and the Titans, revealing that monsters are real, follows one family's journey to uncover buried secrets."
  },
  {
    id: "lessons-chemistry",
    title: "Lessons in Chemistry",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/61N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama"],
    rating: 8.2,
    certification: "TV-MA",
    director: "Lee Eisenberg",
    summary: "In the 1950s, Elizabeth Zott's dream of being a scientist is challenged by a society that says women belong in the domestic sphere only."
  },
  {
    id: "masters-air",
    title: "Masters of the Air",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/51N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Action", "Drama", "History", "Thriller", "War"],
    rating: 7.8,
    certification: "TV-MA",
    director: "John Shiban, John Orloff",
    summary: "During World War II, airmen risk their lives with the 100th Bomb Group, a brotherhood forged by courage, loss, and triumph."
  },
  {
    id: "hijack",
    title: "Hijack",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/41N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Drama", "Thriller"],
    rating: 7.4,
    certification: "TV-MA",
    director: "George Kay, Jim Field Smith",
    summary: "Told in real time, a hijacked plane makes its way to London over a seven-hour flight, and authorities on the ground scramble for answers."
  },
  {
    id: "mythic-quest",
    title: "Mythic Quest",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/31N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Charlie Day, Megan Ganz, Rob McElhenney",
    summary: "The owner of a successful video game design company and his troubled staff struggle to keep their hit game 'Mythic Quest' on top."
  },
  {
    id: "trying",
    title: "Trying",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/21N9jP1r7z3z9G8z8k9B5jP1r8.jpg",
    genres: ["Comedy"],
    rating: 7.9,
    certification: "TV-14",
    director: "Andy Wolton",
    summary: "Nikki and Jason want a baby, the one thing they cannot have, so they decide to adopt. With their dysfunctional friends, eccentric families and chaotic lives, will adoption agencies agree?"
  }
];

// ----------------------------------------------------
// LOCAL MEDIA FILES
// ----------------------------------------------------
export const LOCAL_MEDIA_FILES: LocalMediaFileItem[] = [
  {
    id: "bbb-sample",
    filename: "BigBuckBunny_4K60_HEVC.mp4",
    title: "Big Buck Bunny (4K 60FPS Master)",
    path: "/mnt/nvme0n1/media/movies/BigBuckBunny_4K60_HEVC.mp4",
    resolution: "3840x2160 (4K UHD)",
    fps: "60.00 fps",
    codec: "HEVC / H.265 (Main 10 Profile)",
    container: "MP4 Master",
    audioTrack: "Dolby Atmos TrueHD 7.1 (48kHz, 24-bit)",
    fileSize: "14.2 GB",
    bitrate: "48.5 Mbps",
    duration: "10m 34s",
    releaseYear: "2008",
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_堅毅的大兔子.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop",
    genres: ["Animation", "Comedy", "Short"],
    rating: 8.1,
    certification: "G",
    director: "Sacha Goedegeboure",
    summary: "A giant fluffy rabbit exacts sweet revenge on three bullying forest rodents in pristine 4K 60FPS master quality with uncompressed Atmos audio.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "sintel-sample",
    filename: "Sintel_1080p_HDR_Cinematic.mkv",
    title: "Sintel (HDR Cinematic Master)",
    path: "/mnt/nvme0n1/media/movies/Sintel_1080p_HDR_Cinematic.mkv",
    resolution: "1920x1080 (Full HD HDR)",
    fps: "24.00 fps",
    codec: "H.264 AVC (High@L4.2)",
    container: "MKV Matroska",
    audioTrack: "DTS-HD Master Audio 5.1 (48kHz)",
    fileSize: "6.8 GB",
    bitrate: "24.2 Mbps",
    duration: "15m 22s",
    releaseYear: "2010",
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    genres: ["Animation", "Fantasy", "Adventure"],
    rating: 7.7,
    certification: "PG",
    director: "Colin Levy",
    summary: "A young woman embarks on a dangerous mountain quest to rescue Scales, her companion baby dragon, in high-bitrate HDR.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "tears-sample",
    filename: "Tears_Of_Steel_4K_Atmos.mp4",
    title: "Tears of Steel (Sci-Fi Atmos Master)",
    path: "/mnt/nvme0n1/media/movies/Tears_Of_Steel_4K_Atmos.mp4",
    resolution: "3840x1714 (Scope 4K)",
    fps: "24.00 fps",
    codec: "HEVC / H.265 (HDR10)",
    container: "MP4 Master",
    audioTrack: "Dolby Atmos (E-AC-3 JOC)",
    fileSize: "18.5 GB",
    bitrate: "62.0 Mbps",
    duration: "12m 14s",
    releaseYear: "2012",
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Tears_of_steel_poster.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    genres: ["Sci-Fi", "Action", "Cyberpunk"],
    rating: 7.4,
    certification: "PG-13",
    director: "Ian Hubert",
    summary: "In a dystopian Amsterdam, scientists utilize an observatory defense weapon against rogue mechanical giants in master 4K Atmos.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "interstellar-sample",
    filename: "Interstellar_IMAX_70mm_4K_Remux.mkv",
    title: "Interstellar (IMAX 70mm 4K Remux)",
    path: "/mnt/nvme0n1/media/movies/Interstellar_IMAX_70mm_4K_Remux.mkv",
    resolution: "3840x2160 (IMAX 1.78:1 / 2.39:1)",
    fps: "23.976 fps",
    codec: "HEVC / H.265 (Main 10 HDR10)",
    container: "MKV Matroska Lossless",
    audioTrack: "DTS-HD Master Audio 5.1 (48kHz, 24-bit)",
    fileSize: "68.4 GB",
    bitrate: "64.8 Mbps",
    duration: "2h 49m",
    releaseYear: "2014",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.7,
    certification: "PG-13",
    director: "Christopher Nolan",
    summary: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers through a wormhole.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "dune2-sample",
    filename: "Dune_Part_Two_DolbyVision_Atmos.mkv",
    title: "Dune: Part Two (Dolby Vision Remux)",
    path: "/mnt/nvme0n1/media/movies/Dune_Part_Two_DolbyVision_Atmos.mkv",
    resolution: "3840x2160 (Scope 4K UHD)",
    fps: "24.00 fps",
    codec: "HEVC / H.265 (Profile 8.1 Dolby Vision)",
    container: "MKV Remux Master",
    audioTrack: "Dolby Atmos TrueHD 7.1 (48kHz, 24-bit)",
    fileSize: "74.1 GB",
    bitrate: "78.6 Mbps",
    duration: "2h 46m",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    genres: ["Sci-Fi", "Adventure", "Action"],
    rating: 8.5,
    certification: "PG-13",
    director: "Denis Villeneuve",
    summary: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    id: "neon-sample",
    filename: "Cosmos_Neon_Reference_AV1_10bit.mp4",
    title: "Cosmos & Neon (HDR10+ Reference Master)",
    path: "/storage/usbotg_samsung/demos/Cosmos_Neon_Reference_AV1.mp4",
    resolution: "3840x2160 (4K 60FPS)",
    fps: "60.00 fps",
    codec: "AV1 (AOMedia Video 1, 10-bit)",
    container: "MP4 Reference",
    audioTrack: "FLAC Lossless 7.1 (96kHz, 24-bit)",
    fileSize: "22.4 GB",
    bitrate: "92.0 Mbps",
    duration: "18m 40s",
    releaseYear: "2024",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    genres: ["Sci-Fi", "Documentary", "Visual Demo"],
    rating: 8.9,
    certification: "G",
    director: "Spatial Labs",
    summary: "Ultra-wide gamut deep black HDR10+ and AV1 reference master rendered at 92 Mbps with lossless 96kHz audio.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "sandisk-elephants",
    filename: "ElephantsDream_1080p_Portable.mp4",
    title: "Elephants Dream (Portable 1080p)",
    path: "/mnt/media_rw/USB1_SANDISK/movies/ElephantsDream_1080p_Portable.mp4",
    resolution: "1920x1080 (Full HD)",
    fps: "24.00 fps",
    codec: "H.264 AVC (High)",
    container: "MP4",
    audioTrack: "AAC 5.1 (48kHz)",
    fileSize: "2.1 GB",
    bitrate: "12.4 Mbps",
    duration: "10m 53s",
    releaseYear: "2006",
    posterUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Elephants_Dream_s5_both.jpg",
    bannerUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600&auto=format&fit=crop",
    genres: ["Animation", "Short", "Fantasy"],
    rating: 7.2,
    certification: "PG",
    director: "Bassam Kurdali",
    summary: "Portable USB master of the open-movie Elephants Dream, encoded for travel playback.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "sandisk-forrest",
    filename: "ForBiggerBlazes_Demo_HDR.mp4",
    title: "For Bigger Blazes (HDR Demo Reel)",
    path: "/mnt/media_rw/USB1_SANDISK/demos/ForBiggerBlazes_Demo_HDR.mp4",
    resolution: "1280x720 (HD)",
    fps: "30.00 fps",
    codec: "H.264 AVC",
    container: "MP4",
    audioTrack: "AAC Stereo",
    fileSize: "0.4 GB",
    bitrate: "8.2 Mbps",
    duration: "0m 15s",
    releaseYear: "2015",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    genres: ["Demo", "Action"],
    rating: 6.8,
    certification: "G",
    director: "Google",
    summary: "Short chromecast sample reel stored on the SanDisk Ultra stick for quick demos.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    id: "sandisk-joyrides",
    filename: "ForBiggerJoyrides_Travel.mp4",
    title: "For Bigger Joyrides (Travel Encode)",
    path: "/mnt/media_rw/USB1_SANDISK/demos/ForBiggerJoyrides_Travel.mp4",
    resolution: "1280x720 (HD)",
    fps: "30.00 fps",
    codec: "H.264 AVC",
    container: "MP4",
    audioTrack: "AAC Stereo",
    fileSize: "0.5 GB",
    bitrate: "9.1 Mbps",
    duration: "0m 15s",
    releaseYear: "2015",
    posterUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600&auto=format&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop",
    genres: ["Demo", "Travel"],
    rating: 6.9,
    certification: "G",
    director: "Google",
    summary: "Compact travel encode of the Joyrides sample clip on removable USB storage.",
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  }
];

// ----------------------------------------------------
// SHARED LIBRARIES FROM OTHER USERS
// ----------------------------------------------------
export const SHARED_PEER_LIBRARIES: SharedPeerLibrary[] = [
  {
    id: "steven-vault",
    name: "Steven's 4K Vault",
    owner: "Steven Azevedo",
    ownerHandle: "@steven_az",
    avatarInitials: "SA",
    avatarColor: "bg-gradient-to-tr from-sky-500 to-blue-600",
    itemCount: 148,
    status: "online",
    pingMs: 18,
    bandwidth: "98 Mbps Direct P2P",
    connectionType: "Direct LAN P2P",
    storageShared: "8.4 TB ZFS Array",
    location: "San Francisco, CA (Local LAN)",
    description: "Private collection of uncompressed 4K HDR & Dolby Atmos remuxes directly served with zero transcode overhead.",
    media: [
      { id: "dune-two", title: "Dune: Part Two", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", genres: ["Sci-Fi", "Adventure"], rating: 8.5, certification: "PG-13", director: "Denis Villeneuve", summary: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family." },
      { id: "spider-verse", title: "Spider-Man: Across the Spider-Verse", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sR48.jpg", genres: ["Animation", "Action"], rating: 8.6, certification: "PG", director: "Joaquim Dos Santos", summary: "Miles Morales catapults across the Multiverse with Gwen Stacy and an elite Spider-Society." },
      { id: "civil-war", title: "Civil War", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg", genres: ["Action", "Drama"], rating: 7.1, certification: "R", director: "Alex Garland", summary: "A journey across a dystopian future America, following military-embedded journalists racing to reach Washington D.C." },
      { id: "oppenheimer", title: "Oppenheimer", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", genres: ["Biography", "Drama"], rating: 8.9, certification: "R", director: "Christopher Nolan", summary: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb." },
      { id: "the-zone-of-interest", title: "The Zone of Interest", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg", genres: ["Drama", "History"], rating: 7.5, certification: "PG-13", director: "Jonathan Glazer", summary: "Auschwitz commandant Rudolf Höss and his wife Hedwig strive to build an idyllic domestic life right next to the camp." }
    ]
  },
  {
    id: "cinema-club",
    name: "Cinema Club Collective",
    owner: "Film Society Mesh",
    ownerHandle: "@cinemaclub",
    avatarInitials: "CC",
    avatarColor: "bg-gradient-to-tr from-amber-500 to-rose-600",
    itemCount: 412,
    status: "online",
    pingMs: 24,
    bandwidth: "1 Gbps Mesh",
    connectionType: "High-Speed Fiber Mesh",
    storageShared: "22 TB NAS",
    location: "North America Mesh Node 4",
    description: "Curated world cinema, Criterion transfers, modern festival winners, and 4K restored cinematic classics.",
    media: [
      { id: "poor-things", title: "Poor Things", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg", genres: ["Sci-Fi", "Comedy"], rating: 7.9, certification: "R", director: "Yorgos Lanthimos", summary: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by a brilliant scientist." },
      { id: "past-lives", title: "Past Lives", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", genres: ["Drama", "Romance"], rating: 7.9, certification: "PG-13", director: "Celine Song", summary: "Two deeply connected childhood friends are reunited in New York for one fateful week." },
      { id: "moonlight", title: "Moonlight", releaseYear: "2016", posterUrl: "https://image.tmdb.org/t/p/w500/3rWk9g0Oup5WHcrpjvw5zW1WhLc.jpg", genres: ["Drama"], rating: 7.4, certification: "R", director: "Barry Jenkins", summary: "A young African-American man struggles with identity and connection while growing up in Miami." },
      { id: "holdovers", title: "The Holdovers", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/a2E0aX8rN9Gk6rG7z7Ck0Q2Pj6.jpg", genres: ["Comedy", "Drama"], rating: 7.9, certification: "R", director: "Alexander Payne", summary: "A cranky prep school teacher remains on campus over the holidays to babysit students with nowhere to go." },
      { id: "roma", title: "Roma", releaseYear: "2018", posterUrl: "https://image.tmdb.org/t/p/w500/dtIL4bcm1g8Z8rT5X85n8X0m9A0.jpg", genres: ["Drama"], rating: 7.7, certification: "R", director: "Alfonso Cuarón", summary: "A year in the life of a middle-class family's maid in Mexico City during the tumultuous early 1970s." }
    ]
  },
  {
    id: "marcus-vault",
    name: "Marcus's Remux Direct",
    owner: "Marcus Vance",
    ownerHandle: "@marcus_v",
    avatarInitials: "MV",
    avatarColor: "bg-gradient-to-tr from-emerald-500 to-teal-600",
    itemCount: 85,
    status: "offline",
    pingMs: 0,
    bandwidth: "—",
    connectionType: "P2P Direct Tunnel",
    storageShared: "5.2 TB NVMe Pool",
    location: "Austin, TX",
    description: "High-octane action, sci-fi masterpieces, and IMAX enhanced cuts with multi-track lossy-free audio.",
    media: [
      { id: "deadpool-wolverine", title: "Deadpool & Wolverine", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", genres: ["Action", "Comedy"], rating: 7.8, certification: "R", director: "Shawn Levy", summary: "Deadpool is recruited by the Time Variance Authority, dragging a reluctant variant of Wolverine along." },
      { id: "gladiator-two", title: "Gladiator II", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg", genres: ["Action", "Adventure"], rating: 7.1, certification: "R", director: "Ridley Scott", summary: "Years after Maximus's sacrifice, Lucius enters the Colosseum after tyrannical emperors conquer his home." },
      { id: "extraction-2", title: "Extraction 2", releaseYear: "2023", posterUrl: "https://image.tmdb.org/t/p/w500/7gKI9hpEMcZUwYeCuVmACArrURM.jpg", genres: ["Action", "Thriller"], rating: 7.0, certification: "R", director: "Sam Hargrave", summary: "Back from the brink of death, commando Tyler Rake embarks on a dangerous mission to save an imprisoned family." },
      { id: "the-batman", title: "The Batman", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", genres: ["Action", "Crime"], rating: 7.8, certification: "PG-13", director: "Matt Reeves", summary: "When a serial killer begins murdering key figures in Gotham, Batman is forced to investigate the city's hidden corruption." }
    ]
  },
  {
    id: "sarah-vault",
    name: "Sarah's A24 & Indie Archive",
    owner: "Sarah Chen",
    ownerHandle: "@sarah_c",
    avatarInitials: "SC",
    avatarColor: "bg-gradient-to-tr from-purple-500 to-pink-600",
    itemCount: 62,
    status: "offline",
    pingMs: 0,
    bandwidth: "—",
    connectionType: "Direct LAN Peer",
    storageShared: "3.6 TB SSD",
    location: "Seattle, WA",
    description: "Complete A24 studio library, NEON releases, indie horrors, and modern psychological dramas in master quality.",
    media: [
      { id: "pearl", title: "Pearl", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/wqPjKHBPk41X2lnZ0zbw0clY6w1.jpg", genres: ["Horror", "Drama"], rating: 7.0, certification: "R", director: "Ti West", summary: "Trapped on her family's isolated farm, Pearl must tend to her ailing father under her mother's thumb." },
      { id: "x", title: "X", releaseYear: "2022", posterUrl: "https://image.tmdb.org/t/p/w500/h8C6NGgVANv0SB343JZqdxfu1D9.jpg", genres: ["Horror", "Mystery"], rating: 6.6, certification: "R", director: "Ti West", summary: "In 1979, an adult film crew rents an isolated farmhouse in rural Texas, where bizarre elderly hosts harbor sinister secrets." },
      { id: "love-lies-bleeding", title: "Love Lies Bleeding", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/xImj8RLe39YK0lyVu9kXv7ApN8p.jpg", genres: ["Crime", "Thriller"], rating: 7.0, certification: "R", director: "Rose Glass", summary: "Gym manager Lou falls hard for ambitious bodybuilder Jackie, sparking a dark descent into family crime." },
      { id: "heretic", title: "Heretic", releaseYear: "2024", posterUrl: "https://image.tmdb.org/t/p/w500/fr96XzlzsONrQrGfdLMiwtQjott.jpg", genres: ["Horror", "Thriller"], rating: 7.2, certification: "R", director: "Scott Beck", summary: "Two missionaries are forced into a deadly battle of wits when they knock on the door of the reclusive Mr. Reed." },
      { id: "uncut-gems", title: "Uncut Gems", releaseYear: "2019", posterUrl: "https://image.tmdb.org/t/p/w500/6XN1vxHc7kUSqNWtaQKN45J5x2v.jpg", genres: ["Crime", "Thriller"], rating: 7.4, certification: "R", director: "Josh Safdie", summary: "A charismatic New York jeweler makes a high-stakes bet that could lead to the windfall of a lifetime." }
    ]
  }
];
