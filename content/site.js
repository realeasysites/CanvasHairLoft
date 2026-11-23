/*
 * ATELIER TEMPLATE — content for this client.
 * Everything client-specific lives here (plus photos in public/img/photos and the logo).
 * To reuse Atelier for another salon, beauty studio or bakery: copy the repo,
 * edit this file, swap the photos/logo, and set the env vars in README.md.
 * Any list left empty ([]) hides its section.
 */
module.exports = {
  name: 'Canvas Hair Loft',
  shortName: 'Canvas',
  schemaType: 'HairSalon', // HairSalon | BeautySalon | NailSalon | Bakery | DaySpa
  siteUrl: process.env.SITE_URL || 'https://www.canvashairloft.com',
  logo: '/img/logo.png',
  logoAlt: 'Canvas Hair Loft',

  // Theme. Swap these for the next client; everything in the CSS reads from them.
  theme: {
    wall: '#FBFAF8',   // page background (gallery white)
    stroke: '#FCE3CE', // brushstroke color, from the logo
    ink: '#2D2420',    // text
    accent: '#8E4E2A', // buttons + links (their cognac chairs)
    linen: '#EFE7DF',  // quiet panels
    muted: '#76665E',  // secondary text
  },

  seo: {
    title: 'Canvas Hair Loft | Balayage, Color & Extensions in Scarborough, ME',
    description: 'Boutique hair loft in Scarborough, Maine for natural balayage, dimensional color, blended blondes and brunettes, extensions and haircuts. Request a consultation online.',
  },

  hero: {
    script: 'Let your hair be our Canvas',
    intro: 'A boutique hair loft in Scarborough for natural balayage, dimensional color, blended blondes and brunettes, extensions and haircuts. Settle in, let your hair down, and we’ll do the rest.',
    primary: 'Request a consultation',
    secondary: 'See the work',
    // Three photos hung like art, each with a small placard.
    frames: [
      { img: 'hero-1.jpg', title: 'Soft-rooted blonde', note: 'Balayage' },
      { img: 'hero-2.jpg', title: 'Ribboned honey', note: 'Dimensional color' },
      { img: 'hero-3.jpg', title: 'Golden bronde', note: 'Blended brunette' },
    ],
  },

  // "The palette": services as paint chips. Swatch hexes were sampled from the photos.
  paletteTitle: 'The palette',
  paletteIntro: 'Everything we do starts with color and shape. Tap a swatch to see it on real clients.',
  palette: [
    { name: 'Natural balayage', swatch: '#A8906F', img: 'balayage.jpg', text: 'Hand-painted, soft-rooted color that grows out gracefully, so you can go longer between visits.' },
    { name: 'Dimensional color', swatch: '#856A50', img: 'dimensional.jpg', text: 'Layered tones that add depth and movement, so your color looks rich in every light.' },
    { name: 'Blended blondes', swatch: '#D0B28D', img: 'blondes.jpg', text: 'Bright, buttery blonde blended at the root for a lived-in finish instead of a harsh line.' },
    { name: 'Rich brunettes', swatch: '#473A32', img: 'brunettes.jpg', text: 'Glossy, deep brunettes with soft ribbons of light where you want them.' },
    { name: 'Extensions', swatch: '#7A4A34', img: 'extensions.jpg', text: 'Added length and fullness, including hand-tied wefts, matched to your color and texture. Every set starts with a consultation.' },
    { name: 'Haircuts', swatch: '#E2CBA6', img: 'cuts.jpg', text: 'Long layers, shape-ups and pixies, cut for the way you actually wear your hair.' },
  ],

  // Optional priced menu. Leave empty to hide (Canvas quotes at consultation).
  menu: [],
  menuNote: '',

  // The exhibit (gallery wall).
  workTitle: 'The work',
  work: [
    { img: 'work-1.jpg', title: 'Mushroom bronde' },
    { img: 'hero-2.jpg', title: 'Ribboned honey' },
    { img: 'work-2.jpg', title: 'Face-framing glow' },
    { img: 'brunettes.jpg', title: 'Espresso waves' },
    { img: 'work-3.jpg', title: 'Sun-warmed blonde' },
    { img: 'dimensional.jpg', title: 'Lived-in dimension' },
    { img: 'blondes.jpg', title: 'Buttercream blonde' },
    { img: 'extensions.jpg', title: 'Copper length' },
  ],

  space: {
    title: 'The loft',
    img: 'loft.jpg',
    text: 'An upscale, boutique space with white brick, warm light and room to breathe. Come as you are, let your hair down, and give yourself the afternoon.',
    details: [
      'In the Dunstan Crossing development, just off Route 1',
      'Private off-street parking right outside',
      'Appointments only, so the loft never feels crowded',
    ],
  },

  // Artists. Leave bookUrl empty to send people to the request form with the artist preselected.
  artistsTitle: 'The artists',
  artistsIntro: 'Each artist books her own chair. Choose someone you love, or let us match you.',
  artists: [
    { name: 'Nicky', role: 'Owner & stylist', instagram: 'nickycouch_', focus: 'Extensions, including hand-tied sets up to 20 inches', bookUrl: '' },
    { name: 'Amanda Bourque', role: 'Stylist', instagram: '', focus: 'Bright blondes, long layered haircuts and pixies', bookUrl: '' },
  ],

  request: {
    title: 'Request a visit',
    intro: 'Tell us what you’re dreaming of and add a photo or two. Your artist will reach out to confirm a time and price.',
    kinds: ['New client consultation', 'Color or cut appointment', 'Extensions consultation', 'Event or bridal hair'],
    photoLabel: 'Inspiration photos',
    photoHint: 'Up to 3 photos: a look you love, and one of your hair today if you can.',
    timingLabel: 'Days and times that work for you',
    detailsLabel: 'Anything we should know?',
    detailsPlaceholder: 'Last color service, how often you style it, the look you want to walk out with…',
    success: 'Request sent. Your artist will reach out soon to confirm a time.',
  },

  visit: {
    street: '4 Stewart Drive, Unit 1',
    city: 'Scarborough',
    region: 'ME',
    zip: '04074',
    note: 'Dunstan Crossing, off Route 1. Private parking out front.',
    phone: '', // none listed: no call button is shown when empty
    email: 'nicky@canvashairloft.com',
    hours: [], // e.g. [['Tuesday','9–7'], ...]; empty shows "By appointment"
    mapQuery: '4 Stewart Drive Unit 1, Scarborough, ME 04074',
  },

  social: {
    instagram: 'https://www.instagram.com/canvashairloft',
    facebook: 'https://www.facebook.com/profile.php?id=100064132389309',
    facebookPage: 'profile.php?id=100064132389309', // powers the live feed
  },

  policies: [], // add [{ title, text }] once the salon confirms its policy

  credit: { text: 'Website by Real Easy Sites', url: 'https://getrealeasysites.com' },
};
