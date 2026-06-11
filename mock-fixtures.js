// mock-fixtures.js

// Teams
const teams = [
  createTeam(101, "Canada"),
  createTeam(102, "Switzerland"),
  createTeam(103, "Mexico"),
  createTeam(104, "South Korea"),
  createTeam(105, "Argentina"),
  createTeam(106, "Japan"),
  createTeam(107, "Brazil"),
  createTeam(108, "Denmark"),
  createTeam(109, "Spain"),
  createTeam(110, "Ghana"),
  createTeam(111, "France"),
  createTeam(112, "Morocco"),
  createTeam(113, "England"),
  createTeam(114, "Uruguay"),
  createTeam(115, "Portugal"),
  createTeam(116, "Netherlands"),
  createTeam(117, "Germany"),
  createTeam(118, "United States"),
  createTeam(119, "Senegal"),
  createTeam(120, "Chile"),
  createTeam(121, "Italy"),
  createTeam(122, "Colombia"),
  createTeam(123, "Nigeria"),
  createTeam(124, "Australia"),
  createTeam(125, "Belgium"),
  createTeam(126, "Croatia"),
  createTeam(127, "Cameroon"),
  createTeam(128, "New Zealand"),
  createTeam(129, "Norway"),
  createTeam(130, "Ecuador"),
  createTeam(131, "Poland"),
  createTeam(132, "Qatar"),
  createTeam(133, "Czech Republic"),
  createTeam(134, "Scotland"),
  createTeam(135, "Egypt"),
  createTeam(136, "Costa Rica"),
  createTeam(137, "Sweden"),
  createTeam(138, "Paraguay"),
  createTeam(139, "Tunisia"),
  createTeam(140, "Saudi Arabia"),
  createTeam(141, "Wales"),
  createTeam(142, "Serbia"),
  createTeam(143, "Algeria"),
  createTeam(144, "Jamaica"),
  createTeam(145, "Ukraine"),
  createTeam(146, "Peru"),
  createTeam(147, "Ivory Coast"),
  createTeam(148, "Panama")
];

const tbdTeam = {
  id: null,
  name: "TBD",
  logo: "",
  winner: null
};

// Groups
const groups = [
  { name: "Group A", teams: teams.slice(0, 4) },
  { name: "Group B", teams: teams.slice(4, 8) },
  { name: "Group C", teams: teams.slice(8, 12) },
  { name: "Group D", teams: teams.slice(12, 16) },
  { name: "Group E", teams: teams.slice(16, 20) },
  { name: "Group F", teams: teams.slice(20, 24) },
  { name: "Group G", teams: teams.slice(24, 28) },
  { name: "Group H", teams: teams.slice(28, 32) },
  { name: "Group I", teams: teams.slice(32, 36) },
  { name: "Group J", teams: teams.slice(36, 40) },
  { name: "Group K", teams: teams.slice(40, 44) },
  { name: "Group L", teams: teams.slice(44, 48) }
];

// Venues
const venues = [
  { id: 1, name: "Example Stadium", city: "Toronto" },
  { id: 2, name: "Example Park", city: "Vancouver" },
  { id: 3, name: "Example Arena", city: "Mexico City" },
  { id: 4, name: "Example Field", city: "New York" },
  { id: 5, name: "Example Bowl", city: "Los Angeles" },
  { id: 6, name: "Example Stadium", city: "Dallas" },
  { id: 7, name: "Example Park", city: "Seattle" },
  { id: 8, name: "Example Arena", city: "Atlanta" },
  { id: 9, name: "Example Field", city: "Miami" },
  { id: 10, name: "Example Bowl", city: "Boston" },
  { id: 11, name: "Example Stadium", city: "Houston" },
  { id: 12, name: "Example Park", city: "Philadelphia" }
];

// Helper functions

// Create the team shape used by API-Football fixtures.
function createTeam(id, name) {
  return {
    id,
    name,
    logo: "",
    winner: null
  };
}

