/*
   База вкусов — единый источник данных (читают app.js и download-images.ps1).
   Каждая запись на одной строке (так её парсит PowerShell-загрузчик).

   Поля:
     n — полное название (для поиска в магазине / Google)
     l — линейка (группировка и фильтр)
     t — вкус / описание
     r — редкость: 1 обычный · 2 необычный · 3 редкий · 4 очень редкий · 5 легендарный
     g — регион/рынок
     c — цвет банки (hex, для плейсхолдера без фото)
     s — статус: "" текущий · disc снят · lim лимитка · new новинка · reg региональный · alc алкоголь

   Бренд: США, Corona (Калифорния), Hansen Natural Co. (ныне Monster Beverage
   Corporation), первый выпуск 18 апреля 2002 г.
*/
window.MONSTER_DATA = [
/* ---- Monster Energy (оригинал / классика) ---- */
{n:"Monster Energy Original",l:"Original",t:"классический энергетик, цитрус-травяной",r:1,g:"Глобально",c:"#a5cd39",s:""},
{n:"Monster Energy Lo-Carb",l:"Original",t:"меньше сахара, тот же вкус (синяя банка)",r:2,g:"США",c:"#2b6cb0",s:""},
{n:"Monster Energy Zero Sugar",l:"Original",t:"оригинальный вкус, без сахара",r:1,g:"Глобально",c:"#0f0f0f",s:""},
{n:"Monster Energy Absolutely Zero",l:"Original",t:"без сахара, оригинал (синяя)",r:2,g:"Глобально",c:"#1a4f8b",s:""},
{n:"Monster Energy Assault",l:"Original",t:"кола со специями, камуфляжная банка",r:3,g:"США",c:"#6b7042",s:"disc"},
{n:"Monster Energy Mule Ginger Brew",l:"Original",t:"имбирный эль, без сахара",r:2,g:"США",c:"#d9b310",s:""},
{n:"Monster Energy Import",l:"Original",t:"премиум, мягкая газация, банка 550мл с крышкой",r:4,g:"США",c:"#c0a062",s:"disc"},
{n:"Monster Energy Import Light",l:"Original",t:"облегчённая версия Import",r:4,g:"США",c:"#c9c9c9",s:"disc"},
{n:"Monster Energy M3 Super Concentrate",l:"Original",t:"супер-концентрат, мини-банка",r:4,g:"США",c:"#d4af37",s:"disc"},
{n:"Monster Energy Cuba Lima",l:"Original",t:"кола-лайм",r:3,g:"Европа",c:"#b5651d",s:"disc"},
{n:"Monster Energy Cuba Libre",l:"Original",t:"кола-лайм (стиль куба-либре)",r:3,g:"Европа",c:"#8b4513",s:"disc"},
{n:"Monster Energy Unleaded",l:"Original",t:"без кофеина",r:5,g:"США",c:"#cccccc",s:"disc"},
{n:"Monster Energy Ubermonster",l:"Original",t:"премиум-брю, насыщенный",r:5,g:"США",c:"#5a3e2b",s:"disc"},
{n:"Monster Energy BFC",l:"Original",t:"гигантская банка (~950мл), оригинал",r:4,g:"США",c:"#a5cd39",s:"disc"},
{n:"Monster Energy Strawberry Shot",l:"Original",t:"оригинал + «шот» клубники, с сахаром",r:1,g:"США",c:"#e63950",s:"new"},
{n:"Monster Energy Strawberry Shot Zero Sugar",l:"Original",t:"оригинал + «шот» клубники, без сахара",r:1,g:"США",c:"#c0223a",s:"new"},
{n:"Monster Energy Electric Blue",l:"Original",t:"голубая малина, с сахаром",r:2,g:"США",c:"#1e90ff",s:"new"},

/* ---- Nitro (с азотом) ---- */
{n:"Monster Energy Nitro Super Dry",l:"Nitro",t:"насыщен азотом, сухой цитрус",r:2,g:"Глобально",c:"#c0c0c0",s:""},
{n:"Monster Energy Nitro Cosmic Peach",l:"Nitro",t:"азот, персик",r:2,g:"США",c:"#ffb347",s:""},

/* ---- Dub Edition ---- */
{n:"Monster Energy Dub Edition Mad Dog",l:"Dub Edition",t:"виноград",r:4,g:"США",c:"#6b3fa0",s:"disc"},
{n:"Monster Energy Dub Edition Baller's Blend",l:"Dub Edition",t:"мультифруктовый пунш",r:4,g:"США",c:"#c08a2e",s:"disc"},

/* ---- Ultra (zero sugar) ---- */
{n:"Monster Energy Zero Ultra",l:"Ultra",t:"лёгкий цитрус, без сахара (Белый Монстр)",r:1,g:"Глобально",c:"#f2f2f2",s:""},
{n:"Monster Energy Ultra Sunrise",l:"Ultra",t:"апельсин",r:1,g:"Глобально",c:"#f6a623",s:""},
{n:"Monster Energy Ultra Blue",l:"Ultra",t:"голубая малина",r:1,g:"Глобально",c:"#2e86de",s:""},
{n:"Monster Energy Ultra Red",l:"Ultra",t:"ягодный микс",r:2,g:"Глобально",c:"#e74c3c",s:""},
{n:"Monster Energy Ultra Violet",l:"Ultra",t:"виноград",r:1,g:"Глобально",c:"#8e44ad",s:""},
{n:"Monster Energy Ultra Black",l:"Ultra",t:"чёрная вишня",r:2,g:"США",c:"#1c1c1c",s:""},
{n:"Monster Energy Ultra Paradise",l:"Ultra",t:"яблоко-киви",r:1,g:"Глобально",c:"#2ecc71",s:""},
{n:"Monster Energy Ultra Fiesta Mango",l:"Ultra",t:"манго",r:1,g:"Глобально",c:"#f39c12",s:""},
{n:"Monster Energy Ultra Watermelon",l:"Ultra",t:"арбуз",r:1,g:"Глобально",c:"#ff6b81",s:""},
{n:"Monster Energy Ultra Rosá",l:"Ultra",t:"розовый грейпфрут / ягоды",r:2,g:"Глобально",c:"#ff7eb9",s:""},
{n:"Monster Energy Ultra Gold",l:"Ultra",t:"ананас",r:2,g:"США",c:"#e1b12c",s:""},
{n:"Monster Energy Ultra Peachy Keen",l:"Ultra",t:"персик",r:3,g:"США",c:"#ffcc99",s:"lim"},
{n:"Monster Energy Ultra Fantasy Ruby Red",l:"Ultra",t:"грейпфрут",r:2,g:"Глобально",c:"#c0392b",s:""},
{n:"Monster Energy Ultra Strawberry Dreams",l:"Ultra",t:"клубника",r:2,g:"Глобально",c:"#ff9aa2",s:""},
{n:"Monster Energy Ultra Vice Guava",l:"Ultra",t:"гуава",r:2,g:"Глобально",c:"#ff77aa",s:""},
{n:"Monster Energy Ultra Blue Hawaiian",l:"Ultra",t:"ананас-кокос",r:2,g:"США",c:"#20b2c8",s:""},
{n:"Monster Energy Ultra Wild Passion",l:"Ultra",t:"маракуйя",r:2,g:"США",c:"#ff5e8a",s:"new"},
{n:"Monster Energy Ultra Punk Punch",l:"Ultra",t:"фруктовый пунш (Circle K)",r:3,g:"США",c:"#e91e8c",s:"new"},
{n:"Monster Energy Ultra Red, White & Blue Razz",l:"Ultra",t:"ракета-поп (ягодный микс)",r:3,g:"США",c:"#d72631",s:"lim"},
{n:"Monster Energy Ultra Citron",l:"Ultra",t:"лимон",r:3,g:"Япония",c:"#e3e84a",s:"reg"},

/* ---- Juice Monster (энергетик + сок) ---- */
{n:"Juice Monster Mango Loco",l:"Juice",t:"манго и экзотические фрукты",r:1,g:"Глобально",c:"#f5a623",s:""},
{n:"Juice Monster Pipeline Punch",l:"Juice",t:"маракуйя, апельсин, гуава",r:1,g:"Глобально",c:"#ff5da2",s:""},
{n:"Juice Monster Pacific Punch",l:"Juice",t:"вишнёвый фруктовый пунш",r:2,g:"США",c:"#d6336c",s:""},
{n:"Juice Monster Khaotic",l:"Juice",t:"энергетик + сок, цитрус-тропик",r:2,g:"Глобально",c:"#f2a900",s:""},
{n:"Juice Monster Khaos",l:"Juice",t:"50% сока, тропик (предшественник Khaotic)",r:3,g:"США",c:"#f0b000",s:"disc"},
{n:"Juice Monster M-80",l:"Juice",t:"80% сока, ананас-цитрус",r:3,g:"США",c:"#e03a3e",s:"disc"},
{n:"Juice Monster Ripper",l:"Juice",t:"тропик (жёлтая банка)",r:2,g:"Австралия",c:"#f7d51d",s:""},
{n:"Juice Monster Aussie Style Lemonade",l:"Juice",t:"облачный лимонад",r:2,g:"Глобально",c:"#cfe2a0",s:""},
{n:"Juice Monster Monarch",l:"Juice",t:"персик-нектарин (бабочка)",r:2,g:"США",c:"#ff9f1c",s:""},
{n:"Juice Monster Papillon",l:"Juice",t:"персик-нектарин (EU-версия Monarch)",r:3,g:"Европа",c:"#ffb3c1",s:"reg"},
{n:"Juice Monster Bad Apple",l:"Juice",t:"красное яблоко",r:3,g:"США",c:"#c0392b",s:""},
{n:"Juice Monster Rio Punch",l:"Juice",t:"папайя, ваниль, чёрная смородина",r:3,g:"Европа",c:"#ff7f50",s:"reg"},
{n:"Juice Monster Viking Berry",l:"Juice",t:"северные ягоды",r:3,g:"Европа",c:"#4a6fa5",s:"reg"},
{n:"Monster Energy Mixxd Punch",l:"Juice",t:"фруктовый пунш с вишней",r:3,g:"США",c:"#8e44ad",s:"disc"},
{n:"Juice Monster Voodoo Grape",l:"Juice",t:"виноград (в стиле вуду Нового Орлеана), с сахаром",r:2,g:"США",c:"#6b3fa0",s:"new"},
{n:"Juice Monster Strawberry Lemonade",l:"Juice",t:"клубничный лимонад с соком (лимитка к 250-летию США)",r:3,g:"США",c:"#ff5e7a",s:"new"},

/* ---- Java Monster (кофе) ---- */
{n:"Java Monster Mean Bean",l:"Java",t:"кофе + ваниль",r:1,g:"США",c:"#6f4e37",s:""},
{n:"Java Monster Loca Moca",l:"Java",t:"кофе + мокко",r:1,g:"США",c:"#5b3a29",s:""},
{n:"Java Monster Irish Blend",l:"Java",t:"кофе + ирландский крем",r:2,g:"США",c:"#b5a642",s:""},
{n:"Java Monster Salted Caramel",l:"Java",t:"солёная карамель",r:2,g:"США",c:"#c68642",s:""},
{n:"Java Monster Vanilla Light",l:"Java",t:"ваниль, облегчённый",r:2,g:"США",c:"#e8d9b5",s:""},
{n:"Java Monster Kona Blend",l:"Java",t:"кофе Kona",r:3,g:"США",c:"#4b3621",s:""},
{n:"Java Monster Kona Cappuccino",l:"Java",t:"капучино",r:3,g:"США",c:"#8c6a4f",s:"disc"},
{n:"Java Monster Big Black",l:"Java",t:"крепкий чёрный кофе",r:3,g:"США",c:"#1c1c1c",s:"disc"},
{n:"Java Monster Lo-Ball",l:"Java",t:"кофе без сахара",r:3,g:"США",c:"#444444",s:"disc"},
{n:"Java Monster Nut-Up",l:"Java",t:"кофе с орехом",r:3,g:"США",c:"#a0522d",s:"disc"},
{n:"Java Monster Chai Hai",l:"Java",t:"чай-латте масала",r:4,g:"США",c:"#cd853f",s:"disc"},
{n:"Java Monster Russian",l:"Java",t:"кофейный, в стиле ликёра",r:4,g:"США",c:"#5b3a29",s:"disc"},
{n:"Java Monster Toffee",l:"Java",t:"ирис/тоффи",r:4,g:"США",c:"#b8860b",s:"disc"},
{n:"Java Monster Farmer's Oats",l:"Java",t:"овсяное латте",r:3,g:"США",c:"#d2b48c",s:""},
{n:"Java Monster Cold Brew Sweet Black",l:"Java",t:"колд-брю, чёрный сладкий",r:3,g:"США",c:"#2b2b2b",s:""},
{n:"Java Monster Cold Brew Latte",l:"Java",t:"колд-брю латте",r:3,g:"США",c:"#a98467",s:""},
{n:"Java Monster 300 Triple Shot French Vanilla",l:"Java",t:"французская ваниль, 300мг кофеина",r:2,g:"США",c:"#e8d9b5",s:""},
{n:"Java Monster 300 Triple Shot Mocha",l:"Java",t:"мокко, 300мг кофеина",r:2,g:"США",c:"#5b3a29",s:""},

/* ---- Killer Brew (новый кофе, Triple Shot 300мг) ---- */
{n:"Java Monster Killer Brew Mean Bean",l:"Killer Brew",t:"кофе + ваниль, Triple Shot 300мг",r:2,g:"США",c:"#6f4e37",s:"new"},
{n:"Java Monster Killer Brew Loca Moca",l:"Killer Brew",t:"мокко, Triple Shot 300мг",r:2,g:"США",c:"#5b3a29",s:"new"},

/* ---- Espresso / Caffè Monster ---- */
{n:"Espresso Monster Espresso and Cream",l:"Espresso / Caffè",t:"эспрессо со сливками",r:3,g:"США",c:"#c9a66b",s:"disc"},
{n:"Espresso Monster Vanilla Espresso",l:"Espresso / Caffè",t:"ванильный эспрессо",r:3,g:"США",c:"#e0c9a6",s:"disc"},
{n:"Espresso Monster Salted Caramel Espresso",l:"Espresso / Caffè",t:"солёная карамель эспрессо",r:3,g:"Европа",c:"#c68642",s:"reg"},
{n:"Caffè Monster Mocha",l:"Espresso / Caffè",t:"кофейное латте, мокко",r:3,g:"США",c:"#6f4e37",s:"disc"},
{n:"Caffè Monster Salted Caramel",l:"Espresso / Caffè",t:"латте с солёной карамелью",r:3,g:"США",c:"#c68642",s:"disc"},
{n:"Caffè Monster Vanilla",l:"Espresso / Caffè",t:"ванильное латте",r:3,g:"США",c:"#e8d9b5",s:"disc"},
{n:"Java Monster Café Latte",l:"Java",t:"кофейное латте",r:2,g:"США",c:"#a9794f",s:""},

/* ---- Muscle Monster (протеиновый шейк) ---- */
{n:"Muscle Monster Vanilla",l:"Muscle",t:"протеиновый шейк, ваниль",r:3,g:"США",c:"#efe2c0",s:"disc"},
{n:"Muscle Monster Chocolate",l:"Muscle",t:"протеиновый шейк, шоколад",r:3,g:"США",c:"#5b3a29",s:"disc"},
{n:"Muscle Monster Strawberry",l:"Muscle",t:"протеиновый шейк, клубника",r:3,g:"США",c:"#ff9aa2",s:"disc"},
{n:"Muscle Monster Coffee",l:"Muscle",t:"протеиновый шейк, кофе",r:3,g:"США",c:"#6f4e37",s:"disc"},

/* ---- Rehab (НЕгазированный чай-восстановитель; вся линейка на основе чая, без газа) ---- */
{n:"Monster Rehab Tea + Lemonade",l:"Rehab",t:"негаз. чай с лимонадом",r:2,g:"США",c:"#e0a96d",s:""},
{n:"Monster Rehab Peach Tea",l:"Rehab",t:"негаз. персиковый чай",r:2,g:"США",c:"#ffcc99",s:""},
{n:"Monster Rehab Green Tea",l:"Rehab",t:"негаз. зелёный чай",r:2,g:"США",c:"#9acd32",s:""},
{n:"Monster Rehab Pink Lemonade",l:"Rehab",t:"негаз. чай с розовым лимонадом",r:3,g:"США",c:"#ff9aa2",s:""},
{n:"Monster Rehab Strawberry Lemonade",l:"Rehab",t:"негаз. чай с клубничным лимонадом",r:3,g:"США",c:"#ff6b6b",s:""},
{n:"Monster Rehab Orangeade",l:"Rehab",t:"негаз. апельсиновый чай-напиток",r:3,g:"США",c:"#ffa500",s:"disc"},
{n:"Monster Rehab Wild Berry Tea",l:"Rehab",t:"негаз. дикий ягодный чай",r:3,g:"США",c:"#8e44ad",s:"disc"},
{n:"Monster Rehab Watermelon",l:"Rehab",t:"негаз. арбузный чай",r:3,g:"США",c:"#ff6b81",s:"disc"},
{n:"Monster Rehab Rojo Tea",l:"Rehab",t:"негаз. красный чай (rooibos)",r:4,g:"США",c:"#c0392b",s:"disc"},
{n:"Monster Rehab White Dragon Tea",l:"Rehab",t:"негаз. белый чай с драконьим фруктом",r:4,g:"США",c:"#f0f0f0",s:"disc"},
{n:"Monster Rehab Protean",l:"Rehab",t:"негаз. чай + протеин",r:4,g:"США",c:"#d9c39a",s:"disc"},

/* ---- Dragon Tea ---- */
{n:"Monster Dragon Tea Green Tea",l:"Dragon Tea",t:"зелёный чай",r:3,g:"США",c:"#9acd32",s:""},
{n:"Monster Dragon Tea White Tea",l:"Dragon Tea",t:"белый чай",r:3,g:"США",c:"#eeeeee",s:""},
{n:"Monster Dragon Tea Yerba Mate",l:"Dragon Tea",t:"йерба мате",r:3,g:"США",c:"#6b8e23",s:""},
{n:"Monster Dragon Iced Tea Lemon",l:"Dragon Tea",t:"лимонный холодный чай",r:3,g:"США",c:"#f4d03f",s:""},
{n:"Monster Dragon Iced Tea Peach",l:"Dragon Tea",t:"персиковый холодный чай",r:3,g:"США",c:"#ffcc99",s:""},
{n:"Monster Dragon Iced Tea Raspberry",l:"Dragon Tea",t:"малиновый холодный чай",r:3,g:"США",c:"#c0392b",s:""},

/* ---- Hydro (без газа, спорт) ---- */
{n:"Monster Hydro Tropical Thunder",l:"Hydro",t:"тропический микс",r:2,g:"США",c:"#f5a623",s:""},
{n:"Monster Hydro Manic Melon",l:"Hydro",t:"дыня",r:2,g:"США",c:"#9acd32",s:""},
{n:"Monster Hydro Mean Green",l:"Hydro",t:"цитрус-зелёный",r:2,g:"США",c:"#7cb342",s:""},
{n:"Monster Hydro Blue Ice",l:"Hydro",t:"голубой лёд / ягоды",r:2,g:"США",c:"#2e86de",s:""},
{n:"Monster Hydro Purple Passion",l:"Hydro",t:"маракуйя-виноград",r:3,g:"США",c:"#8e44ad",s:""},

/* ---- Super Fuel (спортивный напиток) ---- */
{n:"Monster Super Fuel Red Dawg",l:"Super Fuel",t:"красные ягоды",r:3,g:"США",c:"#c0392b",s:""},
{n:"Monster Super Fuel Blue Streak",l:"Super Fuel",t:"голубая малина",r:3,g:"США",c:"#2e86de",s:""},

/* ---- Maxx (с азотом, EU/JP) ---- */
{n:"Monster Maxx Super Dry",l:"Maxx",t:"азот, сухой",r:3,g:"Япония",c:"#c0c0c0",s:"reg"},
{n:"Monster Maxx Eclipse",l:"Maxx",t:"тёмные ягоды",r:3,g:"Япония",c:"#2c2c54",s:"reg"},
{n:"Monster Maxx Solaris",l:"Maxx",t:"цитрус-тропик",r:3,g:"Япония",c:"#f6a623",s:"reg"},
{n:"Monster Maxx Mango Matic",l:"Maxx",t:"манго, без сахара",r:3,g:"Япония",c:"#f39c12",s:"reg"},
{n:"Monster Maxx Rad Red",l:"Maxx",t:"красные ягоды, без сахара",r:3,g:"Япония",c:"#e74c3c",s:"reg"},

/* ---- Nitrous / Extra Strength (старая серия с азотом) ---- */
{n:"Nitrous Monster Super Dry",l:"Nitrous / Extra Strength",t:"азот, сухой цитрус",r:4,g:"США",c:"#c0c0c0",s:"disc"},
{n:"Nitrous Monster Killer-B",l:"Nitrous / Extra Strength",t:"мёд-цитрус",r:4,g:"США",c:"#d4af37",s:"disc"},
{n:"Nitrous Monster Anti Gravity",l:"Nitrous / Extra Strength",t:"лёгкий цитрус",r:4,g:"США",c:"#cfd8dc",s:"disc"},
{n:"Nitrous Monster Black Ice",l:"Nitrous / Extra Strength",t:"ягоды-лёд",r:4,g:"США",c:"#2c3e50",s:"disc"},

/* ---- Reserve ---- */
{n:"Monster Reserve White Pineapple",l:"Reserve",t:"белый ананас",r:2,g:"США",c:"#f5f0c0",s:""},
{n:"Monster Reserve Watermelon",l:"Reserve",t:"арбуз",r:2,g:"США",c:"#ff6b81",s:""},
{n:"Monster Reserve Orange Dreamsicle",l:"Reserve",t:"апельсин со сливками",r:2,g:"США",c:"#ffb347",s:""},

/* ---- Soda (Mutant и др.) ---- */
{n:"Mutant Super Soda Original",l:"Soda",t:"супер-сода, цитрус",r:3,g:"США",c:"#39b54a",s:"disc"},
{n:"Mutant Super Soda Red Dawn",l:"Soda",t:"красные ягоды",r:3,g:"США",c:"#c0392b",s:"disc"},
{n:"Mutant Super Soda White Lightning",l:"Soda",t:"белый цитрус",r:3,g:"США",c:"#ecf0f1",s:"disc"},
{n:"Monster Energy Super Cola",l:"Soda",t:"кола",r:4,g:"Европа",c:"#7b3f00",s:"disc"},

/* ---- Signature / Коллаборации ---- */
{n:"Monster Energy The Doctor (Valentino Rossi VR46)",l:"Signature / Коллабы",t:"цитрус-апельсин",r:4,g:"Европа",c:"#f6a623",s:"disc"},
{n:"Monster Energy Lewis Hamilton 44",l:"Signature / Коллабы",t:"цитрус",r:3,g:"Глобально",c:"#e10600",s:""},
{n:"Monster Energy Lewis Hamilton 44 Zero Sugar",l:"Signature / Коллабы",t:"цитрус, без сахара",r:3,g:"Глобально",c:"#1c1c1c",s:""},
{n:"Monster Energy Lando Norris Zero Sugar",l:"Signature / Коллабы",t:"дыня-юдзу, без сахара",r:3,g:"Глобально",c:"#f6e600",s:"new"},
{n:"Monster Energy Gronk",l:"Signature / Коллабы",t:"оригинал: сладкий фруктовый пунш, с сахаром (коллаб с Робом Гронковски)",r:4,g:"США",c:"#2e86de",s:"disc"},
{n:"Monster Energy Gronk Formula 87",l:"Signature / Коллабы",t:"обновл. рецепт: чище фруктовый вкус, ~вдвое меньше сахара (90 ккал); «87» — игровой номер Гронковски",r:4,g:"США",c:"#c0392b",s:"disc"},

/* ---- The Beast / Nasty Beast (АЛКОГОЛЬ ~6%) ---- */
{n:"The Beast Unleashed Mean Green",l:"Beast (алкоголь)",t:"цитрус, 6% алк.",r:3,g:"США",c:"#7cb342",s:"alc"},
{n:"The Beast Unleashed White Haze",l:"Beast (алкоголь)",t:"белый виноград/цитрус, 6% алк.",r:3,g:"США",c:"#ecf0f1",s:"alc"},
{n:"The Beast Unleashed Peach Perfect",l:"Beast (алкоголь)",t:"персик, 6% алк.",r:3,g:"США",c:"#ffcc99",s:"alc"},
{n:"The Beast Unleashed Scary Berries",l:"Beast (алкоголь)",t:"ягоды, 6% алк.",r:3,g:"США",c:"#c0392b",s:"alc"},
{n:"The Beast Unleashed Killer Sunrise",l:"Beast (алкоголь)",t:"апельсин, 6% алк.",r:3,g:"США",c:"#f6a623",s:"alc"},
{n:"The Beast Unleashed Gnarly Grape",l:"Beast (алкоголь)",t:"виноград, 6% алк.",r:3,g:"США",c:"#8e44ad",s:"alc"},
{n:"The Beast Unleashed Pink Poison",l:"Beast (алкоголь)",t:"розовый микс, 6% алк.",r:3,g:"США",c:"#ff7eb9",s:"alc"},
{n:"Nasty Beast Hard Tea Original",l:"Beast (алкоголь)",t:"холодный чай, 6% алк.",r:3,g:"США",c:"#c68642",s:"alc"},
{n:"Nasty Beast Hard Tea Tea + Lemonade",l:"Beast (алкоголь)",t:"чай-лимонад, 6% алк.",r:3,g:"США",c:"#f4d03f",s:"alc"},
{n:"Nasty Beast Hard Tea Peach",l:"Beast (алкоголь)",t:"персиковый чай, 6% алк.",r:3,g:"США",c:"#ffcc99",s:"alc"},
{n:"Nasty Beast Hard Tea Green Tea",l:"Beast (алкоголь)",t:"зелёный чай, 6% алк.",r:3,g:"США",c:"#9acd32",s:"alc"}
];
