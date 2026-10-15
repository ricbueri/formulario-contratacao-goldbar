/** Espelha o cardápio 2026 (templates/cardapio_anexo.pdf). Atualize aqui se o PDF mudar. */

export const A_DEFINIR = "À definir";

export const OPEN_BAR_CATEGORIES = [
  {
    id: "silver-1",
    label: "Silver Package (clássicos)",
    items: [
      "Sex on the Beach",
      "Lagoa Azul",
      "Mojito",
      "Piña Colada",
      "Green Fresh",
      "Beijo na Boca",
      "Espanhola",
      "Chambinho",
      "Ruby Red",
      "Coconut",
      "Gin Tônica",
    ],
  },
  {
    id: "silver-2",
    label: "Silver Package (autorais)",
    items: [
      "Toxic Lemon",
      "Orgasmo",
      "Pink Tonic",
      "Tangerine Tonic",
      "Lagoa Vermelha",
      "Laranja Tropical",
      "Tropical Sun",
      "Acapulco",
      "Maçã do Amor",
      "Kamikaze",
      "Tangerina Fresh",
      "Bomberinho",
      "Tequila Caliente",
    ],
  },
  {
    id: "gold",
    label: "Gold Signature Cocktails",
    items: [
      "Negroni",
      "Aperol Spritz",
      "Fitzgerald",
      "Moscow Mule",
      "Maracujack",
      "Margarita",
      "Expresso Martini",
      "Manhattan",
      "Drink Gold",
    ],
  },
  {
    id: "gin",
    label: "The Gin Collection",
    items: [
      "Sunset Tonic",
      "Berry & Rose",
      "Tropical Cinnamon",
      "Botanical Garden",
      "Tropical Gold",
      "Spicy Peach",
      "Pure Strawberry",
      "Green Apple Gin",
      "Espresso Gin",
      "Mediterranean",
      "Watermelon Fizz",
      "Ginger Gin",
    ],
  },
  {
    id: "mule",
    label: "Gold Mule Bar",
    items: [
      "Moscow Mule (Mule Bar)",
      "Brazilian Mule",
      "London Mule",
      "Kentucky Mule",
      "Golden Mule",
      "Berry Mule",
      "Tropical Mule",
      "Sunset Mule",
    ],
  },
  {
    id: "caipirinha",
    label: "Caipirinha Specials",
    items: [
      "Caipirinha de Caldo de Cana (Garapa)",
      "Caipinvinho",
      "Caipirinha de Morango com Pimenta Rosa",
      "Caipirinha de Uva",
      "Caipirinha de Jambu",
      "Caipirinha de Maracujá com Manjericão",
      "Caipirinha de Café com Laranja",
      "Caipirinha de Frutas Amarelas",
      "Caipirinhas — cachaça",
      "Caipirinhas — vodka",
      "Caipirinhas — saquê",
    ],
  },
  {
    id: "soft",
    label: "Soft Selections (sem álcool)",
    items: [
      "Sunset Hibiscus Ginger",
      "Berry Fresh",
      "Basil Gold Lemonade",
      "Tropical Punch",
      "Golden Garden",
      "Peach Gold",
      "Tropical Gold (soft)",
      "Strawberry Rose",
      "Deep Purple Fusion",
      "Apple Green Spritz",
    ],
  },
  {
    id: "coffee",
    label: "Coffee Bar / Espresso Collection",
    items: [
      "Gin Coffee Tonic",
      "Saque Coffee Tropical",
      "Licoroso & Cremoso",
      'White Russian "Gold Edition"',
      "Caramel Macchiato",
    ],
  },
];

export const WELCOME_DRINK_OPTIONS = [
  "Águas saborizadas — Citros & Ervas",
  "Águas saborizadas — Frutas Vermelhas & Especiarias",
  "Coronita (210ml)",
  "Michelob Ultra",
  "Stella Artois Long Neck",
  "Welcome Spritz — Aperol Spritz",
  "Welcome Spritz — Clericot de Frutas",
];

export const SHOT_OPTIONS = [
  'Don Luiz "Churros"',
  "Velvet Gold",
  "Shot Paçoquinha",
  "Mini Beer Black",
  "Bombom de Avelã",
  "Nuvem de Coco",
  "Velvet Expresso (shot)",
];

export function joinDrinkLine(items) {
  return (items || [])
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" - ");
}