// Create one API-shaped fixture object.
function createFixture({ id, homeTeam, awayTeam, round, date, venue, status, goals }) {
  const homeGoals = goals.home;
  const awayGoals = goals.away;
  const isFinished = status.short === "FT";

  return {
    fixture: {
      id,
      referee: isFinished ? "Example Referee" : null,
      timezone: "UTC",
      date,
      timestamp: getTimestamp(date),

      periods: {
        first: null,
        second: null
      },

      venue,

      status
    },

    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      round,
      standings: true
    },

    teams: {
      home: {
        ...homeTeam,
        winner: getWinnerValue(homeGoals, awayGoals, isFinished, "home")
      },

      away: {
        ...awayTeam,
        winner: getWinnerValue(homeGoals, awayGoals, isFinished, "away")
      }
    },

    goals: {
      home: homeGoals,
      away: awayGoals
    },

    score: {
      halftime: getHalftimeScore(homeGoals, awayGoals, isFinished),

      fulltime: {
        home: isFinished ? homeGoals : null,
        away: isFinished ? awayGoals : null
      },

      extratime: {
        home: null,
        away: null
      },

      penalty: {
        home: null,
        away: null
      }
    }
  };
}

// Create a fixture that has not started.
function createUpcomingFixture({ id, homeTeam, awayTeam, round, date, venue }) {
  return createFixture({
    id,
    homeTeam,
    awayTeam,
    round,
    date,
    venue,
    status: {
      long: "Not Started",
      short: "NS",
      elapsed: null,
      extra: null
    },
    goals: {
      home: null,
      away: null
    }
  });
}

// Create a finished fixture with a full-time score.
function createCompletedFixture({ id, homeTeam, awayTeam, round, date, venue, score }) {
  return createFixture({
    id,
    homeTeam,
    awayTeam,
    round,
    date,
    venue,
    status: {
      long: "Match Finished",
      short: "FT",
      elapsed: 90,
      extra: null
    },
    goals: score
  });
}

// Create a live fixture in the first or second half.
function createLiveFixture({ id, homeTeam, awayTeam, round, date, venue, score, half }) {
  const isFirstHalf = half === "1H";

  return createFixture({
    id,
    homeTeam,
    awayTeam,
    round,
    date,
    venue,
    status: {
      long: isFirstHalf ? "First Half" : "Second Half",
      short: half,
      elapsed: isFirstHalf ? 34 : 67,
      extra: null
    },
    goals: score
  });
}

// Work out which team won, if the fixture is finished.
function getWinnerValue(homeGoals, awayGoals, isFinished, side) {
  if (!isFinished || homeGoals === awayGoals) {
    return null;
  }

  if (side === "home") {
    return homeGoals > awayGoals;
  }

  return awayGoals > homeGoals;
}

// Create a simple halftime score for completed matches.
function getHalftimeScore(homeGoals, awayGoals, isFinished) {
  if (!isFinished) {
    return {
      home: null,
      away: null
    };
  }

  return {
    home: Math.max(0, homeGoals - 1),
    away: Math.max(0, awayGoals - 1)
  };
}

// Convert the ISO date string into a Unix timestamp.
function getTimestamp(date) {
  return Math.floor(new Date(date).getTime() / 1000);
}

// Cycle through the available venues.
function getVenue(index) {
  return venues[index % venues.length];
}

// Spread group-stage dates between June 11 and June 27.
function getGroupStageDate(index) {
  const day = 11 + Math.floor(index / 5);
  const times = ["16:30", "18:00", "19:30", "21:00", "22:30"];
  const time = times[index % times.length];

  return `2026-06-${String(day).padStart(2, "0")}T${time}:00+00:00`;
}

// Pick a future date for each knockout round.
function getKnockoutDate(index, round) {
  const datesByRound = {
    "Round of 32": ["2026-06-28", "2026-06-29", "2026-06-30", "2026-07-01"],
    "Round of 16": ["2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07"],
    "Quarter-finals": ["2026-07-09", "2026-07-10", "2026-07-11"],
    "Semi-finals": ["2026-07-14", "2026-07-15"],
    "3rd Place Final": ["2026-07-18"],
    Final: ["2026-07-19"]
  };
  const times = ["17:30", "20:00", "21:30", "23:00"];
  const dates = datesByRound[round];

  return `${dates[index % dates.length]}T${times[index % times.length]}:00+00:00`;
}

// Cycle through realistic finished scores.
function getCompletedScore(index) {
  const scores = [
    { home: 2, away: 1 },
    { home: 1, away: 0 },
    { home: 3, away: 1 },
    { home: 0, away: 0 },
    { home: 1, away: 1 },
    { home: 2, away: 0 },
    { home: 0, away: 2 },
    { home: 3, away: 2 },
    { home: 1, away: 2 },
    { home: 4, away: 1 }
  ];

  return scores[index % scores.length];
}

// Provide two fixed live scores.
function getLiveScore(index) {
  const scores = [
    { home: 1, away: 0 },
    { home: 2, away: 2 }
  ];

  return scores[index % scores.length];
}

