"""App Store Connect metadata for FreshCheck 2.0 in every language the app ships.

Run `python3 build.py` to validate the character limits and regenerate
metadata.json and one readable .md file per locale.
"""
import json
import pathlib

TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
PRIVACY_URL = "https://pierfrancescoamendola.github.io/FreshCheck/privacy.html"
SUPPORT_URL = "https://pierfrancescoamendola.github.io/FreshCheck/"

PRODUCTS = {
    "monthly": {"id": "com.anonymous.freshcheck.pro.monthly", "type": "auto-renewable", "duration": "1 month", "price_eur": "2.99"},
    "yearly": {"id": "com.anonymous.freshcheck.pro.yearly", "type": "auto-renewable", "duration": "1 year", "price_eur": "19.99"},
    "lifetime": {"id": "com.anonymous.freshcheck.pro.lifetime", "type": "non-consumable", "price_eur": "49.99"},
}
SUBSCRIPTION_GROUP = "FreshCheck Pro"

LIMITS = {
    "name": 30, "subtitle": 30, "promo": 170, "description": 4000, "keywords": 100, "whatsNew": 4000,
    "iap_name": 30, "iap_desc": 45, "group_name": 75,
}

L = {}

# ---------------------------------------------------------------- English (U.S.)
L["en-US"] = dict(
    app_lang="en",
    name="FreshCheck: Expiry Tracker",
    subtitle="Track food dates, waste less",
    promo="New: read expiry dates from a photo, recipes for what's ending, a shopping list and your savings stats. Everything stays on your phone.",
    keywords="expiration,date,best before,pantry,fridge,food,grocery,shopping list,waste,reminder,barcode,recipes",
    description=f"""FreshCheck tells you what's in your fridge and what needs eating first, before it ends up in the bin.

Scan a barcode, snap the printed date, and FreshCheck sorts your pantry by urgency: use today, next 3 days, this week, later on. A gentle reminder arrives before anything goes off.

SCAN, DON'T TYPE
• The barcode scanner finds the product name for you
• Read the expiry date straight from the package with your camera
• Quick picks and typical shelf-life suggestions for fresh food

KNOW WHAT'S ENDING
• Pantry sorted by expiry date, with clear colour cues
• Fridge, freezer, cupboard, and your own places
• Move an item to the freezer and get a new date automatically
• Mark items as opened, eaten or thrown away

COOK WHAT'S ENDING
• Recipes matched to the items that expire first
• Filters for quick and vegetarian meals
• Add missing ingredients to your shopping list in one tap

SHOPPING LIST
• Finished something? Put it on the list
• Share the list with anyone

YOUR IMPACT
• Money saved and wasted this month
• Waste rate, no-waste streak and 6-month history
• Badges for every milestone

REMINDERS THAT FIT YOU
• Choose when: a week before, the day before, on the day
• Morning digest of what expires today
• Weekly plan every Monday

PRIVATE BY DESIGN
No account, no servers, no tracking. Your items and history stay on your phone. Export a CSV or a backup whenever you want.

FRESHCHECK PRO
The free version includes up to 20 items, 3 date reads from photos and a selection of recipes. Pro unlocks:
• Unlimited items
• Unlimited date reading from photos
• Custom storage places
• Full savings history, charts and badges
• Every recipe, with filters
• Custom reminders, morning digest and weekly plan
• CSV export and backup
• Colour themes

Pro is available as a monthly or yearly subscription or as a one-time lifetime purchase. Payment is charged to your Apple Account at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. You can manage or cancel them in your App Store account settings.

Terms of Use: {TERMS_URL}
Privacy Policy: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 is rebuilt from the ground up.

• A brand-new design, with dark mode and colour themes
• Read expiry dates from a photo of the package
• Recipes matched to what expires first
• A shopping list you can share
• Impact: money saved, waste rate, streaks and badges
• Storage places: fridge, freezer, cupboard and your own
• Morning digest and weekly plan
• CSV export and backup
• Now available in 10 languages
• New FreshCheck Pro: monthly or yearly subscription, or lifetime""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Monthly", "All Pro features, billed every month"),
        "yearly": ("FreshCheck Pro Yearly", "All Pro features, billed every year"),
        "lifetime": ("FreshCheck Pro Lifetime", "All Pro features forever, pay once"),
    },
)

# ---------------------------------------------------------------- Italian
L["it"] = dict(
    app_lang="it",
    name="FreshCheck: Scadenze Cibo",
    subtitle="Zero sprechi, più risparmio",
    promo="Novità: leggi la scadenza da una foto, ricette per ciò che sta finendo, lista della spesa e statistiche sui risparmi. Tutto resta sul tuo telefono.",
    keywords="scadenza,scadenze,cibo,dispensa,frigo,spesa,lista spesa,spreco,promemoria,codice a barre,ricette",
    description=f"""FreshCheck ti dice cosa c'è in frigo e cosa va consumato per primo, prima che finisca nella spazzatura.

Scansiona il codice a barre, inquadra la data stampata e FreshCheck ordina la dispensa per urgenza: da usare oggi, nei prossimi 3 giorni, questa settimana, più avanti. Un promemoria discreto arriva prima che qualcosa scada.

SCANSIONA, NON SCRIVERE
• Il lettore di codici a barre trova il nome del prodotto per te
• Leggi la data di scadenza dalla confezione con la fotocamera
• Scelte rapide e durata tipica suggerita per i cibi freschi

SAPPI COSA STA SCADENDO
• Dispensa ordinata per scadenza, con colori chiari
• Frigo, freezer, credenza e i tuoi luoghi personalizzati
• Sposta un prodotto in freezer e ottieni subito una nuova data
• Segna i prodotti come aperti, mangiati o buttati

CUCINA CIÒ CHE STA FINENDO
• Ricette abbinate ai prodotti che scadono per primi
• Filtri per piatti veloci e vegetariani
• Aggiungi gli ingredienti mancanti alla lista con un tocco

LISTA DELLA SPESA
• Finito qualcosa? Mettilo in lista
• Condividi la lista con chi vuoi

IL TUO IMPATTO
• Soldi risparmiati e sprecati questo mese
• Tasso di spreco, serie senza sprechi e storico di 6 mesi
• Medaglie per ogni traguardo

PROMEMORIA SU MISURA
• Scegli quando: una settimana prima, il giorno prima, il giorno stesso
• Riepilogo mattutino di ciò che scade oggi
• Piano settimanale ogni lunedì

PRIVACY PRIMA DI TUTTO
Nessun account, nessun server, nessun tracciamento. Prodotti e storico restano sul tuo telefono. Esporta un CSV o un backup quando vuoi.

FRESHCHECK PRO
La versione gratuita include fino a 20 prodotti, 3 letture della data da foto e una selezione di ricette. Pro sblocca:
• Prodotti illimitati
• Lettura illimitata della data da foto
• Luoghi di conservazione personalizzati
• Storico completo dei risparmi, grafici e medaglie
• Tutte le ricette, con filtri
• Promemoria personalizzati, riepilogo mattutino e piano settimanale
• Esportazione CSV e backup
• Temi colore

Pro è disponibile con abbonamento mensile o annuale oppure con un acquisto unico a vita. Il pagamento viene addebitato sul tuo Account Apple alla conferma dell'acquisto. Gli abbonamenti si rinnovano automaticamente se non vengono disdetti almeno 24 ore prima della fine del periodo in corso. Puoi gestirli o disdirli nelle impostazioni del tuo account App Store.

Termini d'uso: {TERMS_URL}
Informativa sulla privacy: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 è stata ricostruita da zero.

• Un design completamente nuovo, con modalità scura e temi colore
• Leggi la data di scadenza da una foto della confezione
• Ricette abbinate a ciò che scade per primo
• Lista della spesa da condividere
• Impatto: soldi risparmiati, tasso di spreco, serie e medaglie
• Luoghi di conservazione: frigo, freezer, credenza e i tuoi
• Riepilogo mattutino e piano settimanale
• Esportazione CSV e backup
• Ora disponibile in 10 lingue
• Nuovo FreshCheck Pro: abbonamento mensile o annuale, oppure a vita""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Mensile", "Tutte le funzioni Pro, addebito mensile"),
        "yearly": ("FreshCheck Pro Annuale", "Tutte le funzioni Pro, addebito annuale"),
        "lifetime": ("FreshCheck Pro a vita", "Tutto Pro per sempre, paghi una volta"),
    },
)

