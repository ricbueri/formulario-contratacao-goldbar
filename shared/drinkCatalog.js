/** Nome → composição (cardápio 2026). */

export const OPEN_BAR_SEM_ALCOOL = "Open bar exclusivamente sem álcool";

export const DRINK_META = {
  [OPEN_BAR_SEM_ALCOOL]: {
    composition: "Apenas opções da lista sem álcool (soft bar).",
    alcoholic: false,
  },
  "À definir": { composition: "Combinar com a equipe Gold Bar depois.", alcoholic: false },

  "Sex on the Beach": { composition: "Vodka + suco de laranja + licor de pêssego + grenadine", alcoholic: true },
  "Lagoa Azul": { composition: "Vodka + soda + limão + curaçau blue", alcoholic: true },
  Mojito: { composition: "Rum + hortelã + limão + soda", alcoholic: true },
  "Piña Colada": { composition: "Rum + leite de coco + leite condensado + abacaxi", alcoholic: true },
  "Green Fresh": { composition: "Vodka + soda + limão + xarope de maçã verde", alcoholic: true },
  "Beijo na Boca": { composition: "Vodka + morango + leite condensado", alcoholic: true },
  Espanhola: { composition: "Vinho + leite condensado + abacaxi", alcoholic: true },
  Chambinho: { composition: "Vodka + morango + leite condensado + grenadine", alcoholic: true },
  "Ruby Red": { composition: "Saquê + suco de uva + morango + leite condensado", alcoholic: true },
  Coconut: { composition: "Rum + leite de coco + leite condensado + pêssego", alcoholic: true },
  "Gin Tônica": { composition: "Gin + limão + água tônica", alcoholic: true },

  "Toxic Lemon": { composition: "Tequila + soda + limão", alcoholic: true },
  Orgasmo: { composition: "Vodka + leite condensado + abacaxi + chocolate em pó", alcoholic: true },
  "Pink Tonic": { composition: "Gin + xarope de morango + água tônica", alcoholic: true },
  "Tangerine Tonic": { composition: "Gin + xarope de tangerina + água tônica", alcoholic: true },
  "Lagoa Vermelha": { composition: "Vodka + soda + limão + xarope de morango", alcoholic: true },
  "Laranja Tropical": { composition: "Vodka + laranja + abacaxi + leite condensado", alcoholic: true },
  "Tropical Sun": { composition: "Saquê + maracujá + água com gás + hortelã", alcoholic: true },
  Acapulco: { composition: "Rum + tequila + abacaxi + laranja", alcoholic: true },
  "Maçã do Amor": { composition: "Vodka + suco de maçã + leite condensado + maçã verde", alcoholic: true },
  Kamikaze: { composition: "Saquê + abacaxi + gengibre + groselha", alcoholic: true },
  "Tangerina Fresh": { composition: "Vodka + soda + limão + tangerina", alcoholic: true },
  Bomberinho: { composition: "Cachaça + groselha + limão", alcoholic: true },
  "Tequila Caliente": { composition: "Tequila + soda + limão + cassis", alcoholic: true },

  Negroni: { composition: "Gin + Campari + vermute", alcoholic: true },
  "Aperol Spritz": { composition: "Aperol + espumante + soda + laranja", alcoholic: true },
  Fitzgerald: { composition: "Gin + limão siciliano + xarope simples + angostura", alcoholic: true },
  "Moscow Mule": { composition: "Vodka + limão + soda + espuma de gengibre", alcoholic: true },
  Maracujack: { composition: "Jack Daniel's + maracujá + refrigerante citrus", alcoholic: true },
  Margarita: { composition: "Tequila + licor de laranja + limão", alcoholic: true },
  "Expresso Martini": { composition: "Vodka + licor de café + café expresso", alcoholic: true },
  Manhattan: { composition: "Whisky + vermute + angostura + laranja", alcoholic: true },
  "Drink Gold": { composition: "Gin + soda + xarope de morango + espuma surpresa", alcoholic: true },

  "Sunset Tonic": { composition: "Gin + tônica + xarope de tangerina + manjericão", alcoholic: true },
  "Berry & Rose": { composition: "Gin + tônica + frutas vermelhas + pétalas de rosa", alcoholic: true },
  "Tropical Cinnamon": { composition: "Gin + tônica + manga/maracujá + canela", alcoholic: true },
  "Botanical Garden": { composition: "Gin + tônica + pepino + zimbro", alcoholic: true },
  "Tropical Gold": { composition: "Gin + energético tropical + manga", alcoholic: true },
  "Spicy Peach": { composition: "Gin + tônica + pêssego + pimenta rosa", alcoholic: true },
  "Pure Strawberry": { composition: "Gin + tônica + morango + limão", alcoholic: true },
  "Green Apple Gin": { composition: "Gin + tônica + xarope de maçã verde", alcoholic: true },
  "Espresso Gin": { composition: "Gin + tônica + café expresso", alcoholic: true },
  Mediterranean: { composition: "Gin + tônica + alecrim + limão siciliano", alcoholic: true },
  "Watermelon Fizz": { composition: "Gin + xarope de melancia + hortelã + soda", alcoholic: true },
  "Ginger Gin": { composition: "Gin + tônica + toque de gengibre Gold Bar", alcoholic: true },

  "Moscow Mule (Mule Bar)": { composition: "Vodka + limão + xarope de gengibre + espuma de gengibre", alcoholic: true },
  "Brazilian Mule": { composition: "Cachaça + limão + gengibre + espuma", alcoholic: true },
  "London Mule": { composition: "Gin + limão + gengibre + espuma", alcoholic: true },
  "Kentucky Mule": { composition: "Bourbon + limão + gengibre + espuma", alcoholic: true },
  "Golden Mule": { composition: "Vodka + maracujá + limão + espuma de gengibre", alcoholic: true },
  "Berry Mule": { composition: "Vodka + frutas vermelhas + soda + espuma cítrica", alcoholic: true },
  "Tropical Mule": { composition: "Vodka + abacaxi + hortelã + soda + gengibre", alcoholic: true },
  "Sunset Mule": { composition: "Vodka + xarope de laranja + soda + espuma cítrica", alcoholic: true },

  "Caipirinha de Caldo de Cana (Garapa)": {
    composition: "Limão-taiti + cachaça, vodka ou saquê + garapa",
    alcoholic: true,
  },
  Caipinvinho: { composition: "Limão-taiti + vinho tinto suave", alcoholic: true },
  "Caipirinha de Morango com Pimenta Rosa": { composition: "Morango + pimenta rosa + saquê ou vodka", alcoholic: true },
  "Caipirinha de Uva": { composition: "Uva + açúcar + cachaça", alcoholic: true },
  "Caipirinha de Jambu": { composition: "Limão siciliano + cachaça de jambu", alcoholic: true },
  "Caipirinha de Maracujá com Manjericão": { composition: "Maracujá + manjericão + cachaça ou vodka", alcoholic: true },
  "Caipirinha de Café com Laranja": { composition: "Laranja + café + cachaça", alcoholic: true },
  "Caipirinha de Frutas Amarelas": { composition: "Manga + maracujá + cachaça", alcoholic: true },
  "Caipirinhas — cachaça": { composition: "Limão + cachaça (clássica)", alcoholic: true },
  "Caipirinhas — vodka": { composition: "Limão + vodka", alcoholic: true },
  "Caipirinhas — saquê": { composition: "Limão + saquê", alcoholic: true },

  "Sunset Hibiscus Ginger": { composition: "Chá de hibisco + gengibre + limão siciliano + tônica", alcoholic: false },
  "Berry Fresh": { composition: "Tônica + limão siciliano + xarope de amora", alcoholic: false },
  "Basil Gold Lemonade": { composition: "Água com gás + limão + manjericão", alcoholic: false },
  "Tropical Punch": { composition: "Abacaxi + canela + água de coco", alcoholic: false },
  "Golden Garden": { composition: "Soda + limão siciliano + manjericão + maçã verde", alcoholic: false },
  "Peach Gold": { composition: "Suco de pêssego + chá preto + alecrim", alcoholic: false },
  "Tropical Gold (soft)": { composition: "Abacaxi + hortelã + xarope de coco", alcoholic: false },
  "Strawberry Rose": { composition: "Morango + limão siciliano + xarope de rosas + soda", alcoholic: false },
  "Deep Purple Fusion": { composition: "Suco de uva integral + gengibre + água com gás", alcoholic: false },
  "Apple Green Spritz": { composition: "Soda + maçã verde + rodelas de maçã + hortelã", alcoholic: false },

  "Gin Coffee Tonic": { composition: "Gin + café + água tônica", alcoholic: true },
  "Saque Coffee Tropical": { composition: "Saquê + café + xarope de coco", alcoholic: true },
  "Licoroso & Cremoso": { composition: "Vodka + licor de café + creme de leite", alcoholic: true },
  'White Russian "Gold Edition"': { composition: "Vodka + café + licor de chocolate branco", alcoholic: true },
  "Caramel Macchiato": { composition: "Vodka + café + caramelo salgado + creme de leite", alcoholic: true },

  "Águas saborizadas — Citros & Ervas": { composition: "Dispenser — citros e ervas", alcoholic: false },
  "Águas saborizadas — Frutas Vermelhas & Especiarias": {
    composition: "Dispenser — frutas vermelhas e especiarias",
    alcoholic: false,
  },
  "Coronita (210ml)": { composition: "Cerveja premium light 210 ml", alcoholic: true },
  "Michelob Ultra": { composition: "Cerveja premium light long neck", alcoholic: true },
  "Stella Artois Long Neck": { composition: "Cerveja premium long neck", alcoholic: true },
  "Welcome Spritz — Aperol Spritz": { composition: "Aperol + espumante + soda", alcoholic: true },
  "Welcome Spritz — Clericot de Frutas": { composition: "Vinho branco + frutas + soda", alcoholic: true },

  'Don Luiz "Churros"': { composition: "Doce de leite + Don Luiz + chantilly + canela e açúcar", alcoholic: true },
  "Velvet Gold": { composition: "Licor 43 + geleia de morango + creme + limão siciliano", alcoholic: true },
  "Shot Paçoquinha": { composition: "Don Luiz + pasta de amendoim + paçoca", alcoholic: true },
  "Mini Beer Black": { composition: "Café + mel + Licor 43 + chantilly + cacau", alcoholic: true },
  "Bombom de Avelã": { composition: "Nutella + Don Luiz + creme de leite + avelã", alcoholic: true },
  "Nuvem de Coco": { composition: "Licor 43 + coco + creme + coco ralado", alcoholic: true },
  "Velvet Expresso (shot)": { composition: "Café + licor de chocolate branco + rum", alcoholic: true },
};

export function getDrinkMeta(name) {
  const key = String(name || "").trim();
  return DRINK_META[key] || { composition: "", alcoholic: true };
}

export function itemFromName(name) {
  const meta = getDrinkMeta(name);
  return { name, composition: meta.composition, alcoholic: meta.alcoholic };
}

export const BASE_SPIRIT_OPTIONS = ["Vodka", "Cachaça", "Saquê", "Gin", "Rum", "Tequila"];

/** Valor gravado em base e tipo quando o cliente escolhe o botão de bar sem álcool. */
export const BAR_SEM_ALCOOL = "Bar sem álcool";
