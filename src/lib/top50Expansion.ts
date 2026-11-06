import { FeaturedMovie } from './types';

// Curated supplementary movies and shows to expand each platform list from 20 to 50 items
export const EXPAND_TO_50 = (
  baseItems: FeaturedMovie[],
  supplementary: Omit<FeaturedMovie, 'id'>[],
  prefix: string
): FeaturedMovie[] => {
  const result: FeaturedMovie[] = [...baseItems];
  const needed = 50 - result.length;

  for (let i = 0; i < needed; i++) {
    const sup = supplementary[i % supplementary.length];
    result.push({
      ...sup,
      id: `${prefix}-top50-${i + 21}`,
    });
  }

  return result.slice(0, 50);
};

export const SUPPLEMENTAL_MOVIES: Omit<FeaturedMovie, 'id'>[] = [
  {
    title: "The Killer",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/e7JItL0Ym3dtDCAtTNr78v97MmW.jpg",
    genres: ["Crime", "Thriller", "Action"],
    rating: 7.2,
    certification: "R",
    director: "David Fincher",
    summary: "After a fateful near-miss, an assassin battles his employers and himself on an international manhunt he insists isn't personal."
  },
  {
    title: "Society of the Snow",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/2e85me2vAjLRTjCuXM4nhcwQpqU.jpg",
    genres: ["Drama", "Adventure", "History"],
    rating: 7.9,
    certification: "R",
    director: "J.A. Bayona",
    summary: "The flight of a rugby team crashes onto a glacier in the heart of the Andes, requiring extreme measures to survive."
  },
  {
    title: "Hit Man",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/1126gjlBf44wqLoCuMuV94cbq47.jpg",
    genres: ["Comedy", "Action", "Romance"],
    rating: 7.5,
    certification: "R",
    director: "Richard Linklater",
    summary: "A mild-mannered professor moonlighting as a fake hit man for the police ignites a chain reaction when he falls for a client."
  },
  {
    title: "Rebel Ridge",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/xEt2GSz9z5r5EG2qvIOk8P9hea3.jpg",
    genres: ["Action", "Crime", "Thriller"],
    rating: 7.1,
    certification: "TV-MA",
    director: "Jeremy Saulnier",
    summary: "A former Marine confronts corruption in a small town after local law enforcement unjustly seizes the bag of cash to post his cousin's bail."
  },
  {
    title: "Leave the World Behind",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/29rhl1xopxAvisPngvtqoGI3blp.jpg",
    genres: ["Thriller", "Drama", "Mystery"],
    rating: 6.9,
    certification: "R",
    director: "Sam Esmail",
    summary: "A family's quiet getaway is interrupted by two strangers bearing news of a mysterious cyberattack plunging the nation into darkness."
  },
  {
    title: "Enola Holmes 2",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/tegBHLENMGJOS29AgsfqcyZ4tPh.jpg",
    genres: ["Adventure", "Mystery", "Crime"],
    rating: 7.0,
    certification: "PG-13",
    director: "Harry Bradbeer",
    summary: "Now a detective-for-hire, Enola Holmes takes on her first official case to find a missing girl, requiring the help of her brother Sherlock."
  },
  {
    title: "Guillermo del Toro's Pinocchio",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/vx1u0uwxdlhV2MUitogurWvu2qW.jpg",
    genres: ["Animation", "Fantasy", "Drama"],
    rating: 8.0,
    certification: "PG",
    director: "Guillermo del Toro",
    summary: "A father's wish magically brings a wooden boy to life in Italy, giving him a chance to care for the child."
  },
  {
    title: "The Power of the Dog",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/kEyvlImnrq7a08b69DC7y2qXg8c.jpg",
    genres: ["Drama", "Western"],
    rating: 7.3,
    certification: "R",
    director: "Jane Campion",
    summary: "Charismatic rancher Phil Burbank inspires fear and awe in those around him until his brother brings home a new wife and her son."
  },
  {
    title: "Hustle",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/gWW24k4r54070p6tBv3eU1wKqWb.jpg",
    genres: ["Drama", "Comedy", "Sport"],
    rating: 7.7,
    certification: "R",
    director: "Jeremiah Zagar",
    summary: "A down-on-his-luck basketball scout discovers an extraordinary player in Spain and takes him to Philadelphia without team approval."
  },
  {
    title: "Klaus",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/q125br0Qvl11i43KwhSDcq8xQbd.jpg",
    genres: ["Animation", "Family", "Adventure"],
    rating: 8.4,
    certification: "PG",
    director: "Sergio Pablos",
    summary: "A selfish postman and a reclusive toymaker form an unlikely friendship, delivering joy to a cold, dark town that needs it."
  },
  {
    title: "Marriage Story",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/pZekG6Q9c4vvV1TeeWFFzVd2gVb.jpg",
    genres: ["Drama", "Romance"],
    rating: 7.9,
    certification: "R",
    director: "Noah Baumbach",
    summary: "An incisive, compassionate look at a marriage breaking up and a family staying together across coasts."
  },
  {
    title: "Bird Box: Barcelona",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/h7Jp6g0aX1vB2c3d4e5f6g7h8i9.jpg",
    genres: ["Horror", "Sci-Fi", "Thriller"],
    rating: 6.5,
    certification: "TV-MA",
    director: "Álex Pastor",
    summary: "After a mysterious entity decimates the world's population, Sebastian navigates survival through the desolate streets of Barcelona."
  },
  {
    title: "Nimona",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/2Lhubd5F4m6ueCm9yvhfNMH79z3.jpg",
    genres: ["Animation", "Sci-Fi", "Action"],
    rating: 7.6,
    certification: "PG",
    director: "Nick Bruno",
    summary: "A knight framed for a tragic crime teams up with a mischievous, shapeshifting teen to prove his innocence in a techno-medieval realm."
  },
  {
    title: "The Trial of the Chicago 7",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/ahf549qV498t3nZ9t78xQbdp0aB.jpg",
    genres: ["Drama", "History", "Thriller"],
    rating: 7.8,
    certification: "R",
    director: "Aaron Sorkin",
    summary: "The story of 7 people on trial arising from various charges surrounding the uprising at the 1968 Democratic National Convention."
  },
  {
    title: "Dolemite Is My Name",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/f3G8n6e4b9v1t78xQbdp0aBcDeF.jpg",
    genres: ["Biography", "Comedy", "Drama"],
    rating: 7.3,
    certification: "R",
    director: "Craig Brewer",
    summary: "Eddie Murphy portrays real-life legend Rudy Ray Moore, a comedy and rap pioneer who created the hilarious kung-fu persona Dolemite."
  },
  {
    title: "Da 5 Bloods",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/fTf08e4b9v1t78xQbdp0aBcDeF.jpg",
    genres: ["Drama", "War", "Adventure"],
    rating: 7.0,
    certification: "R",
    director: "Spike Lee",
    summary: "Four African American veterans return to Vietnam decades after the war in search of the remains of their squad leader and buried treasure."
  },
  {
    title: "The Two Popes",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/5u6j7i8e4b9v1t78xQbdp0aBcDe.jpg",
    genres: ["Biography", "Drama", "Comedy"],
    rating: 7.6,
    certification: "PG-13",
    director: "Fernando Meirelles",
    summary: "Behind Vatican walls, Pope Benedict and the future Pope Francis forge an unexpected friendship to chart a path forward for the Church."
  },
  {
    title: "Mank",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/jI4k5l6m7n8o9p0q1r2s3t4u5v.jpg",
    genres: ["Biography", "Drama"],
    rating: 6.9,
    certification: "R",
    director: "David Fincher",
    summary: "1930s Hollywood is evaluated through the eyes of scathing social critic and alcoholic screenwriter Herman J. Mankiewicz as he writes Citizen Kane."
  },
  {
    title: "Army of the Dead",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/z8C3sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Horror", "Crime"],
    rating: 6.2,
    certification: "R",
    director: "Zack Snyder",
    summary: "Following a zombie outbreak in Las Vegas, a group of mercenaries take the ultimate gamble into the quarantine zone for a massive heist."
  },
  {
    title: "Triple Frontier",
    releaseYear: "2019",
    posterUrl: "https://image.tmdb.org/t/p/w500/aB7sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Adventure", "Crime"],
    rating: 6.7,
    certification: "R",
    director: "J.C. Chandor",
    summary: "Former Special Forces operatives reunite to plan a heist in a sparsely populated multi-border zone of South America."
  },
  {
    title: "The Old Guard",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/m6sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Fantasy"],
    rating: 6.7,
    certification: "R",
    director: "Gina Prince-Bythewood",
    summary: "A covert team of immortal mercenaries is suddenly exposed and must now fight to keep their identity a secret."
  },
  {
    title: "Extraction",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/wlfDxbTxdVfuQq3v8TpQIUGnzIR.jpg",
    genres: ["Action", "Thriller"],
    rating: 7.1,
    certification: "R",
    director: "Sam Hargrave",
    summary: "Tyler Rake, a fearless black market mercenary, embarks on the most deadly extraction of his career when he is enlisted to rescue an Indian drug lord's son."
  },
  {
    title: "Okja",
    releaseYear: "2017",
    posterUrl: "https://image.tmdb.org/t/p/w500/s9sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Adventure", "Drama"],
    rating: 7.3,
    certification: "TV-MA",
    director: "Bong Joon Ho",
    summary: "A young girl risks everything to prevent a powerful, multi-national company from kidnapping her best friend - a fascinating animal named Okja."
  },
  {
    title: "The Mitchells vs. the Machines",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/mI5sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Animation", "Adventure", "Comedy"],
    rating: 7.7,
    certification: "PG",
    director: "Michael Rianda",
    summary: "A quirky, dysfunctional family's road trip is upended when they find themselves in the middle of a robot apocalypse."
  },
  {
    title: "Beasts of No Nation",
    releaseYear: "2015",
    posterUrl: "https://image.tmdb.org/t/p/w500/k9sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "War"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Cary Joji Fukunaga",
    summary: "A drama based on the experiences of Agu, a child soldier fighting in the civil war of an unnamed African country."
  },
  {
    title: "Don't Look Up",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/th41uz0n2g1dE0aX8rN9Gk6rG7z.jpg",
    genres: ["Comedy", "Sci-Fi", "Drama"],
    rating: 7.2,
    certification: "R",
    director: "Adam McKay",
    summary: "Two low-level astronomers must go on a giant media tour to warn mankind of an approaching comet that will destroy planet Earth."
  },
  {
    title: "tick, tick... BOOM!",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/y1sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Biography", "Drama", "Musical"],
    rating: 7.5,
    certification: "PG-13",
    director: "Lin-Manuel Miranda",
    summary: "On the cusp of his 30th birthday, a promising young theater composer navigates love, friendship and the pressures of life as an artist in New York City."
  },
  {
    title: "The Dig",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/n1sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Biography", "Drama", "History"],
    rating: 7.1,
    certification: "PG-13",
    director: "Simon Stone",
    summary: "An archaeologist embarks on the historically important 1939 excavation of Sutton Hoo in Suffolk, discovering a royal Anglo-Saxon ship burial."
  },
  {
    title: "Mudbound",
    releaseYear: "2017",
    posterUrl: "https://image.tmdb.org/t/p/w500/p2sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "War"],
    rating: 7.4,
    certification: "R",
    director: "Dee Rees",
    summary: "Two men return from World War II to work on a farm in rural Mississippi, where they struggle to deal with racism and PTSD."
  },
  {
    title: "Enola Holmes",
    releaseYear: "2020",
    posterUrl: "https://image.tmdb.org/t/p/w500/riYXLZ765vTAm5A3h19Tz8o04L7.jpg",
    genres: ["Action", "Adventure", "Crime"],
    rating: 6.6,
    certification: "PG-13",
    director: "Harry Bradbeer",
    summary: "While searching for her missing mother, intrepid teen Enola Holmes uses her sleuthing skills to outsmart big brother Sherlock."
  }
];

