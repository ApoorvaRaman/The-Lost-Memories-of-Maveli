// All narrative text lives here, separate from scene logic, so it stays easy to edit.

export const INTRO_CARDS = [
  {
    speaker: '',
    text: "Long ago, during the golden reign of King Maveli, Kerala was remembered as a land of prosperity, equality, and happiness."
  },
  {
    speaker: '',
    text: "Every Onam, it is said his spirit returns to see his people once more."
  },
  {
    speaker: '',
    text: "But this year, three memories of that golden kingdom have scattered across the land — lost among its people, its waters, and its palace."
  },
  {
    speaker: '',
    text: "Travel through Malabar, Kochi and Travancore. Recover the memories, and discover what Maveli's kingdom truly meant to its people."
  }
];

export const MALABAR_NPCS = [
  {
    id: 'villager1',
    name: 'Elder Kunjan',
    lines: [
      "Welcome, traveler. This is Malabar, the land of the people.",
      "Long ago, King Maveli walked these very paths.",
      "In his time, no one went hungry, and no one was forgotten."
    ]
  },
  {
    id: 'villager2',
    name: 'Devi',
    lines: [
      "We are preparing the pookalam for Onam.",
      "Look around the village — flowers are blooming everywhere.",
      "Bring me five, and we can complete the first pattern together."
    ]
  },
  {
    id: 'villager3',
    name: 'Old Raman',
    lines: [
      "People still remember Maveli's kingdom for the happiness it brought.",
      "There was enough for everyone to live, to grow, and to celebrate.",
      "That, they say, is what prosperity truly looks like."
    ]
  }
];

export const KOCHI_INTRO = [
  { speaker: '', text: "The path leads to the backwaters of Kochi." },
  { speaker: 'Boatman', text: "Every Onam, we race our vallams down this canal in celebration." },
  { speaker: 'Boatman', text: "Steer well, traveler — the finish line awaits!" }
];

export const TRAVANCORE_NPCS = [
  {
    id: 'guard1',
    name: 'Palace Guard',
    lines: [
      "Few are permitted this far into the old palace.",
      "But you carry the memories of Malabar and Kochi with you.",
      "Perhaps you are meant to find what lies within."
    ]
  }
];

export const TRAVANCORE_CLUES = [
  {
    id: 'clue_equality',
    key: 'equality',
    title: 'A Weathered Inscription',
    text: "\"In Maveli's court, the farmer and the minister sat as equals.\" — the first pillar: EQUALITY."
  },
  {
    id: 'clue_prosperity',
    key: 'prosperity',
    title: 'A Faded Mural',
    text: "The mural shows overflowing granaries and full harvests — the second pillar: PROSPERITY."
  },
  {
    id: 'clue_happiness',
    key: 'happiness',
    title: 'A Carved Verse',
    text: "\"Where people share alike, joy follows naturally.\" — the third pillar: HAPPINESS."
  }
];

export const PALACE_HINT = "The kingdom stood on Equality, Prosperity and Happiness.";

export const MEMORY_1 = {
  title: 'MEMORY 1 — PROSPERITY',
  text: "The first memory returns: a kingdom where people had enough to live, to grow, and to celebrate together.",
  clue: 'PROSPERITY'
};

export const MEMORY_2 = {
  title: 'MEMORY 2 — EQUALITY',
  text: "The second memory returns: a kingdom remembered for dignity and fairness — not for status or power.",
  clue: 'EQUALITY, HAPPINESS'
};

export const MEMORY_3 = {
  title: 'MEMORY 3 — THE FINAL MEMORY',
  text: "The final memory returns. The three pillars were never just about a king — they were values his people carried forward."
};

export const MAVELI_ENDING_LINES = [
  { speaker: 'Maveli', text: "You have found what was lost, traveler." },
  { speaker: 'Maveli', text: "Equality. Prosperity. Happiness. Togetherness." },
  { speaker: 'Maveli', text: "I may visit my people once a year, but the values we built together live forever." },
  { speaker: '', text: "Onam is more than remembering a king's return. It is remembering the values people hope to share." }
];
