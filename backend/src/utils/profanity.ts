// ─── Custom banned words (English + Nigerian slang) ─────────────────────
export const bannedWords = [
  // English general profanity
  "ass", "asshole", "bastard", "bitch", "bollocks", "bullshit", "cunt", "damn",
  "dick", "dickhead", "fuck", "fucker", "fucking", "motherfucker", "piss",
  "prick", "pussy", "shit", "slut", "twat", "wanker", "whore", "nigga", "nigger",
  "idiot", "stupid", "fool", "moron", "imbecile", "retard", "scumbag",
  "douche", "douchebag", "jackass", "arse", "arsehole", "bugger", "git",
  "minger", "pillock", "plonker", "tosser", "wazzock",
  // Nigerian Pidgin / slang
  "ashewo", "agbero", "ode", "oloshi", "yeye", "mumu", "oponu", "werey",
  "alayee", "efulefu", "nzuzu", "onye ara", "aboki", "ngbeke", "akpali",
  "oshisco", "kolo", "mad man", "craze", "waka pass", "cway",
];

// Build regex with word boundaries (handles multi-word phrases)
export const profanityRegex = new RegExp(
  `\\b(${bannedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i"
);

export const containsProfanity = (text: string): boolean =>
  profanityRegex.test(text);