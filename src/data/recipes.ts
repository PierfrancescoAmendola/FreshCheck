// Hand-written recipe collection. No AI, no network: recipes ship with the app
// and are matched locally against the ingredient tags of expiring items.
// Text is provided in English, Italian and Spanish; other languages fall back
// to English until translated.

export type RecipeLang = 'en' | 'it' | 'es';

interface Localized {
    title: string;
    ingredients: string[];
    steps: string[];
}

export interface Recipe {
    id: string;
    minutes: number;
    servings: number;
    veggie: boolean;
    tags: string[]; // ingredient tags this recipe uses up
    emoji: string;
    text: Partial<Record<RecipeLang, Localized>> & { en: Localized };
}

export const RECIPES: Recipe[] = [
    {
        id: 'frittata', minutes: 20, servings: 2, veggie: true, emoji: '🍳',
        tags: ['egg', 'zucchini', 'spinach', 'cheese', 'onion', 'potato', 'pepper', 'mushroom'],
        text: {
            en: { title: 'Clear-the-fridge frittata', ingredients: ['4 eggs', '2 handfuls of any vegetables', '30 g grated cheese', 'Olive oil, salt, pepper'], steps: ['Slice vegetables thinly and soften in an oiled pan for 6–8 minutes.', 'Beat eggs with cheese, salt and pepper.', 'Pour over the vegetables, cook on low heat with a lid until set, about 8 minutes.', 'Flip with a plate or finish under the grill.'] },
            it: { title: 'Frittata svuotafrigo', ingredients: ['4 uova', '2 manciate di verdure a piacere', '30 g di formaggio grattugiato', 'Olio, sale, pepe'], steps: ['Affetta le verdure e falle appassire in padella con olio per 6–8 minuti.', 'Sbatti le uova con formaggio, sale e pepe.', 'Versa sulle verdure e cuoci a fuoco basso con coperchio per circa 8 minuti.', 'Gira con un piatto o finisci sotto il grill.'] },
            es: { title: 'Tortilla vacía-nevera', ingredients: ['4 huevos', '2 puñados de verduras', '30 g de queso rallado', 'Aceite, sal, pimienta'], steps: ['Corta las verduras finas y sofríelas 6–8 minutos.', 'Bate los huevos con el queso, sal y pimienta.', 'Vierte sobre las verduras y cuaja a fuego bajo con tapa unos 8 minutos.', 'Dale la vuelta con un plato o termina al grill.'] },
        },
    },
    {
        id: 'banana-pancakes', minutes: 15, servings: 2, veggie: true, emoji: '🥞',
        tags: ['banana', 'egg', 'milk', 'flour'],
        text: {
            en: { title: 'Ripe banana pancakes', ingredients: ['2 very ripe bananas', '2 eggs', '80 g flour', '100 ml milk', '1 tsp baking powder'], steps: ['Mash bananas with a fork.', 'Whisk in eggs, milk, flour and baking powder.', 'Cook small ladles in a non-stick pan, 2 minutes per side.'] },
            it: { title: 'Pancake alla banana matura', ingredients: ['2 banane molto mature', '2 uova', '80 g di farina', '100 ml di latte', '1 cucchiaino di lievito'], steps: ['Schiaccia le banane con una forchetta.', 'Unisci uova, latte, farina e lievito.', 'Cuoci piccoli mestoli in padella antiaderente, 2 minuti per lato.'] },
            es: { title: 'Tortitas de plátano maduro', ingredients: ['2 plátanos muy maduros', '2 huevos', '80 g de harina', '100 ml de leche', '1 cdta de levadura'], steps: ['Aplasta los plátanos con un tenedor.', 'Añade huevos, leche, harina y levadura.', 'Cocina pequeñas porciones en sartén, 2 minutos por lado.'] },
        },
    },
    {
        id: 'smoothie', minutes: 5, servings: 2, veggie: true, emoji: '🥤',
        tags: ['banana', 'berries', 'yogurt', 'milk', 'spinach', 'apple'],
        text: {
            en: { title: 'Rescue smoothie', ingredients: ['1 banana', '1 cup berries or soft fruit', '150 g yogurt or milk', 'A handful of spinach (optional)', 'Honey to taste'], steps: ['Put everything in a blender.', 'Blend until smooth, add water if too thick.', 'Freeze leftover fruit in portions for next time.'] },
            it: { title: 'Smoothie di recupero', ingredients: ['1 banana', '1 tazza di frutti di bosco o frutta matura', '150 g di yogurt o latte', 'Una manciata di spinaci (facoltativo)', 'Miele a piacere'], steps: ['Metti tutto nel frullatore.', 'Frulla fino a renderlo liscio, aggiungi acqua se troppo denso.', 'Congela la frutta avanzata a porzioni.'] },
            es: { title: 'Batido de rescate', ingredients: ['1 plátano', '1 taza de frutos rojos o fruta madura', '150 g de yogur o leche', 'Un puñado de espinacas (opcional)', 'Miel al gusto'], steps: ['Pon todo en la batidora.', 'Tritura hasta que quede suave; añade agua si está espeso.', 'Congela la fruta sobrante en porciones.'] },
        },
    },
    {
        id: 'tomato-pasta', minutes: 20, servings: 2, veggie: true, emoji: '🍝',
        tags: ['tomato', 'pasta', 'garlic', 'herbs', 'mozzarella'],
        text: {
            en: { title: 'Fresh tomato pasta', ingredients: ['200 g pasta', '4 ripe tomatoes', '1 garlic clove', 'Basil', 'Olive oil, salt', 'Mozzarella (optional)'], steps: ['Boil the pasta in salted water.', 'Chop tomatoes; warm garlic in oil, add tomatoes and cook 8 minutes.', 'Toss with pasta, basil and torn mozzarella.'] },
            it: { title: 'Pasta al pomodoro fresco', ingredients: ['200 g di pasta', '4 pomodori maturi', '1 spicchio d\'aglio', 'Basilico', 'Olio, sale', 'Mozzarella (facoltativa)'], steps: ['Cuoci la pasta in acqua salata.', 'Trita i pomodori; scalda l\'aglio nell\'olio, aggiungi i pomodori e cuoci 8 minuti.', 'Manteca con pasta, basilico e mozzarella a pezzi.'] },
            es: { title: 'Pasta con tomate fresco', ingredients: ['200 g de pasta', '4 tomates maduros', '1 diente de ajo', 'Albahaca', 'Aceite, sal', 'Mozzarella (opcional)'], steps: ['Cuece la pasta en agua con sal.', 'Pica los tomates; dora el ajo, añade el tomate y cocina 8 minutos.', 'Mezcla con la pasta, albahaca y mozzarella.'] },
        },
    },
    {
        id: 'carbonara', minutes: 20, servings: 2, veggie: false, emoji: '🍝',
        tags: ['egg', 'bacon', 'cheese', 'pasta'],
        text: {
            en: { title: 'Carbonara', ingredients: ['200 g spaghetti', '3 egg yolks + 1 egg', '100 g guanciale or bacon', '50 g pecorino or parmesan', 'Black pepper'], steps: ['Cook pasta. Crisp the bacon in a dry pan.', 'Whisk eggs with cheese and lots of pepper.', 'Off the heat, toss pasta with bacon, then the egg mix and a splash of pasta water until creamy.'] },
            it: { title: 'Carbonara', ingredients: ['200 g di spaghetti', '3 tuorli + 1 uovo', '100 g di guanciale o pancetta', '50 g di pecorino o parmigiano', 'Pepe nero'], steps: ['Cuoci la pasta. Rosola il guanciale in padella senza olio.', 'Sbatti le uova con formaggio e molto pepe.', 'A fuoco spento, salta la pasta col guanciale, poi le uova e un po\' d\'acqua di cottura fino a crema.'] },
            es: { title: 'Carbonara', ingredients: ['200 g de espaguetis', '3 yemas + 1 huevo', '100 g de guanciale o panceta', '50 g de pecorino o parmesano', 'Pimienta negra'], steps: ['Cuece la pasta. Dora la panceta sin aceite.', 'Bate los huevos con el queso y mucha pimienta.', 'Fuera del fuego, mezcla pasta, panceta, huevo y un chorrito de agua de cocción hasta que esté cremosa.'] },
        },
    },
    {
        id: 'french-toast', minutes: 15, servings: 2, veggie: true, emoji: '🍞',
        tags: ['bread', 'egg', 'milk', 'butter'],
        text: {
            en: { title: 'French toast from stale bread', ingredients: ['4 slices of day-old bread', '2 eggs', '150 ml milk', 'Butter, cinnamon, sugar'], steps: ['Whisk eggs, milk and a pinch of cinnamon.', 'Soak bread for 20 seconds per side.', 'Fry in butter until golden, sprinkle with sugar.'] },
            it: { title: 'French toast col pane raffermo', ingredients: ['4 fette di pane del giorno prima', '2 uova', '150 ml di latte', 'Burro, cannella, zucchero'], steps: ['Sbatti uova, latte e un pizzico di cannella.', 'Immergi il pane 20 secondi per lato.', 'Cuoci nel burro finché dorato, spolvera di zucchero.'] },
            es: { title: 'Torrijas exprés', ingredients: ['4 rebanadas de pan del día anterior', '2 huevos', '150 ml de leche', 'Mantequilla, canela, azúcar'], steps: ['Bate huevos, leche y canela.', 'Empapa el pan 20 segundos por lado.', 'Fríe en mantequilla hasta dorar y espolvorea azúcar.'] },
        },
    },
    {
        id: 'panzanella', minutes: 15, servings: 2, veggie: true, emoji: '🥗',
        tags: ['bread', 'tomato', 'cucumber', 'onion', 'herbs'],
        text: {
            en: { title: 'Panzanella bread salad', ingredients: ['3 slices stale bread', '3 tomatoes', '1/2 cucumber', '1/2 red onion', 'Basil, olive oil, vinegar'], steps: ['Tear bread and dampen with a little water and vinegar.', 'Chop tomatoes, cucumber and onion.', 'Toss everything with oil, salt and basil; rest 10 minutes.'] },
            it: { title: 'Panzanella', ingredients: ['3 fette di pane raffermo', '3 pomodori', '1/2 cetriolo', '1/2 cipolla rossa', 'Basilico, olio, aceto'], steps: ['Spezza il pane e inumidiscilo con acqua e aceto.', 'Taglia pomodori, cetriolo e cipolla.', 'Condisci tutto con olio, sale e basilico; lascia riposare 10 minuti.'] },
            es: { title: 'Ensalada panzanella', ingredients: ['3 rebanadas de pan duro', '3 tomates', '1/2 pepino', '1/2 cebolla morada', 'Albahaca, aceite, vinagre'], steps: ['Trocea el pan y humedécelo con agua y vinagre.', 'Corta tomate, pepino y cebolla.', 'Mezcla con aceite, sal y albahaca; reposa 10 minutos.'] },
        },
    },
    {
        id: 'minestrone', minutes: 40, servings: 4, veggie: true, emoji: '🍲',
        tags: ['carrot', 'onion', 'potato', 'zucchini', 'tomato', 'beans', 'cabbage', 'pasta'],
        text: {
            en: { title: 'Minestrone', ingredients: ['1 onion, 2 carrots, 1 potato', 'Any other vegetables', '1 can beans', '1 cup chopped tomatoes', '80 g small pasta', 'Olive oil, salt'], steps: ['Dice all vegetables. Soften onion and carrot in oil.', 'Add the rest, tomatoes and 1.2 l water; simmer 25 minutes.', 'Add beans and pasta, cook until the pasta is done.'] },
            it: { title: 'Minestrone', ingredients: ['1 cipolla, 2 carote, 1 patata', 'Altre verdure a piacere', '1 lattina di fagioli', '1 tazza di pomodori a pezzi', '80 g di pastina', 'Olio, sale'], steps: ['Taglia le verdure a dadini. Soffriggi cipolla e carota.', 'Aggiungi il resto, il pomodoro e 1,2 l d\'acqua; cuoci 25 minuti.', 'Unisci fagioli e pasta e cuoci finché pronta.'] },
            es: { title: 'Minestrone', ingredients: ['1 cebolla, 2 zanahorias, 1 patata', 'Otras verduras', '1 lata de alubias', '1 taza de tomate troceado', '80 g de pasta pequeña', 'Aceite, sal'], steps: ['Corta las verduras en dados. Sofríe cebolla y zanahoria.', 'Añade el resto, el tomate y 1,2 l de agua; cuece 25 minutos.', 'Agrega alubias y pasta y cocina hasta que esté lista.'] },
        },
    },
    {
        id: 'veg-soup', minutes: 30, servings: 3, veggie: true, emoji: '🥣',
        tags: ['carrot', 'potato', 'onion', 'zucchini', 'broccoli', 'spinach', 'cream'],
        text: {
            en: { title: 'Blended vegetable soup', ingredients: ['500 g mixed vegetables', '1 potato', '1 onion', '800 ml stock', 'A splash of cream (optional)'], steps: ['Chop everything roughly.', 'Simmer in stock for 20 minutes until soft.', 'Blend, season and finish with cream.'] },
            it: { title: 'Vellutata di verdure', ingredients: ['500 g di verdure miste', '1 patata', '1 cipolla', '800 ml di brodo', 'Un filo di panna (facoltativo)'], steps: ['Taglia tutto grossolanamente.', 'Cuoci nel brodo per 20 minuti finché morbido.', 'Frulla, regola di sale e completa con la panna.'] },
            es: { title: 'Crema de verduras', ingredients: ['500 g de verduras variadas', '1 patata', '1 cebolla', '800 ml de caldo', 'Un chorrito de nata (opcional)'], steps: ['Trocea todo.', 'Cuece en el caldo 20 minutos.', 'Tritura, sazona y termina con nata.'] },
        },
    },
    {
        id: 'fried-rice', minutes: 15, servings: 2, veggie: false, emoji: '🍚',
        tags: ['rice', 'egg', 'peas', 'carrot', 'onion', 'ham', 'chicken', 'corn'],
        text: {
            en: { title: 'Leftover fried rice', ingredients: ['300 g cooked rice (day-old is best)', '2 eggs', '1 cup peas, carrot or corn', 'Ham or chicken leftovers', 'Soy sauce, spring onion'], steps: ['Scramble eggs in a hot oiled pan, set aside.', 'Stir-fry vegetables and meat 3 minutes.', 'Add rice, soy sauce and eggs; fry until hot and slightly crispy.'] },
            it: { title: 'Riso saltato di recupero', ingredients: ['300 g di riso cotto (meglio del giorno prima)', '2 uova', '1 tazza di piselli, carote o mais', 'Avanzi di prosciutto o pollo', 'Salsa di soia, cipollotto'], steps: ['Strapazza le uova in padella calda, metti da parte.', 'Salta verdure e carne per 3 minuti.', 'Aggiungi riso, soia e uova; salta finché caldo e croccante.'] },
            es: { title: 'Arroz frito de aprovechamiento', ingredients: ['300 g de arroz cocido (mejor del día anterior)', '2 huevos', '1 taza de guisantes, zanahoria o maíz', 'Restos de jamón o pollo', 'Salsa de soja, cebolleta'], steps: ['Revuelve los huevos en sartén caliente y reserva.', 'Saltea verduras y carne 3 minutos.', 'Añade arroz, soja y huevo; saltea hasta que esté crujiente.'] },
        },
    },
    {
        id: 'risotto-mushroom', minutes: 30, servings: 2, veggie: true, emoji: '🍄',
        tags: ['mushroom', 'rice', 'onion', 'cheese', 'butter'],
        text: {
            en: { title: 'Mushroom risotto', ingredients: ['160 g risotto rice', '200 g mushrooms', '1/2 onion', '700 ml hot stock', 'Butter, parmesan'], steps: ['Soften onion, add sliced mushrooms and cook 5 minutes.', 'Toast rice 1 minute, then add stock a ladle at a time, stirring, for 17 minutes.', 'Off the heat stir in butter and parmesan.'] },
            it: { title: 'Risotto ai funghi', ingredients: ['160 g di riso da risotto', '200 g di funghi', '1/2 cipolla', '700 ml di brodo caldo', 'Burro, parmigiano'], steps: ['Appassisci la cipolla, aggiungi i funghi a fette e cuoci 5 minuti.', 'Tosta il riso 1 minuto, poi aggiungi il brodo un mestolo alla volta per 17 minuti.', 'A fuoco spento manteca con burro e parmigiano.'] },
            es: { title: 'Risotto de setas', ingredients: ['160 g de arroz para risotto', '200 g de setas', '1/2 cebolla', '700 ml de caldo caliente', 'Mantequilla, parmesano'], steps: ['Pocha la cebolla, añade las setas y cocina 5 minutos.', 'Tuesta el arroz 1 minuto y añade caldo poco a poco durante 17 minutos.', 'Fuera del fuego, añade mantequilla y parmesano.'] },
        },
    },
    {
        id: 'chicken-stirfry', minutes: 20, servings: 2, veggie: false, emoji: '🥘',
        tags: ['chicken', 'pepper', 'broccoli', 'carrot', 'onion', 'garlic', 'rice'],
        text: {
            en: { title: 'Chicken & veg stir-fry', ingredients: ['300 g chicken', '2 cups mixed vegetables', '1 garlic clove', 'Soy sauce, honey', 'Rice to serve'], steps: ['Slice chicken and vegetables thinly.', 'Sear chicken in a very hot pan 4 minutes, add veg and garlic for 4 more.', 'Add 2 tbsp soy and 1 tsp honey; serve over rice.'] },
            it: { title: 'Pollo saltato con verdure', ingredients: ['300 g di pollo', '2 tazze di verdure miste', '1 spicchio d\'aglio', 'Salsa di soia, miele', 'Riso per servire'], steps: ['Taglia pollo e verdure a listarelle.', 'Rosola il pollo in padella rovente 4 minuti, poi verdure e aglio per altri 4.', 'Aggiungi 2 cucchiai di soia e 1 di miele; servi col riso.'] },
            es: { title: 'Salteado de pollo y verduras', ingredients: ['300 g de pollo', '2 tazas de verduras', '1 diente de ajo', 'Salsa de soja, miel', 'Arroz para acompañar'], steps: ['Corta pollo y verduras en tiras.', 'Dora el pollo 4 minutos a fuego fuerte, añade verduras y ajo 4 más.', 'Agrega 2 cdas de soja y 1 cdta de miel; sirve con arroz.'] },
        },
    },
    {
        id: 'chicken-traybake', minutes: 45, servings: 3, veggie: false, emoji: '🍗',
        tags: ['chicken', 'potato', 'onion', 'carrot', 'lemon', 'garlic', 'herbs'],
        text: {
            en: { title: 'One-tray chicken & potatoes', ingredients: ['4 chicken thighs', '500 g potatoes', '1 onion, 2 carrots', '1 lemon, 3 garlic cloves', 'Rosemary, olive oil'], steps: ['Heat oven to 210 °C.', 'Cut vegetables into chunks, toss everything with oil, lemon juice, garlic and herbs.', 'Roast 40 minutes, turning once.'] },
            it: { title: 'Pollo e patate in teglia', ingredients: ['4 sovracosce di pollo', '500 g di patate', '1 cipolla, 2 carote', '1 limone, 3 spicchi d\'aglio', 'Rosmarino, olio'], steps: ['Scalda il forno a 210 °C.', 'Taglia le verdure a pezzi e condisci tutto con olio, limone, aglio ed erbe.', 'Inforna 40 minuti girando una volta.'] },
            es: { title: 'Pollo con patatas en bandeja', ingredients: ['4 contramuslos de pollo', '500 g de patatas', '1 cebolla, 2 zanahorias', '1 limón, 3 dientes de ajo', 'Romero, aceite'], steps: ['Precalienta el horno a 210 °C.', 'Trocea las verduras y mezcla todo con aceite, limón, ajo y hierbas.', 'Hornea 40 minutos dando la vuelta una vez.'] },
        },
    },
    {
        id: 'bolognese', minutes: 50, servings: 4, veggie: false, emoji: '🍝',
        tags: ['beef', 'pork', 'carrot', 'onion', 'tomato', 'pasta'],
        text: {
            en: { title: 'Quick ragù', ingredients: ['400 g minced meat', '1 onion, 1 carrot, 1 celery stick', '700 g tomato passata', 'Splash of milk or wine', 'Pasta to serve'], steps: ['Finely chop vegetables and soften in oil 8 minutes.', 'Brown the meat well, add wine or milk and let it evaporate.', 'Add passata and simmer 30 minutes. Freeze extra portions.'] },
            it: { title: 'Ragù veloce', ingredients: ['400 g di carne macinata', '1 cipolla, 1 carota, 1 sedano', '700 g di passata', 'Un goccio di latte o vino', 'Pasta per servire'], steps: ['Trita le verdure e soffriggile 8 minuti.', 'Rosola bene la carne, sfuma con vino o latte.', 'Aggiungi la passata e cuoci 30 minuti. Congela le porzioni in più.'] },
            es: { title: 'Boloñesa rápida', ingredients: ['400 g de carne picada', '1 cebolla, 1 zanahoria, 1 rama de apio', '700 g de tomate triturado', 'Un chorro de leche o vino', 'Pasta para servir'], steps: ['Pica las verduras y sofríe 8 minutos.', 'Dora bien la carne y añade vino o leche.', 'Agrega el tomate y cuece 30 minutos. Congela lo que sobre.'] },
        },
    },
    {
        id: 'meatballs', minutes: 35, servings: 3, veggie: false, emoji: '🧆',
        tags: ['beef', 'pork', 'bread', 'egg', 'cheese', 'tomato'],
        text: {
            en: { title: 'Meatballs in tomato sauce', ingredients: ['400 g minced meat', '1 slice stale bread soaked in milk', '1 egg, 30 g parmesan', '500 g passata', 'Garlic, basil'], steps: ['Mix meat, squeezed bread, egg and cheese; shape small balls.', 'Simmer passata with garlic 5 minutes.', 'Drop in meatballs and cook covered 20 minutes.'] },
            it: { title: 'Polpette al sugo', ingredients: ['400 g di macinato', '1 fetta di pane raffermo bagnata nel latte', '1 uovo, 30 g di parmigiano', '500 g di passata', 'Aglio, basilico'], steps: ['Impasta carne, pane strizzato, uovo e formaggio; forma le polpette.', 'Cuoci la passata con l\'aglio 5 minuti.', 'Aggiungi le polpette e cuoci coperto 20 minuti.'] },
            es: { title: 'Albóndigas en salsa', ingredients: ['400 g de carne picada', '1 rebanada de pan duro remojada en leche', '1 huevo, 30 g de parmesano', '500 g de tomate triturado', 'Ajo, albahaca'], steps: ['Mezcla carne, pan escurrido, huevo y queso; forma bolitas.', 'Cuece el tomate con ajo 5 minutos.', 'Añade las albóndigas y cocina tapado 20 minutos.'] },
        },
    },
    {
        id: 'salmon-traybake', minutes: 25, servings: 2, veggie: false, emoji: '🐟',
        tags: ['salmon', 'fish', 'broccoli', 'lemon', 'potato'],
        text: {
            en: { title: 'Salmon with lemon broccoli', ingredients: ['2 salmon fillets', '1 head broccoli', '1 lemon', 'Olive oil, salt'], steps: ['Heat oven to 200 °C.', 'Toss broccoli florets with oil on a tray; roast 8 minutes.', 'Add salmon, lemon slices and roast 12 minutes more.'] },
            it: { title: 'Salmone con broccoli al limone', ingredients: ['2 filetti di salmone', '1 broccolo', '1 limone', 'Olio, sale'], steps: ['Scalda il forno a 200 °C.', 'Condisci le cimette con olio in teglia; inforna 8 minuti.', 'Aggiungi il salmone e il limone a fette, inforna altri 12 minuti.'] },
            es: { title: 'Salmón con brócoli al limón', ingredients: ['2 lomos de salmón', '1 brócoli', '1 limón', 'Aceite, sal'], steps: ['Precalienta el horno a 200 °C.', 'Mezcla el brócoli con aceite en una bandeja; hornea 8 minutos.', 'Añade el salmón y rodajas de limón, hornea 12 minutos más.'] },
        },
    },
    {
        id: 'fish-tacos', minutes: 25, servings: 2, veggie: false, emoji: '🌮',
        tags: ['fish', 'tortilla', 'cabbage', 'lemon', 'avocado', 'yogurt'],
        text: {
            en: { title: 'Fish tacos', ingredients: ['300 g white fish', '6 small tortillas', '1 cup shredded cabbage', '1 avocado, 1 lime', '3 tbsp yogurt'], steps: ['Season fish with salt, paprika and lime; pan-fry 3 minutes per side.', 'Mix yogurt with lime juice.', 'Fill warm tortillas with fish, cabbage, avocado and sauce.'] },
            it: { title: 'Tacos di pesce', ingredients: ['300 g di pesce bianco', '6 tortillas piccole', '1 tazza di cavolo a striscioline', '1 avocado, 1 lime', '3 cucchiai di yogurt'], steps: ['Condisci il pesce con sale, paprika e lime; cuoci 3 minuti per lato.', 'Mescola lo yogurt con succo di lime.', 'Farcisci le tortillas calde con pesce, cavolo, avocado e salsa.'] },
            es: { title: 'Tacos de pescado', ingredients: ['300 g de pescado blanco', '6 tortillas pequeñas', '1 taza de col rallada', '1 aguacate, 1 lima', '3 cdas de yogur'], steps: ['Sazona el pescado con sal, pimentón y lima; dóralo 3 minutos por lado.', 'Mezcla el yogur con zumo de lima.', 'Rellena las tortillas con pescado, col, aguacate y salsa.'] },
        },
    },
    {
        id: 'shrimp-garlic', minutes: 15, servings: 2, veggie: false, emoji: '🍤',
        tags: ['shrimp', 'garlic', 'pasta', 'lemon', 'herbs'],
        text: {
            en: { title: 'Garlic prawn linguine', ingredients: ['200 g linguine', '250 g prawns', '3 garlic cloves, chilli', '1/2 lemon, parsley', 'Olive oil'], steps: ['Cook pasta.', 'Sizzle garlic and chilli in oil, add prawns for 3 minutes.', 'Toss with pasta, lemon zest and parsley.'] },
            it: { title: 'Linguine aglio e gamberi', ingredients: ['200 g di linguine', '250 g di gamberi', '3 spicchi d\'aglio, peperoncino', '1/2 limone, prezzemolo', 'Olio'], steps: ['Cuoci la pasta.', 'Soffriggi aglio e peperoncino, aggiungi i gamberi per 3 minuti.', 'Salta con la pasta, scorza di limone e prezzemolo.'] },
            es: { title: 'Linguine con gambas al ajillo', ingredients: ['200 g de linguine', '250 g de gambas', '3 dientes de ajo, guindilla', '1/2 limón, perejil', 'Aceite'], steps: ['Cuece la pasta.', 'Sofríe ajo y guindilla, añade las gambas 3 minutos.', 'Mezcla con la pasta, ralladura de limón y perejil.'] },
        },
    },
    {
        id: 'tuna-salad', minutes: 10, servings: 2, veggie: false, emoji: '🥗',
        tags: ['tuna', 'lettuce', 'tomato', 'cucumber', 'egg', 'corn', 'beans'],
        text: {
            en: { title: 'Big tuna salad', ingredients: ['1 can tuna', 'Lettuce or any leaves', 'Tomato, cucumber, corn', '2 boiled eggs', 'Olive oil, lemon'], steps: ['Wash and chop leaves and vegetables.', 'Add drained tuna, egg wedges and corn.', 'Dress with oil, lemon and salt.'] },
            it: { title: 'Insalatona al tonno', ingredients: ['1 scatoletta di tonno', 'Lattuga o altre foglie', 'Pomodoro, cetriolo, mais', '2 uova sode', 'Olio, limone'], steps: ['Lava e taglia foglie e verdure.', 'Aggiungi tonno sgocciolato, uova a spicchi e mais.', 'Condisci con olio, limone e sale.'] },
            es: { title: 'Ensalada completa de atún', ingredients: ['1 lata de atún', 'Lechuga u otras hojas', 'Tomate, pepino, maíz', '2 huevos cocidos', 'Aceite, limón'], steps: ['Lava y corta hojas y verduras.', 'Añade el atún escurrido, el huevo y el maíz.', 'Aliña con aceite, limón y sal.'] },
        },
    },
    {
        id: 'shakshuka', minutes: 25, servings: 2, veggie: true, emoji: '🍳',
        tags: ['egg', 'tomato', 'pepper', 'onion', 'garlic', 'bread'],
        text: {
            en: { title: 'Shakshuka', ingredients: ['4 eggs', '1 onion, 1 pepper', '400 g tomatoes', '1 garlic clove, cumin, paprika', 'Bread to dip'], steps: ['Soften sliced onion and pepper 8 minutes, add garlic and spices.', 'Add tomatoes and simmer 10 minutes.', 'Make wells, crack in eggs, cover and cook 6 minutes.'] },
            it: { title: 'Shakshuka', ingredients: ['4 uova', '1 cipolla, 1 peperone', '400 g di pomodori', '1 spicchio d\'aglio, cumino, paprika', 'Pane per la scarpetta'], steps: ['Appassisci cipolla e peperone 8 minuti, aggiungi aglio e spezie.', 'Unisci i pomodori e cuoci 10 minuti.', 'Fai delle conche, rompi le uova, copri e cuoci 6 minuti.'] },
            es: { title: 'Shakshuka', ingredients: ['4 huevos', '1 cebolla, 1 pimiento', '400 g de tomate', '1 ajo, comino, pimentón', 'Pan para mojar'], steps: ['Pocha cebolla y pimiento 8 minutos, añade ajo y especias.', 'Agrega el tomate y cuece 10 minutos.', 'Haz huecos, casca los huevos, tapa y cocina 6 minutos.'] },
        },
    },
    {
        id: 'quesadilla', minutes: 10, servings: 2, veggie: true, emoji: '🫓',
        tags: ['tortilla', 'cheese', 'beans', 'pepper', 'corn', 'chicken'],
        text: {
            en: { title: 'Fridge quesadillas', ingredients: ['4 tortillas', '100 g grated cheese', 'Beans, corn, peppers or leftover chicken', 'Salsa or yogurt'], steps: ['Scatter cheese and fillings over half of each tortilla.', 'Fold and toast in a dry pan 2 minutes per side.', 'Cut into wedges and serve with salsa.'] },
            it: { title: 'Quesadillas svuotafrigo', ingredients: ['4 tortillas', '100 g di formaggio grattugiato', 'Fagioli, mais, peperoni o avanzi di pollo', 'Salsa o yogurt'], steps: ['Distribuisci formaggio e ripieno su metà tortilla.', 'Chiudi e tosta in padella 2 minuti per lato.', 'Taglia a spicchi e servi con salsa.'] },
            es: { title: 'Quesadillas de nevera', ingredients: ['4 tortillas', '100 g de queso rallado', 'Alubias, maíz, pimiento o restos de pollo', 'Salsa o yogur'], steps: ['Reparte queso y relleno en media tortilla.', 'Dobla y tuesta en sartén 2 minutos por lado.', 'Corta en triángulos y sirve con salsa.'] },
        },
    },
    {
        id: 'chickpea-curry', minutes: 30, servings: 3, veggie: true, emoji: '🍛',
        tags: ['chickpeas', 'coconutMilk', 'spinach', 'tomato', 'onion', 'garlic', 'rice'],
        text: {
            en: { title: 'Chickpea & spinach curry', ingredients: ['1 can chickpeas', '1 can coconut milk', '2 handfuls spinach', '1 onion, 2 garlic cloves', '2 tbsp curry powder', 'Rice'], steps: ['Soften onion and garlic, add curry powder 1 minute.', 'Add chickpeas, coconut milk and simmer 15 minutes.', 'Stir in spinach until wilted; serve with rice.'] },
            it: { title: 'Curry di ceci e spinaci', ingredients: ['1 lattina di ceci', '1 lattina di latte di cocco', '2 manciate di spinaci', '1 cipolla, 2 spicchi d\'aglio', '2 cucchiai di curry', 'Riso'], steps: ['Appassisci cipolla e aglio, tosta il curry 1 minuto.', 'Aggiungi ceci e latte di cocco, cuoci 15 minuti.', 'Unisci gli spinaci finché appassiti; servi col riso.'] },
            es: { title: 'Curry de garbanzos y espinacas', ingredients: ['1 lata de garbanzos', '1 lata de leche de coco', '2 puñados de espinacas', '1 cebolla, 2 ajos', '2 cdas de curry', 'Arroz'], steps: ['Pocha cebolla y ajo, tuesta el curry 1 minuto.', 'Añade garbanzos y leche de coco, cuece 15 minutos.', 'Incorpora las espinacas; sirve con arroz.'] },
        },
    },
    {
        id: 'lentil-soup', minutes: 35, servings: 4, veggie: true, emoji: '🥣',
        tags: ['lentils', 'carrot', 'onion', 'tomato', 'garlic'],
        text: {
            en: { title: 'Red lentil soup', ingredients: ['200 g red lentils', '1 onion, 2 carrots', '1 garlic clove', '2 tbsp tomato paste', '1 l stock, cumin, lemon'], steps: ['Soften onion and carrot, add garlic, cumin and tomato paste.', 'Add lentils and stock; simmer 20 minutes.', 'Blend partly and finish with lemon.'] },
            it: { title: 'Zuppa di lenticchie rosse', ingredients: ['200 g di lenticchie rosse', '1 cipolla, 2 carote', '1 spicchio d\'aglio', '2 cucchiai di concentrato', '1 l di brodo, cumino, limone'], steps: ['Soffriggi cipolla e carota, aggiungi aglio, cumino e concentrato.', 'Unisci lenticchie e brodo; cuoci 20 minuti.', 'Frulla in parte e completa con limone.'] },
            es: { title: 'Sopa de lentejas rojas', ingredients: ['200 g de lentejas rojas', '1 cebolla, 2 zanahorias', '1 ajo', '2 cdas de tomate concentrado', '1 l de caldo, comino, limón'], steps: ['Pocha cebolla y zanahoria, añade ajo, comino y tomate.', 'Agrega lentejas y caldo; cuece 20 minutos.', 'Tritura un poco y termina con limón.'] },
        },
    },
    {
        id: 'potato-gratin', minutes: 60, servings: 4, veggie: true, emoji: '🥔',
        tags: ['potato', 'cream', 'milk', 'cheese', 'garlic', 'butter'],
        text: {
            en: { title: 'Potato gratin', ingredients: ['1 kg potatoes', '300 ml cream or milk', '80 g cheese', '1 garlic clove, butter', 'Nutmeg, salt'], steps: ['Heat oven to 180 °C. Rub a dish with garlic and butter.', 'Layer thin potato slices, seasoning each layer.', 'Pour over cream, top with cheese and bake 50 minutes.'] },
            it: { title: 'Patate gratinate', ingredients: ['1 kg di patate', '300 ml di panna o latte', '80 g di formaggio', '1 spicchio d\'aglio, burro', 'Noce moscata, sale'], steps: ['Scalda il forno a 180 °C. Strofina la pirofila con aglio e burro.', 'Fai strati di patate sottili, condendo ogni strato.', 'Versa la panna, copri di formaggio e inforna 50 minuti.'] },
            es: { title: 'Gratén de patatas', ingredients: ['1 kg de patatas', '300 ml de nata o leche', '80 g de queso', '1 ajo, mantequilla', 'Nuez moscada, sal'], steps: ['Precalienta el horno a 180 °C. Unta la fuente con ajo y mantequilla.', 'Coloca capas finas de patata, sazonando cada una.', 'Cubre con nata y queso y hornea 50 minutos.'] },
        },
    },
    {
        id: 'mac-cheese', minutes: 25, servings: 3, veggie: true, emoji: '🧀',
        tags: ['cheese', 'milk', 'butter', 'pasta', 'flour'],
        text: {
            en: { title: 'Use-up mac & cheese', ingredients: ['250 g short pasta', '30 g butter, 30 g flour', '500 ml milk', '150 g any cheese ends'], steps: ['Cook pasta.', 'Melt butter, stir in flour, then whisk in milk until thick.', 'Melt in the cheese and fold through the pasta.'] },
            it: { title: 'Pasta al forno con avanzi di formaggio', ingredients: ['250 g di pasta corta', '30 g di burro, 30 g di farina', '500 ml di latte', '150 g di formaggi avanzati'], steps: ['Cuoci la pasta.', 'Sciogli il burro, aggiungi la farina, poi il latte mescolando finché addensa.', 'Fondi i formaggi e condisci la pasta.'] },
            es: { title: 'Macarrones con quesos sobrantes', ingredients: ['250 g de pasta corta', '30 g de mantequilla, 30 g de harina', '500 ml de leche', '150 g de restos de queso'], steps: ['Cuece la pasta.', 'Funde la mantequilla, añade la harina y luego la leche hasta espesar.', 'Funde el queso y mezcla con la pasta.'] },
        },
    },
    {
        id: 'yogurt-cake', minutes: 50, servings: 8, veggie: true, emoji: '🍰',
        tags: ['yogurt', 'egg', 'flour', 'lemon', 'apple', 'berries'],
        text: {
            en: { title: 'One-pot yogurt cake', ingredients: ['1 pot yogurt (125 g), use it to measure', '2 pots sugar, 3 pots flour', '1/2 pot oil, 3 eggs', '1 sachet baking powder', 'Lemon zest or fruit'], steps: ['Heat oven to 180 °C.', 'Mix all ingredients with a whisk; fold in fruit.', 'Bake in a lined tin 35–40 minutes.'] },
            it: { title: 'Torta allo yogurt', ingredients: ['1 vasetto di yogurt (125 g), usalo come misura', '2 vasetti di zucchero, 3 di farina', '1/2 vasetto di olio, 3 uova', '1 bustina di lievito', 'Scorza di limone o frutta'], steps: ['Scalda il forno a 180 °C.', 'Mescola tutti gli ingredienti con la frusta; aggiungi la frutta.', 'Cuoci in uno stampo foderato per 35–40 minuti.'] },
            es: { title: 'Bizcocho de yogur', ingredients: ['1 yogur (125 g), úsalo como medida', '2 medidas de azúcar, 3 de harina', '1/2 medida de aceite, 3 huevos', '1 sobre de levadura', 'Ralladura de limón o fruta'], steps: ['Precalienta el horno a 180 °C.', 'Mezcla todo con varillas y añade la fruta.', 'Hornea en molde forrado 35–40 minutos.'] },
        },
    },
    {
        id: 'banana-bread', minutes: 65, servings: 8, veggie: true, emoji: '🍌',
        tags: ['banana', 'egg', 'butter', 'flour'],
        text: {
            en: { title: 'Banana bread', ingredients: ['3 overripe bananas', '2 eggs', '80 g melted butter', '150 g sugar', '220 g flour, 1 tsp baking soda'], steps: ['Heat oven to 175 °C.', 'Mash bananas, mix in butter, sugar and eggs, then flour and soda.', 'Bake in a loaf tin 55 minutes.'] },
            it: { title: 'Banana bread', ingredients: ['3 banane molto mature', '2 uova', '80 g di burro fuso', '150 g di zucchero', '220 g di farina, 1 cucchiaino di bicarbonato'], steps: ['Scalda il forno a 175 °C.', 'Schiaccia le banane, unisci burro, zucchero e uova, poi farina e bicarbonato.', 'Cuoci in uno stampo da plumcake 55 minuti.'] },
            es: { title: 'Pan de plátano', ingredients: ['3 plátanos muy maduros', '2 huevos', '80 g de mantequilla derretida', '150 g de azúcar', '220 g de harina, 1 cdta de bicarbonato'], steps: ['Precalienta el horno a 175 °C.', 'Aplasta los plátanos, mezcla con mantequilla, azúcar y huevos, luego harina y bicarbonato.', 'Hornea en molde de pan 55 minutos.'] },
        },
    },
    {
        id: 'apple-crumble', minutes: 45, servings: 4, veggie: true, emoji: '🍎',
        tags: ['apple', 'berries', 'butter', 'flour'],
        text: {
            en: { title: 'Soft-fruit crumble', ingredients: ['4 apples or 400 g berries', '100 g flour', '60 g cold butter', '60 g sugar', 'Cinnamon'], steps: ['Heat oven to 190 °C. Chop fruit into a dish with a little sugar and cinnamon.', 'Rub flour, butter and sugar into crumbs.', 'Scatter over fruit and bake 30 minutes.'] },
            it: { title: 'Crumble di frutta', ingredients: ['4 mele o 400 g di frutti di bosco', '100 g di farina', '60 g di burro freddo', '60 g di zucchero', 'Cannella'], steps: ['Scalda il forno a 190 °C. Taglia la frutta in una pirofila con poco zucchero e cannella.', 'Sbriciola farina, burro e zucchero con le dita.', 'Distribuisci sulla frutta e inforna 30 minuti.'] },
            es: { title: 'Crumble de fruta', ingredients: ['4 manzanas o 400 g de frutos rojos', '100 g de harina', '60 g de mantequilla fría', '60 g de azúcar', 'Canela'], steps: ['Precalienta a 190 °C. Trocea la fruta en una fuente con azúcar y canela.', 'Desmenuza harina, mantequilla y azúcar con los dedos.', 'Cubre la fruta y hornea 30 minutos.'] },
        },
    },
    {
        id: 'guacamole-toast', minutes: 10, servings: 2, veggie: true, emoji: '🥑',
        tags: ['avocado', 'bread', 'lemon', 'tomato', 'egg'],
        text: {
            en: { title: 'Avocado toast', ingredients: ['1 ripe avocado', '2 slices bread', '1/2 lemon', 'Cherry tomatoes or an egg', 'Chilli flakes, salt'], steps: ['Toast the bread.', 'Mash avocado with lemon and salt.', 'Spread, top with tomatoes or a fried egg and chilli.'] },
            it: { title: 'Toast all\'avocado', ingredients: ['1 avocado maturo', '2 fette di pane', '1/2 limone', 'Pomodorini o un uovo', 'Peperoncino, sale'], steps: ['Tosta il pane.', 'Schiaccia l\'avocado con limone e sale.', 'Spalma e completa con pomodorini o uovo e peperoncino.'] },
            es: { title: 'Tostada de aguacate', ingredients: ['1 aguacate maduro', '2 rebanadas de pan', '1/2 limón', 'Tomates cherry o un huevo', 'Guindilla, sal'], steps: ['Tuesta el pan.', 'Aplasta el aguacate con limón y sal.', 'Unta y cubre con tomate o un huevo frito y guindilla.'] },
        },
    },
    {
        id: 'stuffed-peppers', minutes: 50, servings: 4, veggie: false, emoji: '🫑',
        tags: ['pepper', 'rice', 'beef', 'tomato', 'cheese', 'onion'],
        text: {
            en: { title: 'Stuffed peppers', ingredients: ['4 peppers', '250 g minced meat or cooked rice', '1 onion', '200 g passata', '60 g cheese'], steps: ['Heat oven to 190 °C. Halve and seed peppers.', 'Brown onion and meat, mix with rice and half the passata.', 'Fill peppers, top with passata and cheese, bake 35 minutes.'] },
            it: { title: 'Peperoni ripieni', ingredients: ['4 peperoni', '250 g di macinato o riso cotto', '1 cipolla', '200 g di passata', '60 g di formaggio'], steps: ['Scalda il forno a 190 °C. Taglia e svuota i peperoni.', 'Rosola cipolla e carne, unisci riso e metà passata.', 'Riempi i peperoni, copri con passata e formaggio, inforna 35 minuti.'] },
            es: { title: 'Pimientos rellenos', ingredients: ['4 pimientos', '250 g de carne picada o arroz cocido', '1 cebolla', '200 g de tomate triturado', '60 g de queso'], steps: ['Precalienta a 190 °C. Parte y vacía los pimientos.', 'Dora cebolla y carne, mezcla con arroz y medio tomate.', 'Rellena, cubre con tomate y queso y hornea 35 minutos.'] },
        },
    },
    {
        id: 'zucchini-pasta', minutes: 20, servings: 2, veggie: true, emoji: '🥒',
        tags: ['zucchini', 'pasta', 'garlic', 'cheese', 'lemon', 'herbs'],
        text: {
            en: { title: 'Zucchini & lemon pasta', ingredients: ['200 g pasta', '2 zucchini', '1 garlic clove', 'Lemon zest, mint or basil', 'Parmesan'], steps: ['Cook pasta. Grate zucchini.', 'Cook zucchini with garlic in oil 5 minutes until soft.', 'Toss with pasta, lemon zest, herbs and parmesan.'] },
            it: { title: 'Pasta zucchine e limone', ingredients: ['200 g di pasta', '2 zucchine', '1 spicchio d\'aglio', 'Scorza di limone, menta o basilico', 'Parmigiano'], steps: ['Cuoci la pasta. Grattugia le zucchine.', 'Cuocile con aglio e olio 5 minuti finché morbide.', 'Salta con pasta, scorza di limone, erbe e parmigiano.'] },
            es: { title: 'Pasta con calabacín y limón', ingredients: ['200 g de pasta', '2 calabacines', '1 ajo', 'Ralladura de limón, menta o albahaca', 'Parmesano'], steps: ['Cuece la pasta. Ralla los calabacines.', 'Sofríelos con ajo 5 minutos.', 'Mezcla con la pasta, limón, hierbas y parmesano.'] },
        },
    },
    {
        id: 'eggplant-parm', minutes: 60, servings: 4, veggie: true, emoji: '🍆',
        tags: ['eggplant', 'tomato', 'mozzarella', 'cheese', 'herbs'],
        text: {
            en: { title: 'Easy aubergine parmigiana', ingredients: ['2 aubergines', '500 g passata', '1 mozzarella', '50 g parmesan', 'Basil, olive oil'], steps: ['Slice aubergines, brush with oil and grill or roast until soft.', 'Layer with passata, mozzarella, parmesan and basil.', 'Bake at 190 °C for 30 minutes.'] },
            it: { title: 'Parmigiana facile', ingredients: ['2 melanzane', '500 g di passata', '1 mozzarella', '50 g di parmigiano', 'Basilico, olio'], steps: ['Affetta le melanzane, spennella d\'olio e grigliale o arrostiscile.', 'Fai strati con passata, mozzarella, parmigiano e basilico.', 'Inforna a 190 °C per 30 minuti.'] },
            es: { title: 'Berenjenas a la parmesana', ingredients: ['2 berenjenas', '500 g de tomate triturado', '1 mozzarella', '50 g de parmesano', 'Albahaca, aceite'], steps: ['Corta las berenjenas, píntalas con aceite y ásalas.', 'Monta capas con tomate, mozzarella, parmesano y albahaca.', 'Hornea a 190 °C 30 minutos.'] },
        },
    },
    {
        id: 'greek-salad', minutes: 10, servings: 2, veggie: true, emoji: '🥗',
        tags: ['tomato', 'cucumber', 'onion', 'cheese', 'pepper'],
        text: {
            en: { title: 'Greek salad', ingredients: ['3 tomatoes', '1 cucumber', '1/2 red onion, 1 pepper', '150 g feta', 'Olives, oregano, olive oil'], steps: ['Cut vegetables into chunks.', 'Top with feta and olives.', 'Dress with oregano and oil.'] },
            it: { title: 'Insalata greca', ingredients: ['3 pomodori', '1 cetriolo', '1/2 cipolla rossa, 1 peperone', '150 g di feta', 'Olive, origano, olio'], steps: ['Taglia le verdure a pezzi.', 'Aggiungi feta e olive.', 'Condisci con origano e olio.'] },
            es: { title: 'Ensalada griega', ingredients: ['3 tomates', '1 pepino', '1/2 cebolla morada, 1 pimiento', '150 g de feta', 'Aceitunas, orégano, aceite'], steps: ['Corta las verduras en trozos.', 'Añade feta y aceitunas.', 'Aliña con orégano y aceite.'] },
        },
    },
    {
        id: 'sausage-beans', minutes: 30, servings: 3, veggie: false, emoji: '🌭',
        tags: ['sausage', 'beans', 'tomato', 'onion', 'pepper'],
        text: {
            en: { title: 'Sausage & bean stew', ingredients: ['4 sausages', '1 can beans', '400 g chopped tomatoes', '1 onion, 1 pepper', 'Paprika'], steps: ['Brown sausages, slice them.', 'Soften onion and pepper, add paprika.', 'Add tomatoes, beans and sausages; simmer 15 minutes.'] },
            it: { title: 'Salsiccia e fagioli in umido', ingredients: ['4 salsicce', '1 lattina di fagioli', '400 g di pomodori a pezzi', '1 cipolla, 1 peperone', 'Paprika'], steps: ['Rosola le salsicce e tagliale a rondelle.', 'Appassisci cipolla e peperone, aggiungi la paprika.', 'Unisci pomodori, fagioli e salsicce; cuoci 15 minuti.'] },
            es: { title: 'Guiso de salchichas y alubias', ingredients: ['4 salchichas', '1 lata de alubias', '400 g de tomate troceado', '1 cebolla, 1 pimiento', 'Pimentón'], steps: ['Dora las salchichas y córtalas.', 'Pocha cebolla y pimiento, añade pimentón.', 'Agrega tomate, alubias y salchichas; cuece 15 minutos.'] },
        },
    },
    {
        id: 'ham-cheese-toastie', minutes: 8, servings: 1, veggie: false, emoji: '🥪',
        tags: ['ham', 'cheese', 'bread', 'butter'],
        text: {
            en: { title: 'Ham & cheese toastie', ingredients: ['2 slices bread', '2 slices ham', '40 g cheese', 'Butter'], steps: ['Butter the outsides of the bread.', 'Fill with ham and cheese.', 'Toast in a pan 3 minutes per side, pressing down.'] },
            it: { title: 'Toast prosciutto e formaggio', ingredients: ['2 fette di pane', '2 fette di prosciutto cotto', '40 g di formaggio', 'Burro'], steps: ['Imburra l\'esterno del pane.', 'Farcisci con prosciutto e formaggio.', 'Tosta in padella 3 minuti per lato, premendo.'] },
            es: { title: 'Sándwich mixto', ingredients: ['2 rebanadas de pan', '2 lonchas de jamón', '40 g de queso', 'Mantequilla'], steps: ['Unta mantequilla por fuera.', 'Rellena con jamón y queso.', 'Tuesta en sartén 3 minutos por lado, presionando.'] },
        },
    },
    {
        id: 'tofu-stirfry', minutes: 20, servings: 2, veggie: true, emoji: '🥢',
        tags: ['tofu', 'broccoli', 'pepper', 'carrot', 'garlic', 'rice'],
        text: {
            en: { title: 'Crispy tofu & greens', ingredients: ['300 g firm tofu', '2 cups broccoli, pepper or carrot', '1 garlic clove, ginger', 'Soy sauce, sesame oil', 'Rice'], steps: ['Cube and pat tofu dry; fry until golden on all sides.', 'Stir-fry vegetables with garlic and ginger 4 minutes.', 'Return tofu, add soy and sesame oil; serve with rice.'] },
            it: { title: 'Tofu croccante con verdure', ingredients: ['300 g di tofu compatto', '2 tazze di broccoli, peperoni o carote', '1 spicchio d\'aglio, zenzero', 'Salsa di soia, olio di sesamo', 'Riso'], steps: ['Taglia il tofu a cubetti, asciugalo e friggilo finché dorato.', 'Salta le verdure con aglio e zenzero 4 minuti.', 'Rimetti il tofu, aggiungi soia e sesamo; servi col riso.'] },
            es: { title: 'Tofu crujiente con verduras', ingredients: ['300 g de tofu firme', '2 tazas de brócoli, pimiento o zanahoria', '1 ajo, jengibre', 'Salsa de soja, aceite de sésamo', 'Arroz'], steps: ['Corta el tofu en dados, sécalo y dóralo.', 'Saltea las verduras con ajo y jengibre 4 minutos.', 'Añade el tofu, soja y sésamo; sirve con arroz.'] },
        },
    },
    {
        id: 'creamy-spinach-chicken', minutes: 25, servings: 2, veggie: false, emoji: '🍗',
        tags: ['chicken', 'spinach', 'cream', 'garlic', 'mushroom'],
        text: {
            en: { title: 'Creamy chicken & spinach', ingredients: ['2 chicken breasts', '150 ml cream', '2 handfuls spinach', 'Mushrooms (optional)', '1 garlic clove, parmesan'], steps: ['Season and sear chicken 5 minutes per side; set aside.', 'Soften garlic and mushrooms, pour in cream.', 'Add spinach and parmesan, return chicken and simmer 5 minutes.'] },
            it: { title: 'Pollo cremoso agli spinaci', ingredients: ['2 petti di pollo', '150 ml di panna', '2 manciate di spinaci', 'Funghi (facoltativi)', '1 spicchio d\'aglio, parmigiano'], steps: ['Condisci e rosola il pollo 5 minuti per lato; metti da parte.', 'Appassisci aglio e funghi, versa la panna.', 'Aggiungi spinaci e parmigiano, rimetti il pollo e cuoci 5 minuti.'] },
            es: { title: 'Pollo cremoso con espinacas', ingredients: ['2 pechugas de pollo', '150 ml de nata', '2 puñados de espinacas', 'Champiñones (opcional)', '1 ajo, parmesano'], steps: ['Sazona y dora el pollo 5 minutos por lado; reserva.', 'Sofríe ajo y champiñones, añade la nata.', 'Agrega espinacas y parmesano, vuelve el pollo y cuece 5 minutos.'] },
        },
    },
    {
        id: 'pork-apple', minutes: 25, servings: 2, veggie: false, emoji: '🥩',
        tags: ['pork', 'apple', 'onion', 'butter', 'potato'],
        text: {
            en: { title: 'Pork chops with apples', ingredients: ['2 pork chops', '2 apples', '1 onion', 'Butter, thyme', 'Mashed potatoes to serve'], steps: ['Sear chops 4 minutes per side, rest them.', 'In the same pan cook sliced onion and apple in butter 6 minutes.', 'Return the pork with the juices and serve.'] },
            it: { title: 'Braciole di maiale alle mele', ingredients: ['2 braciole di maiale', '2 mele', '1 cipolla', 'Burro, timo', 'Purè per servire'], steps: ['Rosola le braciole 4 minuti per lato e falle riposare.', 'Nella stessa padella cuoci cipolla e mele a fette nel burro 6 minuti.', 'Rimetti la carne col suo sugo e servi.'] },
            es: { title: 'Chuletas de cerdo con manzana', ingredients: ['2 chuletas de cerdo', '2 manzanas', '1 cebolla', 'Mantequilla, tomillo', 'Puré para acompañar'], steps: ['Dora las chuletas 4 minutos por lado y reserva.', 'En la misma sartén cocina cebolla y manzana en mantequilla 6 minutos.', 'Vuelve la carne con sus jugos y sirve.'] },
        },
    },
    {
        id: 'overnight-oats', minutes: 5, servings: 1, veggie: true, emoji: '🥣',
        tags: ['milk', 'yogurt', 'berries', 'banana', 'apple'],
        text: {
            en: { title: 'Overnight oats', ingredients: ['50 g oats', '120 ml milk', '2 tbsp yogurt', 'Any soft fruit', 'Honey'], steps: ['Mix oats, milk and yogurt in a jar.', 'Top with chopped fruit and honey.', 'Refrigerate overnight; eat cold.'] },
            it: { title: 'Overnight oats', ingredients: ['50 g di fiocchi d\'avena', '120 ml di latte', '2 cucchiai di yogurt', 'Frutta matura a piacere', 'Miele'], steps: ['Mescola avena, latte e yogurt in un barattolo.', 'Aggiungi frutta a pezzi e miele.', 'Lascia in frigo tutta la notte; mangia fredda.'] },
            es: { title: 'Avena nocturna', ingredients: ['50 g de copos de avena', '120 ml de leche', '2 cdas de yogur', 'Fruta madura', 'Miel'], steps: ['Mezcla avena, leche y yogur en un tarro.', 'Cubre con fruta troceada y miel.', 'Deja en la nevera toda la noche; cómela fría.'] },
        },
    },
    {
        id: 'cabbage-stirfry', minutes: 15, servings: 2, veggie: false, emoji: '🥬',
        tags: ['cabbage', 'bacon', 'onion', 'garlic', 'egg'],
        text: {
            en: { title: 'Cabbage with bacon', ingredients: ['1/2 cabbage', '100 g bacon', '1 onion', '1 garlic clove', 'Fried egg on top (optional)'], steps: ['Crisp the bacon, add sliced onion.', 'Add shredded cabbage and garlic; stir-fry 8 minutes.', 'Season and top with a fried egg.'] },
            it: { title: 'Cavolo saltato con pancetta', ingredients: ['1/2 cavolo', '100 g di pancetta', '1 cipolla', '1 spicchio d\'aglio', 'Uovo fritto sopra (facoltativo)'], steps: ['Rosola la pancetta, aggiungi la cipolla a fette.', 'Unisci il cavolo a striscioline e l\'aglio; salta 8 minuti.', 'Regola di sale e completa con un uovo fritto.'] },
            es: { title: 'Col salteada con panceta', ingredients: ['1/2 col', '100 g de panceta', '1 cebolla', '1 ajo', 'Huevo frito encima (opcional)'], steps: ['Dora la panceta y añade la cebolla.', 'Agrega la col en tiras y el ajo; saltea 8 minutos.', 'Sazona y corona con un huevo frito.'] },
        },
    },
];

export const recipeText = (r: Recipe, lang: string): Localized =>
    (r.text as Record<string, Localized | undefined>)[lang] ?? r.text.en;