# ---------------------------------------------------------------- Spanish (Spain)
L["es-ES"] = dict(
    app_lang="es",
    name="FreshCheck: Control Caducidad",
    subtitle="Caducidades y cero desperdicio",
    promo="Novedad: lee la fecha de caducidad desde una foto, recetas con lo que se acaba, lista de la compra y estadísticas de ahorro. Todo se queda en tu móvil.",
    keywords="caducidad,consumo preferente,despensa,nevera,comida,lista compra,desperdicio,recordatorio,recetas",
    description=f"""FreshCheck te dice qué hay en tu nevera y qué debes comer primero, antes de que acabe en la basura.

Escanea el código de barras, fotografía la fecha impresa y FreshCheck ordena tu despensa por urgencia: usar hoy, próximos 3 días, esta semana, más adelante. Un aviso discreto llega antes de que algo caduque.

ESCANEA, NO ESCRIBAS
• El lector de códigos de barras encuentra el nombre del producto por ti
• Lee la fecha de caducidad del envase con la cámara
• Fechas rápidas y duración típica sugerida para alimentos frescos

SABE QUÉ SE ACABA
• Despensa ordenada por caducidad, con colores claros
• Nevera, congelador, armario y tus propios lugares
• Pasa un producto al congelador y obtén una nueva fecha al instante
• Marca productos como abiertos, comidos o tirados

COCINA LO QUE SE ACABA
• Recetas basadas en lo que caduca primero
• Filtros para platos rápidos y vegetarianos
• Añade los ingredientes que faltan a la lista con un toque

LISTA DE LA COMPRA
• ¿Se ha terminado algo? Añádelo a la lista
• Comparte la lista con quien quieras

TU IMPACTO
• Dinero ahorrado y desperdiciado este mes
• Tasa de desperdicio, racha sin desperdicio e historial de 6 meses
• Insignias para cada logro

RECORDATORIOS A TU MEDIDA
• Elige cuándo: una semana antes, el día antes, el mismo día
• Resumen matinal de lo que caduca hoy
• Plan semanal cada lunes

PRIVACIDAD ANTE TODO
Sin cuenta, sin servidores, sin rastreo. Tus productos y tu historial se quedan en tu móvil. Exporta un CSV o una copia de seguridad cuando quieras.

FRESHCHECK PRO
La versión gratuita incluye hasta 20 productos, 3 lecturas de fecha desde foto y una selección de recetas. Pro desbloquea:
• Productos ilimitados
• Lectura ilimitada de fechas desde foto
• Lugares de almacenamiento propios
• Historial completo de ahorro, gráficos e insignias
• Todas las recetas, con filtros
• Recordatorios personalizados, resumen matinal y plan semanal
• Exportación CSV y copia de seguridad
• Temas de color

Pro está disponible como suscripción mensual o anual o como compra única de por vida. El pago se carga en tu cuenta de Apple al confirmar la compra. Las suscripciones se renuevan automáticamente salvo que se cancelen al menos 24 horas antes del final del periodo actual. Puedes gestionarlas o cancelarlas en los ajustes de tu cuenta del App Store.

Condiciones de uso: {TERMS_URL}
Política de privacidad: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 se ha rehecho desde cero.

• Un diseño totalmente nuevo, con modo oscuro y temas de color
• Lee la fecha de caducidad desde una foto del envase
• Recetas basadas en lo que caduca primero
• Lista de la compra que puedes compartir
• Impacto: dinero ahorrado, tasa de desperdicio, rachas e insignias
• Lugares: nevera, congelador, armario y los tuyos
• Resumen matinal y plan semanal
• Exportación CSV y copia de seguridad
• Ahora disponible en 10 idiomas
• Nuevo FreshCheck Pro: suscripción mensual o anual, o de por vida""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Mensual", "Todas las funciones Pro, pago mensual"),
        "yearly": ("FreshCheck Pro Anual", "Todas las funciones Pro, pago anual"),
        "lifetime": ("FreshCheck Pro de por vida", "Todo Pro para siempre, con un único pago"),
    },
)

# ---------------------------------------------------------------- French
L["fr-FR"] = dict(
    app_lang="fr",
    name="FreshCheck: Anti-gaspi Frigo",
    subtitle="Dates limites, zéro gaspillage",
    promo="Nouveau : lisez la date limite sur une photo, des recettes avec ce qui se termine, une liste de courses et vos économies. Tout reste sur votre téléphone.",
    keywords="péremption,DLC,DDM,date limite,frigo,courses,liste de courses,gaspillage,rappel,code-barres,recettes",
    description=f"""FreshCheck vous dit ce qu'il y a dans votre frigo et ce qu'il faut manger en premier, avant que ça finisse à la poubelle.

Scannez le code-barres, photographiez la date imprimée et FreshCheck trie vos produits par urgence : à consommer aujourd'hui, dans les 3 jours, cette semaine, plus tard. Un rappel discret arrive avant que quoi que ce soit ne se perde.

SCANNEZ, NE TAPEZ PLUS
• Le lecteur de code-barres trouve le nom du produit pour vous
• Lisez la date limite directement sur l'emballage avec l'appareil photo
• Dates rapides et durée de conservation typique pour les produits frais

SACHEZ CE QUI SE TERMINE
• Produits triés par date limite, avec des couleurs claires
• Frigo, congélateur, placard et vos propres emplacements
• Passez un produit au congélateur et obtenez une nouvelle date automatiquement
• Marquez vos produits comme ouverts, mangés ou jetés

CUISINEZ CE QUI SE TERMINE
• Recettes associées aux produits qui expirent en premier
• Filtres pour les plats rapides et végétariens
• Ajoutez les ingrédients manquants à la liste en un geste

LISTE DE COURSES
• Un produit terminé ? Ajoutez-le à la liste
• Partagez la liste avec qui vous voulez

VOTRE IMPACT
• Argent économisé et gaspillé ce mois-ci
• Taux de gaspillage, série sans gaspillage et historique sur 6 mois
• Badges pour chaque étape franchie

DES RAPPELS À VOTRE RYTHME
• Choisissez quand : une semaine avant, la veille, le jour même
• Résumé du matin de ce qui expire aujourd'hui
• Programme de la semaine chaque lundi

CONFIDENTIEL PAR NATURE
Pas de compte, pas de serveur, pas de pistage. Vos produits et votre historique restent sur votre téléphone. Exportez un CSV ou une sauvegarde quand vous le souhaitez.

FRESHCHECK PRO
La version gratuite comprend jusqu'à 20 produits, 3 lectures de date sur photo et une sélection de recettes. Pro débloque :
• Produits illimités
• Lecture illimitée des dates sur photo
• Emplacements de rangement personnalisés
• Historique complet des économies, graphiques et badges
• Toutes les recettes, avec filtres
• Rappels personnalisés, résumé du matin et programme de la semaine
• Export CSV et sauvegarde
• Thèmes de couleur

Pro est disponible en abonnement mensuel ou annuel ou en achat unique à vie. Le paiement est débité sur votre compte Apple à la confirmation de l'achat. Les abonnements se renouvellent automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours. Vous pouvez les gérer ou les résilier dans les réglages de votre compte App Store.

Conditions d'utilisation : {TERMS_URL}
Politique de confidentialité : {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 a été entièrement repensée.

• Un tout nouveau design, avec mode sombre et thèmes de couleur
• Lisez la date limite sur une photo de l'emballage
• Recettes associées à ce qui expire en premier
• Une liste de courses à partager
• Impact : argent économisé, taux de gaspillage, séries et badges
• Emplacements : frigo, congélateur, placard et les vôtres
• Résumé du matin et programme de la semaine
• Export CSV et sauvegarde
• Désormais disponible en 10 langues
• Nouveau FreshCheck Pro : abonnement mensuel ou annuel, ou à vie""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Mensuel", "Tout Pro, facturé chaque mois"),
        "yearly": ("FreshCheck Pro Annuel", "Tout Pro, facturé chaque année"),
        "lifetime": ("FreshCheck Pro à vie", "Tout Pro pour toujours, en un seul achat"),
    },
)

