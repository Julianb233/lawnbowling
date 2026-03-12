// Gallery data for the lawn bowling art & imagery page

export type GalleryCategory =
  | "Action Shots"
  | "Greens & Venues"
  | "Equipment"
  | "Vintage & Heritage"
  | "Social & Community"
  | "Art & Illustrations";

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  credit: string;
  url: string;
  aspectRatio: "landscape" | "portrait" | "square";
}

export const galleryCategories: GalleryCategory[] = [
  "Action Shots",
  "Greens & Venues",
  "Equipment",
  "Vintage & Heritage",
  "Social & Community",
  "Art & Illustrations",
];

export const galleryImages: GalleryImage[] = [
  // ─── Action Shots ──────────────────────────────────────
  {
    id: "action-01",
    title: "The Perfect Delivery",
    description:
      "A bowler in full stride, releasing a bowl with textbook technique on a beautifully manicured green.",
    category: "Action Shots",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "action-02",
    title: "Measuring the Head",
    description:
      "Players carefully measure the distance between bowls and the jack to determine shot.",
    category: "Action Shots",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "action-03",
    title: "Drawing to the Jack",
    description:
      "The bowl curves gracefully along its bias, tracing an arc toward the target.",
    category: "Action Shots",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/2d5016/white?text=Drawing+to+the+Jack",
    aspectRatio: "landscape",
  },
  {
    id: "action-04",
    title: "The Skip Directs",
    description:
      "A skip signals instructions to their team from the far end of the rink.",
    category: "Action Shots",
    credit: "Community Photo",
    url: "https://placehold.co/800x1000/1B5E20/white?text=Skip+Directing+Play",
    aspectRatio: "portrait",
  },
  {
    id: "action-05",
    title: "Concentration",
    description:
      "Close-up of a bowler's focused expression before a critical delivery in a tournament final.",
    category: "Action Shots",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
    aspectRatio: "portrait",
  },
  {
    id: "action-06",
    title: "The Drive",
    description:
      "A powerful firing shot scatters the head, sending bowls in every direction.",
    category: "Action Shots",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/3a6b24/white?text=The+Drive+Shot",
    aspectRatio: "landscape",
  },

  // ─── Greens & Venues ──────────────────────────────────
  {
    id: "green-01",
    title: "Morning Dew on the Green",
    description:
      "Early morning sunlight catches dew drops on a pristine bowling green, creating a shimmering carpet of emerald.",
    category: "Greens & Venues",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1558635924-b60e7d89fbe4?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "green-02",
    title: "Clubhouse at Sunset",
    description:
      "A traditional lawn bowling clubhouse bathed in golden hour light, with the green stretching out in front.",
    category: "Greens & Venues",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "green-03",
    title: "Seaside Bowling Green",
    description:
      "A stunning coastal bowling green with ocean views, where the breeze adds an extra challenge to every delivery.",
    category: "Greens & Venues",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "green-04",
    title: "Perfectly Striped Green",
    description:
      "Alternating light and dark stripes on a meticulously maintained bowling green demonstrate the greenkeeper's art.",
    category: "Greens & Venues",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1589280011508-bb31a8f8e977?w=800&q=80",
    aspectRatio: "portrait",
  },
  {
    id: "green-05",
    title: "Indoor Bowling Arena",
    description:
      "A modern indoor bowling facility with perfect lighting and climate-controlled conditions for year-round play.",
    category: "Greens & Venues",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/1a4d1a/white?text=Indoor+Bowling+Arena",
    aspectRatio: "landscape",
  },
  {
    id: "green-06",
    title: "Mountain View Green",
    description:
      "A bowling green nestled in a valley with mountains rising in the background -- pure serenity.",
    category: "Greens & Venues",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    aspectRatio: "portrait",
  },

  // ─── Equipment ────────────────────────────────────────
  {
    id: "equip-01",
    title: "A Set of Championship Bowls",
    description:
      "Four matched bowls with distinctive grip patterns, ready for competitive play.",
    category: "Equipment",
    credit: "Community Photo",
    url: "https://placehold.co/800x800/2d5016/white?text=Championship+Bowls",
    aspectRatio: "square",
  },
  {
    id: "equip-02",
    title: "The Jack",
    description:
      "A small white target ball sits alone on the green, waiting for the first bowl to be delivered.",
    category: "Equipment",
    credit: "Community Photo",
    url: "https://placehold.co/800x800/1B5E20/white?text=The+Jack",
    aspectRatio: "square",
  },
  {
    id: "equip-03",
    title: "Measuring Equipment",
    description:
      "Callipers and tape measures used by umpires to determine closest bowl when the naked eye cannot decide.",
    category: "Equipment",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/3a6b24/white?text=Measuring+Equipment",
    aspectRatio: "landscape",
  },
  {
    id: "equip-04",
    title: "Bowling Shoes",
    description:
      "Flat-soled bowling shoes designed to protect the green while providing stability during delivery.",
    category: "Equipment",
    credit: "Community Photo",
    url: "https://placehold.co/800x1000/2d5016/white?text=Bowling+Shoes",
    aspectRatio: "portrait",
  },
  {
    id: "equip-05",
    title: "Bowl Grip Close-up",
    description:
      "Macro photography revealing the intricate dimple pattern that helps bowlers maintain control during delivery.",
    category: "Equipment",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    aspectRatio: "square",
  },
  {
    id: "equip-06",
    title: "Bowls Bag Collection",
    description:
      "A variety of bowls bags from classic leather to modern technical fabrics, each protecting precious equipment.",
    category: "Equipment",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/1a4d1a/white?text=Bowls+Bag+Collection",
    aspectRatio: "landscape",
  },

  // ─── Vintage & Heritage ───────────────────────────────
  {
    id: "vintage-01",
    title: "Victorian Era Bowlers",
    description:
      "A sepia-toned photograph from the 1890s showing bowlers in full formal attire on a village green.",
    category: "Vintage & Heritage",
    credit: "Historical Archive",
    url: "https://placehold.co/800x1000/3d2c1a/F5F0E0?text=Victorian+Bowlers+1890s",
    aspectRatio: "portrait",
  },
  {
    id: "vintage-02",
    title: "The Original Drake's Game",
    description:
      "An artistic interpretation of Sir Francis Drake finishing his game of bowls before engaging the Spanish Armada in 1588.",
    category: "Vintage & Heritage",
    credit: "Historical Illustration",
    url: "https://placehold.co/800x600/4a3520/F5F0E0?text=Drake's+Bowls+1588",
    aspectRatio: "landscape",
  },
  {
    id: "vintage-03",
    title: "Lignum Vitae Bowls",
    description:
      "Antique wooden bowls carved from lignum vitae, the dense tropical hardwood used for centuries before modern composites.",
    category: "Vintage & Heritage",
    credit: "Museum Collection",
    url: "https://placehold.co/800x800/5c4033/F5F0E0?text=Lignum+Vitae+Bowls",
    aspectRatio: "square",
  },
  {
    id: "vintage-04",
    title: "1920s Club Photograph",
    description:
      "Members of a bowling club pose for a group portrait, wearing pristine whites and straw boater hats.",
    category: "Vintage & Heritage",
    credit: "Historical Archive",
    url: "https://placehold.co/800x600/3d2c1a/F5F0E0?text=1920s+Club+Portrait",
    aspectRatio: "landscape",
  },
  {
    id: "vintage-05",
    title: "Commonwealth Games 1930",
    description:
      "Lawn bowls made its debut at the first British Empire Games in Hamilton, Ontario -- a historic moment for the sport.",
    category: "Vintage & Heritage",
    credit: "Historical Archive",
    url: "https://placehold.co/800x600/4a3520/F5F0E0?text=Commonwealth+Games+1930",
    aspectRatio: "landscape",
  },

  // ─── Social & Community ───────────────────────────────
  {
    id: "social-01",
    title: "After the Match",
    description:
      "Players from both teams share a drink and a laugh at the clubhouse bar after a friendly match.",
    category: "Social & Community",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "social-02",
    title: "Junior Coaching Session",
    description:
      "Young bowlers learn the basics from experienced coaches, keeping the sport alive for the next generation.",
    category: "Social & Community",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80",
    aspectRatio: "landscape",
  },
  {
    id: "social-03",
    title: "Barefoot Bowls Night",
    description:
      "A lively barefoot bowls evening event with string lights, music, and a crowd of first-time players.",
    category: "Social & Community",
    credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    aspectRatio: "portrait",
  },
  {
    id: "social-04",
    title: "Club Open Day",
    description:
      "Families and curious visitors try their hand at bowling during the club's annual open day celebration.",
    category: "Social & Community",
    credit: "Community Photo",
    url: "https://placehold.co/800x600/2d5016/white?text=Club+Open+Day",
    aspectRatio: "landscape",
  },
  {
    id: "social-05",
    title: "Tournament Trophy Ceremony",
    description:
      "The winning team celebrates with the trophy, surrounded by competitors and supporters applauding their achievement.",
    category: "Social & Community",
    credit: "Community Photo",
    url: "https://placehold.co/800x800/1B5E20/white?text=Trophy+Ceremony",
    aspectRatio: "square",
  },

  // ─── Art & Illustrations ──────────────────────────────
  {
    id: "art-01",
    title: "Watercolour Green",
    description:
      "A delicate watercolour painting of an English village bowling green, complete with thatched cottage backdrop.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x600/2E7D32/white?text=Watercolour+Green",
    aspectRatio: "landscape",
  },
  {
    id: "art-02",
    title: "Geometric Bowls",
    description:
      "A modern geometric art print depicting bowls and their bias paths as clean, colourful arcs.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x1000/1B5E20/white?text=Geometric+Bowls+Art",
    aspectRatio: "portrait",
  },
  {
    id: "art-03",
    title: "The Green Cathedral",
    description:
      "An oil painting that reimagines a bowling green as a grand cathedral of sport, with towering hedgerows as walls.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x600/3a6b24/white?text=The+Green+Cathedral",
    aspectRatio: "landscape",
  },
  {
    id: "art-04",
    title: "Pop Art Bowl",
    description:
      "A bold pop-art interpretation of a lawn bowl in vivid colours, inspired by Andy Warhol's screen printing style.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x800/c2185b/white?text=Pop+Art+Bowl",
    aspectRatio: "square",
  },
  {
    id: "art-05",
    title: "Blueprint of a Bowl",
    description:
      "A technical blueprint-style illustration showing the precise dimensions, bias, and running surface of a competition bowl.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x600/1a237e/white?text=Bowl+Blueprint",
    aspectRatio: "landscape",
  },
  {
    id: "art-06",
    title: "Minimalist Green",
    description:
      "A striking minimalist poster design -- a single white circle on a vast field of green representing the solitude of the jack.",
    category: "Art & Illustrations",
    credit: "Original Artwork",
    url: "https://placehold.co/800x1000/1B5E20/white?text=Minimalist+Green",
    aspectRatio: "portrait",
  },
];