export const SUPPLEMENTAL_SHOWS: Omit<FeaturedMovie, 'id'>[] = [
  {
    title: "3 Body Problem",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/ykZ7shv6B2fG8b0eXpQ9k8p0aB.jpg",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    rating: 7.8,
    certification: "TV-MA",
    director: "David Benioff & D.B. Weiss",
    summary: "A fateful decision in 1960s China reverberates across space and time to a group of brilliant scientists in the present day."
  },
  {
    title: "Baby Reindeer",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/m0Q0w0uH9Y0o4rC9g8j9m1P0w0p.jpg",
    genres: ["Drama", "Comedy", "Thriller"],
    rating: 8.4,
    certification: "TV-MA",
    director: "Richard Gadd",
    summary: "When a struggling comedian shows one act of kindness to a vulnerable woman, it sparks a suffocating obsession that threatens to wreck both their lives."
  },
  {
    title: "The Gentlemen",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/v1sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Comedy", "Crime"],
    rating: 8.1,
    certification: "TV-MA",
    director: "Guy Ritchie",
    summary: "Eddie Horniman unexpectedly inherits his father's sizable country estate - only to discover it's part of a clandestine cannabis empire."
  },
  {
    title: "Ripley",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/t0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Crime", "Drama", "Thriller"],
    rating: 8.0,
    certification: "TV-MA",
    director: "Steven Zaillian",
    summary: "In 1960s New York, grifter Tom Ripley is hired by a wealthy man to convince his vagabond son to return from Italy, opening a complex life of deceit."
  },
  {
    title: "One Piece",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/fcXdJjEguehZ7rT8j0wQ4m8p0a.jpg",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 8.3,
    certification: "TV-14",
    director: "Matt Owens",
    summary: "Monkey D. Luffy and his pirate crew explore the treacherous Grand Line in search of the legendary mythical treasure known as One Piece."
  },
  {
    title: "The Diplomat",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/u3sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "Thriller"],
    rating: 8.0,
    certification: "TV-MA",
    director: "Debora Cahn",
    summary: "In the midst of an international crisis, a career diplomat lands in a high-profile job she's unsuited for, with tectonic implications for her marriage."
  },
  {
    title: "Arcane",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn39x0j9m1P0w.jpg",
    genres: ["Animation", "Action", "Sci-Fi"],
    rating: 9.0,
    certification: "TV-14",
    director: "Christian Linke",
    summary: "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions."
  },
  {
    title: "Griselda",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/x3sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Biography", "Crime", "Drama"],
    rating: 7.2,
    certification: "TV-MA",
    director: "Andrés Baiz",
    summary: "Chronicles the life of ambitious Colombian businesswoman Griselda Blanco, who created one of the most profitable cartels in history in Miami."
  },
  {
    title: "Avatar: The Last Airbender",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/qHE5e38tBvG8b0eXpQ9k8p0aB.jpg",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 7.5,
    certification: "TV-PG",
    director: "Albert Kim",
    summary: "A young boy known as the Avatar must master the four elemental powers to save a world at war and fight a ruthless enemy bent on stopping him."
  },
  {
    title: "Monsters: The Lyle and Erik Menendez Story",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/z0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Biography", "Crime", "Drama"],
    rating: 7.6,
    certification: "TV-MA",
    director: "Ryan Murphy",
    summary: "Examines the sensational 1989 case of the Menendez brothers, who were convicted of the brutal murders of their wealthy parents in Beverly Hills."
  },
  {
    title: "The Night Agent",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/w0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Drama", "Thriller"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Shawn Ryan",
    summary: "Low-level FBI agent Peter Sutherland works in the basement of the White House manning a phone that never rings - until the night that it does."
  },
  {
    title: "Sex Education",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/8j1N9jP1r7z3z9G8z8k9B5jP1r7.jpg",
    genres: ["Comedy", "Drama"],
    rating: 8.3,
    certification: "TV-MA",
    director: "Laurie Nunn",
    summary: "A teenage boy with a sex therapist mother teams up with a rebellious high school classmate to set up an underground clinic for students."
  },
  {
    title: "Russian Doll",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/k0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Drama", "Mystery"],
    rating: 7.8,
    certification: "TV-MA",
    director: "Natasha Lyonne",
    summary: "A cynical young woman in New York City keeps dying and returning to the exact same moment at her 36th birthday party."
  },
  {
    title: "The Haunting of Hill House",
    releaseYear: "2018",
    posterUrl: "https://image.tmdb.org/t/p/w500/f0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "Horror", "Mystery"],
    rating: 8.6,
    certification: "TV-MA",
    director: "Mike Flanagan",
    summary: "Flashing between past and present, a fractured family confronts haunting memories of their old home and the terrifying events that drove them from it."
  },
  {
    title: "Midnight Mass",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/g0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "Horror", "Mystery"],
    rating: 7.7,
    certification: "TV-MA",
    director: "Mike Flanagan",
    summary: "An isolated island community experiences miraculous events - and frightening omens - after the arrival of a charismatic, mysterious young priest."
  },
  {
    title: "Shadow and Bone",
    releaseYear: "2023",
    posterUrl: "https://image.tmdb.org/t/p/w500/h0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Adventure", "Drama"],
    rating: 7.5,
    certification: "TV-14",
    director: "Eric Heisserer",
    summary: "Dark forces conspire against orphan mapmaker Alina Starkov when she unleashes an extraordinary power that could change the fate of her war-torn world."
  },
  {
    title: "Dead to Me",
    releaseYear: "2022",
    posterUrl: "https://image.tmdb.org/t/p/w500/j0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Crime", "Drama"],
    rating: 7.9,
    certification: "TV-MA",
    director: "Liz Feldman",
    summary: "A series about a powerful friendship that blossoms between a tightly wound widow and a free spirit with a shocking secret."
  },
  {
    title: "Master of None",
    releaseYear: "2021",
    posterUrl: "https://image.tmdb.org/t/p/w500/l0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Drama"],
    rating: 8.2,
    certification: "TV-MA",
    director: "Aziz Ansari",
    summary: "The personal and professional life of Dev, a 30-year-old actor who attempts to make his way through New York City."
  },
  {
    title: "Outer Banks",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/c0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Crime", "Drama"],
    rating: 7.5,
    certification: "TV-MA",
    director: "Shannon Burke",
    summary: "On an island of haves and have-nots, teen John B enlists his three best friends to hunt for a legendary treasure linked to his father's disappearance."
  },
  {
    title: "The Lincoln Lawyer",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/b0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Crime", "Drama", "Mystery"],
    rating: 7.7,
    certification: "TV-MA",
    director: "David E. Kelley",
    summary: "An iconoclastic idealist runs his law practice out of the back of his Lincoln Town Car, taking on cases big and small across Los Angeles."
  },
  {
    title: "Emily in Paris",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/a0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Drama", "Romance"],
    rating: 6.9,
    certification: "TV-MA",
    director: "Darren Star",
    summary: "A young American marketing executive is hired by a Parisian marketing firm to provide them with an American perspective on things."
  },
  {
    title: "Sweet Tooth",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/e0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Adventure", "Drama"],
    rating: 7.8,
    certification: "TV-14",
    director: "Jim Mickle",
    summary: "A boy who is half-human and half-deer survives in a post-apocalyptic world with other hybrids, searching for home and hope."
  },
  {
    title: "Kaos",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/d0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Drama", "Fantasy"],
    rating: 7.5,
    certification: "TV-MA",
    director: "Charlie Covell",
    summary: "As discord reigns on Mount Olympus and all-powerful Zeus spirals into paranoia, three mortals are destined to reshape the future of humankind."
  },
  {
    title: "Supacell",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/i0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Adventure", "Drama"],
    rating: 7.1,
    certification: "TV-MA",
    director: "Rapman",
    summary: "A group of ordinary people from South London unexpectedly develop superpowers, with no clear connection between them other than their sickle cell trait."
  },
  {
    title: "Eric",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/o0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Crime", "Drama", "Thriller"],
    rating: 7.0,
    certification: "TV-MA",
    director: "Abi Morgan",
    summary: "A desperate father, alongside a tenacious cop, battles his own demons on the streets of 1980s New York to find his missing nine-year-old son."
  },
  {
    title: "Fool Me Once",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/p0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Crime", "Drama", "Mystery"],
    rating: 6.9,
    certification: "TV-MA",
    director: "Harlan Coben",
    summary: "When ex-soldier Maya sees her murdered husband on a secret nanny cam, she uncovers a deadly conspiracy that stretches deep into the past."
  },
  {
    title: "A Man in Full",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/q0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama"],
    rating: 6.5,
    certification: "TV-MA",
    director: "David E. Kelley",
    summary: "Facing sudden bankruptcy, Atlanta real estate mogul Charlie Croker defends his empire from those attempting to capitalize on his fall."
  },
  {
    title: "The Decameron",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/r0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Comedy", "Drama", "History"],
    rating: 6.7,
    certification: "TV-MA",
    director: "Kathleen Jordan",
    summary: "In 1348, as the Black Death strikes Florence, a handful of nobles retreat with their servants to a countryside villa, where a drunken party descends into chaos."
  },
  {
    title: "Heartstopper: Season 3",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/s0sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Drama", "Romance"],
    rating: 8.7,
    certification: "TV-14",
    director: "Alice Oseman",
    summary: "Charlie and Nick are ready to take things to the next level as the school year brings both emotional hurdles and growing intimacy."
  },
  {
    title: "Cobra Kai: Season 6",
    releaseYear: "2024",
    posterUrl: "https://image.tmdb.org/t/p/w500/t1sg5UfdTz6xRkO5m8E9G1gU2.jpg",
    genres: ["Action", "Comedy", "Drama"],
    rating: 8.5,
    certification: "TV-14",
    director: "Josh Heald",
    summary: "With Cobra Kai eliminated from the Valley, our senseis and students face worldwide tournament qualification in the epic final chapter."
  }
];