# ---------------------------------------------------------------- German
L["de-DE"] = dict(
    app_lang="de",
    name="FreshCheck: Haltbarkeit & MHD",
    subtitle="Essen retten, Geld sparen",
    promo="Neu: Ablaufdatum per Foto erkennen, Rezepte für das, was bald abläuft, Einkaufsliste und deine Spar-Bilanz. Alles bleibt auf deinem Handy.",
    keywords="mindesthaltbarkeit,ablaufdatum,haltbarkeit,vorrat,kühlschrank,einkaufsliste,lebensmittel,rezepte",
    description=f"""FreshCheck zeigt dir, was in deinem Kühlschrank ist und was zuerst gegessen werden muss, bevor es im Müll landet.

Barcode scannen, aufgedrucktes Datum fotografieren, und FreshCheck sortiert deinen Vorrat nach Dringlichkeit: heute verbrauchen, nächste 3 Tage, diese Woche, später. Eine sanfte Erinnerung kommt, bevor etwas schlecht wird.

SCANNEN STATT TIPPEN
• Der Barcode-Scanner findet den Produktnamen für dich
• Lies das Mindesthaltbarkeitsdatum direkt mit der Kamera von der Verpackung
• Schnellauswahl und typische Haltbarkeit für frische Lebensmittel

WISSEN, WAS BALD ABLÄUFT
• Vorrat nach Ablaufdatum sortiert, mit klaren Farben
• Kühlschrank, Gefrierfach, Vorratsschrank und eigene Orte
• Ins Gefrierfach verschieben und automatisch ein neues Datum erhalten
• Artikel als geöffnet, gegessen oder weggeworfen markieren

KOCHEN, WAS BALD ABLÄUFT
• Rezepte passend zu dem, was zuerst abläuft
• Filter für schnelle und vegetarische Gerichte
• Fehlende Zutaten mit einem Tipp auf die Einkaufsliste

EINKAUFSLISTE
• Etwas aufgebraucht? Ab auf die Liste
• Teile die Liste mit anderen

DEINE BILANZ
• Gespartes und verschwendetes Geld in diesem Monat
• Verschwendungsquote, Serie ohne Verschwendung und 6-Monats-Verlauf
• Abzeichen für jeden Meilenstein

ERINNERUNGEN NACH DEINEM TAKT
• Du entscheidest: eine Woche vorher, am Vortag, am selben Tag
• Morgenübersicht mit allem, was heute abläuft
• Wochenplan jeden Montag

PRIVAT VON GRUND AUF
Kein Konto, keine Server, kein Tracking. Deine Artikel und dein Verlauf bleiben auf deinem Handy. Exportiere jederzeit eine CSV-Datei oder ein Backup.

FRESHCHECK PRO
Die kostenlose Version umfasst bis zu 20 Artikel, 3 Datumserkennungen per Foto und eine Auswahl an Rezepten. Pro schaltet frei:
• Unbegrenzte Artikel
• Unbegrenzte Datumserkennung per Foto
• Eigene Lagerorte
• Vollständiger Spar-Verlauf, Diagramme und Abzeichen
• Alle Rezepte, mit Filtern
• Eigene Erinnerungen, Morgenübersicht und Wochenplan
• CSV-Export und Backup
• Farbthemen

Pro gibt es als Monats- oder Jahresabo oder als einmaligen Kauf auf Lebenszeit. Die Zahlung wird bei Kaufbestätigung über deinen Apple Account abgerechnet. Abos verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ende des aktuellen Zeitraums gekündigt werden. Du kannst sie in den Einstellungen deines App Store-Accounts verwalten oder kündigen.

Nutzungsbedingungen: {TERMS_URL}
Datenschutzerklärung: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 wurde komplett neu entwickelt.

• Ganz neues Design, mit Dunkelmodus und Farbthemen
• Ablaufdatum per Foto von der Verpackung erkennen
• Rezepte passend zu dem, was zuerst abläuft
• Einkaufsliste zum Teilen
• Bilanz: gespartes Geld, Verschwendungsquote, Serien und Abzeichen
• Lagerorte: Kühlschrank, Gefrierfach, Vorratsschrank und eigene
• Morgenübersicht und Wochenplan
• CSV-Export und Backup
• Jetzt in 10 Sprachen verfügbar
• Neu: FreshCheck Pro als Monatsabo, Jahresabo oder auf Lebenszeit""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Monatlich", "Alle Pro-Funktionen, monatlich"),
        "yearly": ("FreshCheck Pro Jährlich", "Alle Pro-Funktionen, jährlich"),
        "lifetime": ("FreshCheck Pro Lebenslang", "Alle Pro-Funktionen für immer, einmal zahlen"),
    },
)

# ---------------------------------------------------------------- Portuguese (Brazil)
L["pt-BR"] = dict(
    app_lang="pt",
    name="FreshCheck: Controle Validade",
    subtitle="Desperdice menos, economize",
    promo="Novidade: leia a validade por uma foto, receitas com o que está acabando, lista de compras e estatísticas de economia. Tudo fica no seu celular.",
    keywords="validade,vencimento,despensa,geladeira,alimentos,lista de compras,desperdício,lembrete,receitas",
    description=f"""O FreshCheck mostra o que tem na sua geladeira e o que precisa ser consumido primeiro, antes que vá parar no lixo.

Escaneie o código de barras, fotografe a data impressa e o FreshCheck organiza sua despensa por urgência: usar hoje, próximos 3 dias, esta semana, mais tarde. Um lembrete gentil chega antes que algo estrague.

ESCANEIE, NÃO DIGITE
• O leitor de código de barras encontra o nome do produto para você
• Leia a data de validade direto da embalagem com a câmera
• Datas rápidas e validade típica sugerida para alimentos frescos

SAIBA O QUE ESTÁ ACABANDO
• Despensa ordenada pela validade, com cores claras
• Geladeira, freezer, armário e seus próprios locais
• Mova um item para o freezer e ganhe uma nova data automaticamente
• Marque itens como abertos, consumidos ou descartados

COZINHE O QUE ESTÁ ACABANDO
• Receitas combinadas com o que vence primeiro
• Filtros para pratos rápidos e vegetarianos
• Adicione os ingredientes que faltam à lista com um toque

LISTA DE COMPRAS
• Acabou alguma coisa? Coloque na lista
• Compartilhe a lista com quem quiser

SEU IMPACTO
• Dinheiro economizado e desperdiçado neste mês
• Taxa de desperdício, sequência sem desperdício e histórico de 6 meses
• Conquistas para cada marco

LEMBRETES DO SEU JEITO
• Escolha quando: uma semana antes, na véspera, no próprio dia
• Resumo matinal do que vence hoje
• Plano semanal toda segunda-feira

PRIVACIDADE EM PRIMEIRO LUGAR
Sem conta, sem servidores, sem rastreamento. Seus itens e seu histórico ficam no seu celular. Exporte um CSV ou um backup quando quiser.

FRESHCHECK PRO
A versão gratuita inclui até 20 itens, 3 leituras de data por foto e uma seleção de receitas. O Pro libera:
• Itens ilimitados
• Leitura ilimitada de datas por foto
• Locais de armazenamento personalizados
• Histórico completo de economia, gráficos e conquistas
• Todas as receitas, com filtros
• Lembretes personalizados, resumo matinal e plano semanal
• Exportação CSV e backup
• Temas de cor

O Pro está disponível como assinatura mensal ou anual ou como compra única vitalícia. O pagamento é cobrado na sua Conta Apple na confirmação da compra. As assinaturas são renovadas automaticamente, a menos que sejam canceladas pelo menos 24 horas antes do fim do período atual. Você pode gerenciá-las ou cancelá-las nos ajustes da sua conta da App Store.

Termos de uso: {TERMS_URL}
Política de privacidade: {PRIVACY_URL}""",
    whatsNew="""O FreshCheck 2.0 foi refeito do zero.

• Um design totalmente novo, com modo escuro e temas de cor
• Leia a validade por uma foto da embalagem
• Receitas combinadas com o que vence primeiro
• Lista de compras para compartilhar
• Impacto: dinheiro economizado, taxa de desperdício, sequências e conquistas
• Locais: geladeira, freezer, armário e os seus
• Resumo matinal e plano semanal
• Exportação CSV e backup
• Agora disponível em 10 idiomas
• Novo FreshCheck Pro: assinatura mensal ou anual, ou vitalício""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Mensal", "Todos os recursos Pro, cobrança mensal"),
        "yearly": ("FreshCheck Pro Anual", "Todos os recursos Pro, cobrança anual"),
        "lifetime": ("FreshCheck Pro Vitalício", "Todo o Pro para sempre, pague uma vez"),
    },
)