// Group-stage generation
function createGroupStageFixtures() {
  const pairingsByRound = [
    [
      [0, 1],
      [2, 3]
    ],
    [
      [0, 2],
      [1, 3]
    ],
    [
      [0, 3],
      [1, 2]
    ]
  ];

  const groupFixtures = [];

  groups.forEach(group => {
    pairingsByRound.forEach((roundPairings, roundIndex) => {
      roundPairings.forEach(pairing => {
        const fixtureIndex = groupFixtures.length;
        const id = 1001 + fixtureIndex;
        const homeTeam = group.teams[pairing[0]];
        const awayTeam = group.teams[pairing[1]];
        const round = `Group Stage - ${roundIndex + 1}`;
        const date = getGroupStageDate(fixtureIndex);
        const venue = getVenue(fixtureIndex);

        if (fixtureIndex < 50) {
          groupFixtures.push(
            createCompletedFixture({
              id,
              homeTeam,
              awayTeam,
              round,
              date,
              venue,
              score: getCompletedScore(fixtureIndex)
            })
          );
          return;
        }

        if (fixtureIndex === 50 || fixtureIndex === 51) {
          groupFixtures.push(
            createLiveFixture({
              id,
              homeTeam,
              awayTeam,
              round,
              date,
              venue,
              score: getLiveScore(fixtureIndex - 50),
              half: fixtureIndex === 50 ? "1H" : "2H"
            })
          );
          return;
        }

        groupFixtures.push(
          createUpcomingFixture({
            id,
            homeTeam,
            awayTeam,
            round,
            date,
            venue
          })
        );
      });
    });
  });

  return groupFixtures;
}

// Knockout generation
function createKnockoutFixtures(startingId) {
  const knockoutRounds = [
    { round: "Round of 32", count: 16 },
    { round: "Round of 16", count: 8 },
    { round: "Quarter-finals", count: 4 },
    { round: "Semi-finals", count: 2 },
    { round: "3rd Place Final", count: 1 },
    { round: "Final", count: 1 }
  ];
  const knockoutFixtures = [];

  knockoutRounds.forEach(roundInfo => {
    for (let index = 0; index < roundInfo.count; index += 1) {
      const fixtureIndex = knockoutFixtures.length;

      knockoutFixtures.push(
        createUpcomingFixture({
          id: startingId + fixtureIndex,
          homeTeam: tbdTeam,
          awayTeam: tbdTeam,
          round: roundInfo.round,
          date: getKnockoutDate(index, roundInfo.round),
          venue: getVenue(72 + fixtureIndex)
        })
      );
    }
  });

  return knockoutFixtures;
}

const groupStageFixtures = createGroupStageFixtures();
const knockoutFixtures = createKnockoutFixtures(1001 + groupStageFixtures.length);
const fixtures = [...groupStageFixtures, ...knockoutFixtures];

// Exported response
export const mockFixturesResponse = {
  get: "fixtures",

  parameters: {
    league: "1",
    season: "2026"
  },

  errors: [],

  results: fixtures.length,

  paging: {
    current: 1,
    total: 1
  },

  response: fixtures
};

// Basic validation
function validateFixtures() {
  const fixtureIds = fixtures.map(fixture => fixture.fixture.id);
  const uniqueFixtureIds = new Set(fixtureIds);
  const groupStageCount = fixtures.filter(fixture =>
    fixture.league.round.startsWith("Group Stage")
  ).length;
  const knockoutCount = fixtures.length - groupStageCount;
  const completedCount = fixtures.filter(fixture => fixture.fixture.status.short === "FT").length;
  const liveCount = fixtures.filter(fixture =>
    ["1H", "2H"].includes(fixture.fixture.status.short)
  ).length;
  const upcomingCount = fixtures.filter(fixture => fixture.fixture.status.short === "NS").length;

  const checks = [
    ["fixtures.length === 104", fixtures.length === 104],
    ["all fixture IDs are unique", uniqueFixtureIds.size === fixtureIds.length],
    ["there are 72 group-stage fixtures", groupStageCount === 72],
    ["there are 32 knockout fixtures", knockoutCount === 32],
    ["there are 50 FT fixtures", completedCount === 50],
    ["there are 2 live fixtures", liveCount === 2],
    ["there are 52 NS fixtures", upcomingCount === 52]
  ];

  checks.forEach(check => {
    if (!check[1]) {
      console.error(`Mock fixture validation failed: ${check[0]}`);
    }
  });
}

validateFixtures();