# ---------------------------------------------------------------- Dutch
L["nl-NL"] = dict(
    app_lang="nl",
    name="FreshCheck: Houdbaarheid",
    subtitle="Verspil minder, bespaar meer",
    promo="Nieuw: lees de houdbaarheidsdatum van een foto, recepten met wat bijna op is, een boodschappenlijst en je besparingen. Alles blijft op je telefoon.",
    keywords="houdbaarheid,THT,datum,voorraad,koelkast,boodschappenlijst,verspilling,herinnering,barcode,recepten",
    description=f"""FreshCheck laat zien wat er in je koelkast ligt en wat als eerste op moet, voordat het in de prullenbak belandt.

Scan de barcode, fotografeer de gedrukte datum en FreshCheck sorteert je voorraad op urgentie: vandaag gebruiken, komende 3 dagen, deze week, later. Een vriendelijke herinnering komt voordat iets bederft.

SCANNEN IN PLAATS VAN TYPEN
• De barcodescanner vindt de productnaam voor je
• Lees de houdbaarheidsdatum met je camera direct van de verpakking
• Snelle keuzes en gangbare houdbaarheid voor vers eten

WETEN WAT BIJNA OP IS
• Voorraad gesorteerd op datum, met duidelijke kleuren
• Koelkast, vriezer, voorraadkast en je eigen plekken
• Zet iets in de vriezer en krijg automatisch een nieuwe datum
• Markeer producten als geopend, opgegeten of weggegooid

KOKEN MET WAT BIJNA OP IS
• Recepten die passen bij wat het eerst verloopt
• Filters voor snelle en vegetarische gerechten
• Voeg ontbrekende ingrediënten met één tik toe aan je lijst

BOODSCHAPPENLIJST
• Iets op? Zet het op de lijst
• Deel de lijst met wie je wilt

JOUW IMPACT
• Geld bespaard en verspild deze maand
• Verspillingspercentage, reeks zonder verspilling en 6 maanden historie
• Badges voor elke mijlpaal

HERINNERINGEN OP JOUW MANIER
• Kies wanneer: een week vooraf, de dag ervoor, op de dag zelf
• Ochtendoverzicht van wat vandaag verloopt
• Weekplanning elke maandag

PRIVÉ VANAF HET BEGIN
Geen account, geen servers, geen tracking. Je producten en historie blijven op je telefoon. Exporteer een CSV of back-up wanneer je wilt.

FRESHCHECK PRO
De gratis versie bevat maximaal 20 producten, 3 keer een datum lezen van een foto en een selectie recepten. Pro ontgrendelt:
• Onbeperkt producten
• Onbeperkt datums lezen van foto's
• Eigen bewaarplekken
• Volledige bespaarhistorie, grafieken en badges
• Alle recepten, met filters
• Eigen herinneringen, ochtendoverzicht en weekplanning
• CSV-export en back-up
• Kleurthema's

Pro is beschikbaar als maand- of jaarabonnement of als eenmalige aankoop voor altijd. De betaling wordt bij bevestiging van de aankoop via je Apple Account in rekening gebracht. Abonnementen worden automatisch verlengd, tenzij ze ten minste 24 uur voor het einde van de huidige periode worden opgezegd. Je kunt ze beheren of opzeggen in de instellingen van je App Store-account.

Gebruiksvoorwaarden: {TERMS_URL}
Privacybeleid: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 is volledig opnieuw gebouwd.

• Een gloednieuw ontwerp, met donkere modus en kleurthema's
• Lees de houdbaarheidsdatum van een foto van de verpakking
• Recepten bij wat het eerst verloopt
• Een boodschappenlijst om te delen
• Impact: geld bespaard, verspillingspercentage, reeksen en badges
• Bewaarplekken: koelkast, vriezer, voorraadkast en je eigen plekken
• Ochtendoverzicht en weekplanning
• CSV-export en back-up
• Nu beschikbaar in 10 talen
• Nieuw FreshCheck Pro: maand- of jaarabonnement, of voor altijd""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Maandelijks", "Alle Pro-functies, per maand betaald"),
        "yearly": ("FreshCheck Pro Jaarlijks", "Alle Pro-functies, per jaar betaald"),
        "lifetime": ("FreshCheck Pro Voor altijd", "Alles van Pro voor altijd, één keer betalen"),
    },
)

# ---------------------------------------------------------------- Polish
L["pl"] = dict(
    app_lang="pl",
    name="FreshCheck: Daty Ważności",
    subtitle="Nie marnuj jedzenia",
    promo="Nowość: odczyt daty ważności ze zdjęcia, przepisy z tego, co się kończy, lista zakupów i statystyki oszczędności. Wszystko zostaje w Twoim telefonie.",
    keywords="data ważności,termin,spiżarnia,lodówka,jedzenie,lista zakupów,marnowanie,przypomnienie,przepisy",
    description=f"""FreshCheck pokazuje, co masz w lodówce i co trzeba zjeść najpierw, zanim trafi do kosza.

Zeskanuj kod kreskowy, zrób zdjęcie nadrukowanej daty, a FreshCheck uporządkuje Twoje zapasy według pilności: zużyj dziś, najbliższe 3 dni, ten tydzień, później. Delikatne przypomnienie przyjdzie, zanim coś się zepsuje.

SKANUJ, NIE WPISUJ
• Skaner kodów kreskowych sam znajdzie nazwę produktu
• Odczytaj datę ważności prosto z opakowania aparatem
• Szybki wybór dat i typowy czas przechowywania świeżej żywności

WIEDZ, CO SIĘ KOŃCZY
• Zapasy posortowane według daty, z czytelnymi kolorami
• Lodówka, zamrażarka, szafka i Twoje własne miejsca
• Przenieś produkt do zamrażarki i automatycznie otrzymaj nową datę
• Oznaczaj produkty jako otwarte, zjedzone lub wyrzucone

GOTUJ Z TEGO, CO SIĘ KOŃCZY
• Przepisy dopasowane do produktów, które tracą ważność najszybciej
• Filtry dań szybkich i wegetariańskich
• Dodaj brakujące składniki do listy jednym dotknięciem

LISTA ZAKUPÓW
• Coś się skończyło? Dodaj to do listy
• Udostępnij listę, komu chcesz

TWÓJ WPŁYW
• Pieniądze zaoszczędzone i zmarnowane w tym miesiącu
• Wskaźnik marnowania, seria bez marnowania i historia z 6 miesięcy
• Odznaki za każdy kamień milowy

PRZYPOMNIENIA NA TWOICH WARUNKACH
• Wybierz kiedy: tydzień wcześniej, dzień wcześniej, tego samego dnia
• Poranne podsumowanie tego, co traci ważność dziś
• Plan tygodnia w każdy poniedziałek

PRYWATNOŚĆ OD PODSTAW
Bez konta, bez serwerów, bez śledzenia. Twoje produkty i historia zostają w telefonie. Eksportuj plik CSV lub kopię zapasową, kiedy chcesz.

FRESHCHECK PRO
Wersja bezpłatna obejmuje do 20 produktów, 3 odczyty daty ze zdjęcia i wybrane przepisy. Pro odblokowuje:
• Nieograniczoną liczbę produktów
• Nieograniczony odczyt dat ze zdjęć
• Własne miejsca przechowywania
• Pełną historię oszczędności, wykresy i odznaki
• Wszystkie przepisy z filtrami
• Własne przypomnienia, poranne podsumowanie i plan tygodnia
• Eksport CSV i kopię zapasową
• Motywy kolorów

Pro jest dostępne w subskrypcji miesięcznej lub rocznej albo jako jednorazowy zakup dożywotni. Płatność jest pobierana z Konta Apple po potwierdzeniu zakupu. Subskrypcje odnawiają się automatycznie, jeśli nie zostaną anulowane co najmniej 24 godziny przed końcem bieżącego okresu. Możesz nimi zarządzać lub je anulować w ustawieniach konta App Store.

Warunki korzystania: {TERMS_URL}
Polityka prywatności: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0 została zbudowana od nowa.

• Zupełnie nowy wygląd, z trybem ciemnym i motywami kolorów
• Odczyt daty ważności ze zdjęcia opakowania
• Przepisy dopasowane do tego, co traci ważność najszybciej
• Lista zakupów do udostępniania
• Wpływ: zaoszczędzone pieniądze, wskaźnik marnowania, serie i odznaki
• Miejsca: lodówka, zamrażarka, szafka i Twoje własne
• Poranne podsumowanie i plan tygodnia
• Eksport CSV i kopia zapasowa
• Teraz w 10 językach
• Nowe FreshCheck Pro: subskrypcja miesięczna lub roczna albo dożywotnio""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro Miesięcznie", "Wszystkie funkcje Pro, płatność co miesiąc"),
        "yearly": ("FreshCheck Pro Rocznie", "Wszystkie funkcje Pro, płatność co rok"),
        "lifetime": ("FreshCheck Pro Dożywotnio", "Pro na zawsze, jednorazowa płatność"),
    },
)

# ---------------------------------------------------------------- Japanese
L["ja"] = dict(
    app_lang="ja",
    name="FreshCheck: 賞味期限管理",
    subtitle="食品ロスを減らして節約",
    promo="新機能：写真から期限を読み取り、期限が近い食品で作れるレシピ、買い物リスト、節約の記録。データはすべてあなたのiPhoneの中だけに保存されます。",
    keywords="賞味期限,消費期限,食品管理,冷蔵庫,在庫,買い物リスト,食品ロス,リマインダー,バーコード,レシピ,節約,期限切れ",
    description=f"""FreshCheckは、冷蔵庫に何があって、どれを先に食べるべきかを教えてくれるアプリです。捨ててしまう前に、気づけます。

バーコードをスキャンして、印字された日付を撮影するだけ。FreshCheckが食品を緊急度順に並べます：今日使う、3日以内、今週中、それ以降。期限が来る前にさりげなくお知らせします。

入力せずにスキャン
• バーコードスキャナーが商品名を自動で検索
• カメラでパッケージから期限を直接読み取り
• クイック選択と、生鮮食品の目安日数を提案

期限が近いものがひと目でわかる
• 期限順に並び、色で状態がすぐわかる
• 冷蔵庫・冷凍庫・食品棚、そして自分で作った場所
• 冷凍庫に移すと新しい期限を自動で設定
• 開封済み・食べた・捨てたを記録

期限が近い食品で料理
• 先に期限が来る食品に合わせたレシピ
• 時短・ベジタリアンのフィルター
• 足りない材料をワンタップで買い物リストへ

買い物リスト
• 使い切ったらリストに追加
• リストを家族や友人と共有

あなたの成果
• 今月節約した金額と無駄にした金額
• 廃棄率、ムダなし連続日数、6か月の履歴
• 節目ごとにバッジを獲得

あなたに合わせた通知
• タイミングを選択：1週間前、前日、当日
• 今日期限の食品をまとめた朝のお知らせ
• 毎週月曜日の週間プラン

プライバシー重視の設計
アカウント不要、サーバーなし、トラッキングなし。食品と履歴はあなたのiPhoneの中だけに保存されます。CSVやバックアップはいつでも書き出せます。

FRESHCHECK PRO
無料版では、食品20件まで、写真からの日付読み取り3回、一部のレシピを利用できます。Proでは以下が使えます：
• 食品数無制限
• 写真からの日付読み取り無制限
• 保存場所のカスタマイズ
• 節約の全履歴、グラフ、バッジ
• すべてのレシピとフィルター
• カスタム通知、朝のお知らせ、週間プラン
• CSV書き出しとバックアップ
• カラーテーマ

Proは月額または年額のサブスクリプション、または買い切りでご利用いただけます。お支払いは購入確定時にApple Accountに請求されます。サブスクリプションは、現在の期間終了の24時間前までにキャンセルしない限り自動更新されます。App Storeのアカウント設定から管理・キャンセルできます。

利用規約：{TERMS_URL}
プライバシーポリシー：{PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0は、ゼロから作り直しました。

• まったく新しいデザイン、ダークモードとカラーテーマに対応
• パッケージの写真から期限を読み取り
• 先に期限が来る食品に合わせたレシピ
• 共有できる買い物リスト
• 成果：節約額、廃棄率、連続記録、バッジ
• 保存場所：冷蔵庫・冷凍庫・食品棚、そして自分の場所
• 朝のお知らせと週間プラン
• CSV書き出しとバックアップ
• 10言語に対応
• 新しいFreshCheck Pro：月額・年額のサブスクリプション、または買い切り""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro 月額", "すべてのPro機能を毎月のお支払いで"),
        "yearly": ("FreshCheck Pro 年額", "すべてのPro機能を毎年のお支払いで"),
        "lifetime": ("FreshCheck Pro 買い切り", "すべてのPro機能をずっと、1回のお支払いで"),
    },
)

# ---------------------------------------------------------------- Korean
L["ko"] = dict(
    app_lang="ko",
    name="FreshCheck: 유통기한 관리",
    subtitle="음식물 낭비 줄이고 절약하기",
    promo="새 기능: 사진으로 유통기한 읽기, 곧 기한이 끝나는 식품으로 만드는 레시피, 장보기 목록, 절약 통계. 모든 데이터는 내 휴대폰에만 저장됩니다.",
    keywords="유통기한,소비기한,냉장고,식품관리,재고,장보기,쇼핑리스트,음식물쓰레기,알림,바코드,레시피,절약",
    description=f"""FreshCheck는 냉장고에 무엇이 있고 무엇을 먼저 먹어야 하는지 알려 줍니다. 버려지기 전에요.

바코드를 스캔하고 인쇄된 날짜를 찍기만 하면 FreshCheck가 식품을 급한 순서대로 정리합니다: 오늘 사용, 3일 이내, 이번 주, 그 이후. 상하기 전에 부드럽게 알려 드립니다.

입력 대신 스캔
• 바코드 스캐너가 제품 이름을 찾아 줍니다
• 카메라로 포장지의 유통기한을 바로 읽기
• 빠른 날짜 선택과 신선식품 보관 기간 추천

곧 끝나는 식품을 한눈에
• 유통기한 순 정렬과 알아보기 쉬운 색상
• 냉장고, 냉동실, 찬장, 그리고 나만의 장소
• 냉동실로 옮기면 새 날짜가 자동으로 설정
• 개봉, 먹음, 버림으로 표시

곧 끝나는 식품으로 요리
• 기한이 가장 먼저 끝나는 식품에 맞춘 레시피
• 간단 요리와 채식 필터
• 부족한 재료를 한 번에 장보기 목록에 추가

장보기 목록
• 다 먹었나요? 목록에 추가하세요
• 누구와도 목록 공유

나의 성과
• 이번 달 절약한 금액과 낭비한 금액
• 낭비율, 낭비 없는 연속 기록, 6개월 기록
• 단계마다 배지 획득

나에게 맞춘 알림
• 시점 선택: 일주일 전, 하루 전, 당일
• 오늘 기한이 끝나는 식품을 알려 주는 아침 요약
• 매주 월요일 주간 계획

처음부터 프라이버시 중심
계정, 서버, 추적이 없습니다. 식품과 기록은 내 휴대폰에만 저장됩니다. 언제든지 CSV나 백업으로 내보낼 수 있습니다.

FRESHCHECK PRO
무료 버전에서는 식품 20개, 사진으로 날짜 읽기 3회, 일부 레시피를 이용할 수 있습니다. Pro에서는:
• 식품 무제한
• 사진으로 날짜 읽기 무제한
• 나만의 보관 장소
• 전체 절약 기록, 차트, 배지
• 모든 레시피와 필터
• 맞춤 알림, 아침 요약, 주간 계획
• CSV 내보내기 및 백업
• 컬러 테마

Pro는 월간 또는 연간 구독, 또는 평생 이용권 일회 구매로 이용할 수 있습니다. 결제는 구매 확인 시 Apple 계정으로 청구됩니다. 구독은 현재 기간이 끝나기 최소 24시간 전에 취소하지 않으면 자동으로 갱신됩니다. App Store 계정 설정에서 관리하거나 취소할 수 있습니다.

이용 약관: {TERMS_URL}
개인정보 처리방침: {PRIVACY_URL}""",
    whatsNew="""FreshCheck 2.0을 처음부터 새로 만들었습니다.

• 완전히 새로운 디자인, 다크 모드와 컬러 테마 지원
• 포장지 사진으로 유통기한 읽기
• 기한이 가장 먼저 끝나는 식품에 맞춘 레시피
• 공유할 수 있는 장보기 목록
• 성과: 절약 금액, 낭비율, 연속 기록, 배지
• 보관 장소: 냉장고, 냉동실, 찬장, 나만의 장소
• 아침 요약과 주간 계획
• CSV 내보내기 및 백업
• 이제 10개 언어 지원
• 새로운 FreshCheck Pro: 월간·연간 구독 또는 평생 이용권""",
    group_name="FreshCheck Pro",
    iap={
        "monthly": ("FreshCheck Pro 월간", "모든 Pro 기능, 매월 결제"),
        "yearly": ("FreshCheck Pro 연간", "모든 Pro 기능, 매년 결제"),
        "lifetime": ("FreshCheck Pro 평생", "모든 Pro 기능을 평생, 한 번만 결제"),
    },
)


def check():
    errors = []
    for loc, d in L.items():
        for key in ("name", "subtitle", "promo", "description", "keywords", "whatsNew"):
            if len(d[key]) > LIMITS[key]:
                errors.append(f"{loc}.{key}: {len(d[key])} > {LIMITS[key]}")
        if len(d["group_name"]) > LIMITS["group_name"]:
            errors.append(f"{loc}.group_name too long")
        for kind, (name, desc) in d["iap"].items():
            if len(name) > LIMITS["iap_name"]:
                errors.append(f"{loc}.iap.{kind}.name: {len(name)} > {LIMITS['iap_name']}")
            if len(desc) > LIMITS["iap_desc"]:
                errors.append(f"{loc}.iap.{kind}.desc: {len(desc)} > {LIMITS['iap_desc']}")
        words = d["keywords"].split(",")
        if any(w != w.strip() for w in words):
            errors.append(f"{loc}.keywords: spaces around commas")
    return errors


def main():
    out = pathlib.Path(__file__).parent
    errors = check()
    for loc, d in L.items():
        print(f"{loc:6} subtitle {len(d['subtitle']):2}/30  promo {len(d['promo']):3}/170  "
              f"keywords {len(d['keywords']):3}/100  desc {len(d['description']):4}  new {len(d['whatsNew']):3}")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    payload = {"products": PRODUCTS, "subscription_group": SUBSCRIPTION_GROUP,
               "urls": {"privacy": PRIVACY_URL, "support": SUPPORT_URL, "terms": TERMS_URL}, "locales": L}
    (out / "metadata.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    for loc, d in L.items():
        iap = "\n".join(f"- **{k}** (`{PRODUCTS[k]['id']}`): {n} / {s}" for k, (n, s) in d["iap"].items())
        md = (f"# FreshCheck 2.0 · {loc}\n\n**Name:** {d['name']}\n\n**Subtitle:** {d['subtitle']}\n\n"
              f"**Promotional text:**\n\n{d['promo']}\n\n**Keywords:**\n\n```\n{d['keywords']}\n```\n\n"
              f"**What's New:**\n\n```\n{d['whatsNew']}\n```\n\n**Description:**\n\n```\n{d['description']}\n```\n\n"
              f"**Subscription group:** {d['group_name']}\n\n**In-app purchases:**\n\n{iap}\n")
        (out / f"{loc}.md").write_text(md)
    print("ok")


if __name__ == "__main__":
    main()
