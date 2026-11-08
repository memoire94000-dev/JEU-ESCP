window.ARENA_DATA = {

info: {
  dates: { name: "La course aux techniques", desc: "QCM de vitesse sur l'imagerie et les traitements. À la première erreur, la série s'arrête." },
  escape: { name: "L'évasion de l'hôpital", desc: "Six casiers, six énigmes de droit, d'éthique, de santé publique et de qualité, une porte à ouvrir." },
  snake: { name: "Le serpent médical", desc: "Dirige le serpent et mange les bonnes syllabes pour écrire le mot de biologie cellulaire ou de vocabulaire médical." },
  clic: { name: "Clic anatomie", desc: "Les noms défilent : clique seulement sur ceux qui entrent dans la catégorie." }
},

ui: {
  room: "Tu es enfermé dans les archives de l'hôpital. Chaque casier ouvert donne une lettre de la porte.",
  mirror: "Le message est écrit en miroir. Quelle notion y est décrite ?",
  reverse: "Le message est écrit à l'envers. Quelle notion y est décrite ?",
  flip: "Le message est retourné. Quelle notion y est décrite ?",
  caisse: "Fais le calcul et entre le résultat avec le pavé numérique."
},

icons: [
  '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  '<path d="M12 21s-7-4.6-9.2-9A5.2 5.2 0 0 1 12 6.7 5.2 5.2 0 0 1 21.2 12c-2.2 4.4-9.2 9-9.2 9z"/>',
  '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  '<path d="M12 3 2 21h20zM12 10v5M12 18v.5"/>'
],

/* ---------- TECHNIQUES : [année, événement] ou question à choix ---------- */
dates: [
[ /* FACILE */
[1895,"Découverte des rayons X par Wilhelm Röntgen"],
[1896,"Découverte de la radioactivité par Henri Becquerel"],
[1898,"Découverte du radium par Pierre et Marie Curie"],
[1901,"Premier prix Nobel de physique, attribué à Röntgen"],
[1914,"Début des voitures radiologiques de Marie Curie, les « petites Curies »"],
[1971,"Premier scanner réalisé sur un patient"],
[1977,"Première IRM d'un corps humain"],
{q:"Quel examen utilise des rayons X pour créer des images en coupes ?",a:"Le scanner",o:["L'IRM","L'échographie","L'électrocardiogramme"]},
{q:"Quel examen utilise un champ magnétique ?",a:"L'IRM",o:["Le scanner","La radiographie","La scintigraphie"]},
{q:"Quel examen utilise des ultrasons ?",a:"L'échographie",o:["L'IRM","Le scanner","La mammographie"]},
{q:"Quel examen radiologique explore les seins ?",a:"La mammographie",o:["La coronarographie","L'arthrographie","L'ostéodensitométrie"]},
{q:"Quelle technique traite un cancer par des rayonnements ?",a:"La radiothérapie",o:["La radiographie","L'échographie","L'endoscopie"]},
{q:"Comment appelle-t-on le traitement où une source radioactive est placée au contact de la tumeur ?",a:"La curiethérapie",o:["La chimiothérapie","La kinésithérapie","L'échographie"]},
{q:"Quel professionnel réalise les examens d'imagerie et les séances de radiothérapie ?",a:"Le manipulateur d'électroradiologie médicale",o:["Le kinésithérapeute","Le pharmacien","L'aide-soignant"]},
{q:"Quel produit rend les vaisseaux visibles au scanner ?",a:"Le produit de contraste iodé",o:["Le gel d'échographie","Le plomb","L'oxygène"]},
{q:"Pour quel examen met-on du gel sur la peau ?",a:"L'échographie",o:["Le scanner","L'IRM","La radiographie"]},
{q:"Quel tissu apparaît le plus blanc sur une radiographie ?",a:"L'os",o:["Le poumon","La graisse","L'air"]},
{q:"Pourquoi retire-t-on les objets métalliques avant une IRM ?",a:"Ils peuvent être attirés par l'aimant",o:["Ils sont radioactifs","Ils refroidissent la machine","Ils colorent les images"]},
{q:"Quelle imagerie utilise un traceur radioactif injecté au patient ?",a:"La scintigraphie",o:["L'échographie","L'IRM","La radiographie du thorax"]},
{q:"Les rayons X sont des rayonnements…",a:"Ionisants",o:["Sonores","Magnétiques","Olfactifs"]},
{q:"L'échographie utilise…",a:"Des ultrasons, sans rayons X",o:["Des rayons X","Des rayons gamma","Des protons"]},
{q:"Quel examen est privilégié pour suivre une grossesse ?",a:"L'échographie",o:["Le scanner","La radiographie","La scintigraphie"]},
{q:"Une radiographie du thorax sert notamment à observer…",a:"Les poumons",o:["Le cerveau","Les reins","Le genou"]},
{q:"Quel appareil délivre le plus souvent le faisceau en radiothérapie externe ?",a:"L'accélérateur linéaire",o:["L'échographe","Le stéthoscope","Le mammographe"]},
{q:"Quel examen montre les artères du cœur ?",a:"La coronarographie",o:["La mammographie","L'ostéodensitométrie","L'échographie du genou"]},
{q:"Que mesure l'ostéodensitométrie ?",a:"La densité des os",o:["La taille du cœur","Le taux de sucre","Le volume des poumons"]},
{q:"Dans une IRM, le patient est placé dans…",a:"Un tunnel avec un aimant puissant",o:["Une cabine en plomb","Une piscine","Une chambre froide"]},
{q:"Que signifie IRM ?",a:"Imagerie par résonance magnétique",o:["Image radiologique médicale","Irradiation par rayons mesurés","Indice de radioprotection médicale"]},
{q:"Pendant la prise d'une radiographie, le patient doit surtout…",a:"Rester immobile",o:["Marcher","Parler","Boire"]},
{q:"Quelle image obtient-on avec un scanner ?",a:"Des coupes du corps",o:["Un son","Un tracé du cœur","Une prise de sang"]}
],
[ /* MOYEN */
[1913,"Invention du tube à rayons X de Coolidge"],
[1927,"Première artériographie cérébrale par Egas Moniz"],
[1929,"Premier cathétérisme cardiaque sur l'homme par Forssmann"],
[1934,"Découverte de la radioactivité artificielle par Irène et Frédéric Joliot-Curie"],
[1946,"Publications de Bloch et de Purcell sur la résonance magnétique nucléaire dans la matière"],
[1953,"Description de la technique de Seldinger"],
[1958,"Publication d'Ian Donald sur l'échographie"],
[1979,"Prix Nobel de médecine pour Hounsfield et Cormack"],
[2003,"Prix Nobel de médecine pour Lauterbur et Mansfield"],
{q:"Quelle unité mesure la dose absorbée ?",a:"Le gray (Gy)",o:["Le becquerel (Bq)","Le tesla (T)","Le hertz (Hz)"]},
{q:"Quelle unité mesure l'activité d'une source radioactive ?",a:"Le becquerel (Bq)",o:["Le gray (Gy)","Le sievert (Sv)","Le tesla (T)"]},
{q:"Quelle unité mesure la dose efficace ?",a:"Le sievert (Sv)",o:["Le gray (Gy)","Le becquerel (Bq)","Le pascal (Pa)"]},
{q:"Quelle unité mesure le champ magnétique d'une IRM ?",a:"Le tesla (T)",o:["Le gray (Gy)","Le watt (W)","Le sievert (Sv)"]},
{q:"Quel produit de contraste utilise-t-on le plus souvent en IRM ?",a:"Le gadolinium",o:["Le baryum","L'iode 131","Le technétium"]},
{q:"Quel produit de contraste opacifie classiquement le tube digestif ?",a:"Le baryum",o:["Le gadolinium","Le technétium","Le fluor 18"]},
{q:"Quel radioélément est le plus utilisé en scintigraphie ?",a:"Le technétium 99m",o:["Le radium 226","Le cobalt 60","L'uranium 235"]},
{q:"Quel traceur est le plus utilisé en TEP ?",a:"Le 18F-FDG",o:["Le gadolinium","Le baryum","Le cobalt 60"]},
{q:"Que produit le tube lorsque les électrons frappent l'anode ?",a:"Des rayons X et de la chaleur",o:["Des ultrasons","Des protons","Un champ magnétique"]},
{q:"Dans un tube à rayons X, d'où partent les électrons ?",a:"De la cathode",o:["De l'anode","Du collimateur","De la table"]},
{q:"En scanner, la densité d'un tissu s'exprime en…",a:"Unités Hounsfield",o:["Grays","Teslas","Hertz"]},
{q:"Quelle est la densité de l'eau en unités Hounsfield ?",a:"0 UH",o:["−1000 UH","+1000 UH","+100 UH"]},
{q:"La densité de l'air au scanner est d'environ…",a:"−1000 UH",o:["0 UH","+40 UH","+1000 UH"]},
{q:"Quel dispositif limite le faisceau de rayons X à la zone utile ?",a:"Le collimateur",o:["La cathode","La table","Le gel"]},
{q:"Quelle coupe sépare le corps en une partie avant et une partie arrière ?",a:"La coupe coronale",o:["La coupe sagittale","La coupe axiale","La coupe oblique"]},
{q:"Quelle coupe sépare le corps en une partie droite et une partie gauche ?",a:"La coupe sagittale",o:["La coupe coronale","La coupe axiale","La coupe oblique"]},
{q:"Quelle coupe sépare le haut et le bas du corps ?",a:"La coupe axiale",o:["La coupe coronale","La coupe sagittale","La coupe oblique"]},
{q:"En radiographie, quand le rayon entre par l'avant du patient, l'incidence est dite…",a:"Antéro-postérieure",o:["Postéro-antérieure","De profil","Axiale"]},
{q:"En radiothérapie, le fractionnement consiste à…",a:"Répartir la dose en plusieurs séances",o:["Donner toute la dose en une fois","Couper la tumeur","Injecter un produit de contraste"]},
{q:"En radiothérapie, la dose prescrite s'exprime en…",a:"Grays",o:["Becquerels","Teslas","Hertz"]},
{q:"Que délivre le plus souvent un accélérateur linéaire ?",a:"Des photons de haute énergie",o:["Des ultrasons","Un champ magnétique","Des ondes radio"]},
{q:"En échographie, le gel sert à…",a:"Supprimer l'air entre la sonde et la peau",o:["Refroidir la sonde","Colorer les organes","Absorber les rayons X"]},
{q:"Quelle technique étudie les flux sanguins par effet Doppler ?",a:"L'échographie",o:["La radiographie","La scintigraphie","L'ostéodensitométrie"]}
],
[ /* DIFFICILE */
[1928,"Création de la Commission internationale de protection radiologique"],
[1951,"Premiers traitements de patients au cobalt 60"],
[1953,"Premier patient traité par accélérateur linéaire à Hammersmith"],
[1973,"Publication de Lauterbur sur l'imagerie par résonance magnétique"],
[1975,"Adoption du gray comme unité de dose absorbée"],
[1979,"Adoption du sievert comme unité de dose"],
[1989,"Présentation du scanner hélicoïdal"],
{q:"En IRM pondérée T1, le liquide cérébrospinal apparaît…",a:"En hyposignal, sombre",o:["En hypersignal, blanc","Toujours gris clair","Invisible"]},
{q:"En IRM pondérée T2, le liquide cérébrospinal apparaît…",a:"En hypersignal, blanc",o:["En hyposignal, noir","Invisible","Toujours gris foncé"]},
{q:"Quel noyau exploite-t-on principalement en IRM médicale ?",a:"L'hydrogène",o:["Le carbone","L'oxygène","Le fer"]},
{q:"Que signifie TEP ?",a:"Tomographie par émission de positons",o:["Technique d'échographie pulsée","Thérapie externe par photons","Tomographie à effet Doppler"]},
{q:"Que signifie TEMP ?",a:"Tomographie d'émission monophotonique",o:["Technique d'exploration médicale pulmonaire","Tomodensitométrie à mesure périphérique","Traitement externe par multiples photons"]},
{q:"La demi-vie du technétium 99m est d'environ…",a:"6 heures",o:["110 minutes","8 jours","5 ans"]},
{q:"La demi-vie du fluor 18 est d'environ…",a:"110 minutes",o:["6 heures","8 jours","30 ans"]},
{q:"Quel réglage influe surtout sur l'énergie du faisceau de rayons X ?",a:"La tension (kV)",o:["Le temps seul","La charge (mAs)","La hauteur de table"]},
{q:"La charge (mAs) règle surtout…",a:"La quantité de rayons X produits",o:["L'énergie maximale du faisceau","La taille du patient","La fréquence des ultrasons"]},
{q:"Quelle est la fréquence habituelle d'une sonde d'échographie ?",a:"Quelques mégahertz",o:["Quelques hertz","Quelques kilohertz","Quelques gigahertz"]},
{q:"Quel repère sert à comparer les doses délivrées en radiologie ?",a:"Le niveau de référence diagnostique",o:["La dose létale 50","Le seuil de Hounsfield","La limite annuelle du public"]},
{q:"Que signifie PDL au scanner ?",a:"Produit dose-longueur",o:["Puissance de dose locale","Protection de dose légale","Pulsation de dose linéaire"]},
{q:"En radiothérapie, le GTV désigne…",a:"Le volume tumoral macroscopique",o:["Le volume cible prévisionnel","Le volume irradié total","La dose maximale"]},
{q:"En radiothérapie, le PTV désigne…",a:"Le volume cible prévisionnel",o:["Le volume tumoral macroscopique","Un organe à risque","La dose maximale"]},
{q:"Le CTV ajoute au GTV…",a:"L'extension microscopique possible de la tumeur",o:["Les marges de repositionnement","Les organes à risque","La table de traitement"]},
{q:"La radiothérapie conformationnelle avec modulation d'intensité s'abrège en…",a:"RCMI",o:["TEP","IRM","TDM"]},
{q:"L'imagerie embarquée permet, au poste de traitement, de…",a:"Vérifier la position du patient",o:["Calculer le prix de la séance","Mesurer la glycémie","Refroidir l'accélérateur"]},
{q:"Un organe à risque est…",a:"Un organe sain à protéger de l'irradiation",o:["Une tumeur","Un produit de contraste","Un type de générateur"]},
{q:"Avant une IRM, quel dispositif doit-on absolument rechercher ?",a:"Un stimulateur cardiaque",o:["Des lunettes de vue","Une ancienne entorse","Un plâtre en résine"]},
{q:"Par où le produit de contraste iodé est-il éliminé principalement ?",a:"Par les reins",o:["Par les poumons","Par la peau","Par le cerveau"]},
{q:"Quel antécédent recherche-t-on avant une injection de produit de contraste iodé ?",a:"Une réaction à un produit de contraste iodé",o:["Une myopie","Une entorse ancienne","Une carie"]},
{q:"L'unité de la charge d'un tube à rayons X est…",a:"Le mAs",o:["Le kV","Le MHz","Le tesla"]}
],
[ /* PRO */
[1901,"Premières applications de radium à l'hôpital Saint-Louis par Danlos"],
[1911,"Prix Nobel de chimie de Marie Curie"],
[1958,"Publication d'Hal Anger décrivant sa caméra à scintillation"],
[1998,"Arrivée des scanners multicoupes à quatre barrettes"],
{q:"La séquence IRM STIR sert principalement à…",a:"Supprimer le signal de la graisse",o:["Supprimer le signal de l'os","Augmenter la dose","Mesurer le débit rénal"]},
{q:"La séquence IRM FLAIR sert principalement à…",a:"Supprimer le signal du liquide cérébrospinal",o:["Supprimer le signal de la graisse","Mesurer la dose","Remplacer l'injection"]},
{q:"La séquence de diffusion est très utile pour détecter tôt…",a:"Un AVC ischémique",o:["Une fracture du poignet","Une carie","Une myopie"]},
{q:"À 1,5 T, la fréquence de résonance de l'hydrogène est d'environ…",a:"64 MHz",o:["42 Hz","1,5 GHz","6 kHz"]},
{q:"Le rayonnement de freinage s'appelle aussi…",a:"Bremsstrahlung",o:["Effet Compton","Effet photoélectrique","Effet Doppler"]},
{q:"Aux énergies du radiodiagnostic, le contraste entre os et tissus mous vient surtout de…",a:"L'effet photoélectrique",o:["La création de paires","L'effet Doppler","La fission"]},
{q:"La création de paires nécessite une énergie minimale de…",a:"1,022 MeV",o:["511 keV","140 keV","80 keV"]},
{q:"Les photons d'annihilation mesurés en TEP ont chacun une énergie de…",a:"511 keV",o:["140 keV","1,022 MeV","80 keV"]},
{q:"Le photon gamma principal du technétium 99m a une énergie de…",a:"140 keV",o:["511 keV","1,25 MeV","6 MeV"]},
{q:"Le cobalt 60 a une période d'environ…",a:"5,3 ans",o:["6 heures","8 jours","1600 ans"]},
{q:"L'iode 131 a une période d'environ…",a:"8 jours",o:["6 heures","110 minutes","5 ans"]},
{q:"L'hypofractionnement consiste à…",a:"Augmenter la dose par séance et réduire leur nombre",o:["Baisser la dose totale de moitié","Ajouter un produit de contraste","Remplacer les photons par des ultrasons"]},
{q:"Au scanner hélicoïdal, le pitch est le rapport entre…",a:"L'avance de la table par rotation et la collimation",o:["Les kV et les mAs","La dose et le poids","L'iode et le sérum"]},
{q:"Si on augmente les kV, le contraste de l'image radiologique…",a:"Diminue",o:["Augmente","Ne change pas","Double toujours"]},
{q:"Si l'on double la distance à une source ponctuelle, le débit de dose est divisé par…",a:"4",o:["2","8","16"]},
{q:"La couche de demi-atténuation réduit l'intensité du faisceau de…",a:"50 %",o:["10 %","25 %","90 %"]},
{q:"Le gadolinium demande une grande prudence en cas de…",a:"Insuffisance rénale sévère",o:["Myopie","Entorse","Rhume"]},
{q:"La curiethérapie de la prostate par grains permanents utilise le plus souvent…",a:"L'iode 125",o:["Le fluor 18","Le technétium 99m","Le cobalt 60"]},
{q:"Le radium 223 est utilisé pour traiter…",a:"Des métastases osseuses de cancer de la prostate",o:["Des fractures du poignet","Des caries","Un asthme"]},
{q:"La stéréotaxie se caractérise par…",a:"Des doses élevées, très précises, en peu de séances",o:["Une dose très faible sur tout le corps","L'absence totale de repérage","L'usage d'ultrasons"]},
{q:"En radiothérapie, l'effet oxygène signifie que les cellules bien oxygénées sont…",a:"Plus radiosensibles",o:["Moins radiosensibles","Insensibles aux photons","Toujours mortes"]}
]
],

/* ---------- MOTS : niveau, nom, syllabes, définition, autre indice ---------- */
figures: [
{l:0,n:"Cellule",s:["CEL","LU","LE"],d:"Plus petite unité vivante de l'organisme."},
{l:0,n:"Noyau",s:["NO","YAU"],d:"Partie de la cellule qui contient l'ADN."},
{l:0,n:"Membrane",s:["MEM","BRA","NE"],d:"Enveloppe qui délimite la cellule."},
{l:0,n:"Cytoplasme",s:["CY","TO","PLAS","ME"],d:"Milieu situé entre la membrane et le noyau."},
{l:0,n:"Mitose",s:["MI","TO","SE"],d:"Division d'une cellule en deux cellules identiques."},
{l:0,n:"Tumeur",s:["TU","MEUR"],d:"Masse formée par une multiplication anormale de cellules."},
{l:0,n:"Organe",s:["OR","GA","NE"],d:"Ensemble de tissus qui assure une fonction."},
{l:0,n:"Radiographie",s:["RA","DIO","GRA","PHIE"],d:"Examen qui utilise les rayons X pour obtenir une image."},
{l:0,n:"Cardiologie",s:["CAR","DIO","LO","GIE"],d:"Spécialité médicale qui étudie le cœur."},
{l:0,n:"Gène",s:["GÈ","NE"],d:"Portion d'ADN qui porte une information."},
{l:0,n:"Diagnostic",s:["DIA","GNOS","TIC"],d:"Identification d'une maladie."},

{l:1,n:"Mitochondrie",s:["MI","TO","CHON","DRIE"],d:"Organite qui produit l'énergie de la cellule.",e:["Centrale énergétique de la cellule, elle fabrique l'ATP."]},
{l:1,n:"Ribosome",s:["RI","BO","SO","ME"],d:"Organite qui fabrique les protéines.",e:["Il lit l'ARN messager pour assembler les acides aminés."]},
{l:1,n:"Lysosome",s:["LY","SO","SO","ME"],d:"Organite qui digère les déchets de la cellule.",e:["Vésicule riche en enzymes de digestion."]},
{l:1,n:"Chromosome",s:["CHRO","MO","SO","ME"],d:"Structure formée d'ADN très condensé.",e:["L'espèce humaine en possède 46 dans ses cellules habituelles."]},
{l:1,n:"Protéine",s:["PRO","TÉ","I","NE"],d:"Molécule formée d'une chaîne d'acides aminés.",e:["L'hémoglobine en est un exemple."]},
{l:1,n:"Anatomie",s:["A","NA","TO","MIE"],d:"Étude de la structure du corps.",e:["Discipline qui décrit les os, les muscles et les organes."]},
{l:1,n:"Hématome",s:["HÉ","MA","TO","ME"],d:"Accumulation de sang dans un tissu.",e:["Il peut apparaître au point de ponction après une injection."]},
{l:1,n:"Anémie",s:["A","NÉ","MIE"],d:"Baisse du taux d'hémoglobine dans le sang.",e:["Elle provoque souvent pâleur et fatigue."]},
{l:1,n:"Œdème",s:["Œ","DÈ","ME"],d:"Gonflement dû à un excès de liquide dans les tissus.",e:["Accumulation d'eau, par exemple dans les chevilles."]},
{l:1,n:"Arthrose",s:["AR","THRO","SE"],d:"Usure du cartilage des articulations.",e:["La radiographie montre un pincement de l'interligne articulaire."]},
{l:1,n:"Névralgie",s:["NÉ","VRAL","GIE"],d:"Douleur sur le trajet d'un nerf.",e:["Le suffixe -algie indique la douleur, le radical névr- le nerf."]},
{l:1,n:"Hépatite",s:["HÉ","PA","TI","TE"],d:"Inflammation du foie.",e:["Le suffixe -ite indique l'inflammation, le radical hépat- le foie."]},

{l:2,n:"Apoptose",s:["A","POP","TO","SE"],d:"Mort cellulaire programmée.",e:["Mort cellulaire programmée, sans réaction inflammatoire."]},
{l:2,n:"Nécrose",s:["NÉ","CRO","SE"],d:"Mort accidentelle de cellules.",e:["Mort cellulaire accidentelle, avec inflammation."]},
{l:2,n:"Méiose",s:["MÉ","IO","SE"],d:"Division qui divise par deux le nombre de chromosomes.",e:["Division à l'origine des spermatozoïdes et des ovules."]},
{l:2,n:"Golgi",s:["GOL","GI"],d:"Nom de l'appareil qui modifie et trie les protéines.",e:["Empilement de saccules qui expédie les protéines."]},
{l:2,n:"Réticulum",s:["RÉ","TI","CU","LUM"],d:"Réseau de membranes dans le cytoplasme.",e:["Rugueux quand il porte des ribosomes, lisse sinon."]},
{l:2,n:"Phagocytose",s:["PHA","GO","CY","TO","SE"],d:"Capture et digestion d'une particule par une cellule.",e:["Les macrophages l'utilisent pour éliminer les bactéries."]},
{l:2,n:"Mutation",s:["MU","TA","TION"],d:"Modification de la séquence de l'ADN.",e:["Les rayonnements ionisants peuvent en provoquer dans l'ADN."]},
{l:2,n:"Hémorragie",s:["HÉ","MOR","RA","GIE"],d:"Écoulement de sang hors des vaisseaux.",e:["Du sang s'échappe d'un vaisseau rompu."]},
{l:2,n:"Thrombose",s:["THROM","BO","SE"],d:"Formation d'un caillot dans un vaisseau.",e:["Un caillot obstrue une veine ou une artère."]},
{l:2,n:"Métastase",s:["MÉ","TAS","TA","SE"],d:"Foyer tumoral secondaire, à distance.",e:["Cellules cancéreuses installées loin de la tumeur d'origine."]},
{l:2,n:"Fibrose",s:["FI","BRO","SE"],d:"Remplacement d'un tissu par du tissu cicatriciel.",e:["Effet tardif possible de la radiothérapie, le tissu durcit."]},
{l:2,n:"Asepsie",s:["A","SEP","SIE"],d:"Mesures qui empêchent l'apport de microbes.",e:["Indispensable pour un geste invasif en radiologie interventionnelle."]},

{l:3,n:"Transcription",s:["TRANS","CRIP","TION"],d:"Copie de l'ADN en ARN messager.",e:["Étape nucléaire qui produit un ARN messager."]},
{l:3,n:"Traduction",s:["TRA","DUC","TION"],d:"Synthèse d'une protéine à partir de l'ARN messager.",e:["Étape réalisée par les ribosomes à partir d'un ARN messager."]},
{l:3,n:"Nucléole",s:["NU","CLÉ","O","LE"],d:"Zone du noyau où sont produits les ribosomes.",e:["Structure du noyau riche en ARN ribosomique."]},
{l:3,n:"Centrosome",s:["CEN","TRO","SO","ME"],d:"Centre organisateur des microtubules.",e:["Il contient deux centrioles et organise le fuseau de division."]},
{l:3,n:"Hémostase",s:["HÉ","MOS","TA","SE"],d:"Mécanismes qui arrêtent un saignement.",e:["Ensemble des réactions qui referment une brèche vasculaire."]},
{l:3,n:"Ischémie",s:["IS","CHÉ","MIE"],d:"Diminution de l'apport sanguin à un tissu.",e:["Un AVC de ce type est dû à l'obstruction d'une artère."]},
{l:3,n:"Hypoxie",s:["HY","PO","XIE"],d:"Manque d'oxygène dans les tissus.",e:["Elle rend les cellules tumorales moins radiosensibles."]},
{l:3,n:"Radiolyse",s:["RA","DIO","LY","SE"],d:"Décomposition de l'eau par les rayonnements ionisants.",e:["Elle produit dans la cellule des radicaux libres."]},
{l:3,n:"Cytokinèse",s:["CY","TO","KI","NÈ","SE"],d:"Séparation du cytoplasme en fin de division.",e:["Dernière étape de la division, qui sépare les deux cellules filles."]},
{l:3,n:"Anaphylaxie",s:["A","NA","PHY","LA","XIE"],d:"Réaction allergique grave et généralisée.",e:["Urgence possible après l'injection d'un produit de contraste."]},
{l:3,n:"Néoplasie",s:["NÉ","O","PLA","SIE"],d:"Prolifération tissulaire nouvelle et anormale.",e:["Terme médical désignant la formation d'une tumeur."]},
{l:3,n:"Endocytose",s:["EN","DO","CY","TO","SE"],d:"Entrée de substances dans la cellule par invagination.",e:["La membrane forme une vésicule qui entre dans la cellule."]}
],

/* ---------- CLIC ANATOMIE : catégories par niveau ---------- */
clic: [
[ /* FACILE */
{k:"Organes du thorax",y:["Cœur","Poumons","Trachée","Œsophage","Thymus","Bronches","Plèvre"],n:["Foie","Estomac","Rate","Rein","Pancréas","Vessie","Intestin grêle","Côlon","Vésicule biliaire"]},
{k:"Organes de l'abdomen",y:["Foie","Estomac","Rate","Pancréas","Intestin grêle","Côlon","Vésicule biliaire"],n:["Cœur","Poumons","Trachée","Thymus","Cerveau","Thyroïde","Hypophyse","Cervelet"]},
{k:"Os du haut du corps",y:["Crâne","Mandibule","Clavicule","Scapula","Humérus","Radius","Ulna","Sternum","Côte"],n:["Fémur","Tibia","Fibula","Patella","Calcanéus","Talus","Sacrum","Coccyx","Ilium","Pubis"]},
{k:"Éléments du système nerveux",y:["Cerveau","Cervelet","Moelle spinale","Nerf sciatique","Tronc cérébral","Neurone","Nerf optique"],n:["Fémur","Aorte","Foie","Rein","Estomac","Poumon","Œsophage","Rate","Humérus"]},
{k:"Organes du système digestif",y:["Bouche","Œsophage","Estomac","Intestin grêle","Côlon","Foie","Pancréas","Rectum"],n:["Rein","Vessie","Cœur","Poumon","Trachée","Rate","Thyroïde","Utérus","Ovaire"]},
{k:"Organes du système urinaire",y:["Rein","Uretère","Vessie","Urètre"],n:["Estomac","Foie","Rate","Côlon","Cœur","Poumon","Ovaire","Utérus","Pancréas","Testicule"]},
{k:"Parties de la cellule",y:["Noyau","Mitochondrie","Membrane plasmique","Ribosome","Cytoplasme","Appareil de Golgi","Lysosome"],n:["Fémur","Poumon","Artère","Muscle","Cerveau","Foie","Vertèbre","Rein"]}
],
[ /* MOYEN */
{k:"Nerfs crâniens",y:["Nerf olfactif","Nerf optique","Nerf oculomoteur","Nerf trochléaire","Nerf trijumeau","Nerf abducens","Nerf facial","Nerf vestibulocochléaire","Nerf glossopharyngien","Nerf vague","Nerf accessoire","Nerf hypoglosse"],n:["Nerf sciatique","Nerf radial","Nerf médian","Nerf ulnaire","Nerf fémoral","Nerf tibial","Nerf phrénique","Nerf fibulaire","Nerf pudendal","Nerf musculo-cutané","Nerf intercostal","Nerf obturateur"]},
{k:"Éléments du système endomembranaire",y:["Réticulum endoplasmique rugueux","Réticulum endoplasmique lisse","Appareil de Golgi","Lysosome","Endosome","Vésicule de transport","Enveloppe nucléaire"],n:["Mitochondrie","Ribosome","Nucléole","Centrosome","Microtubule","Flagelle","Chromosome","Protéasome","Filament d'actine"]},
{k:"Os du membre supérieur",y:["Clavicule","Scapula","Humérus","Radius","Ulna","Scaphoïde","Lunatum","Métacarpien"],n:["Fémur","Tibia","Fibula","Patella","Talus","Calcanéus","Sternum","Côte","Ilium","Sacrum","Vertèbre"]},
{k:"Os du membre inférieur",y:["Fémur","Tibia","Fibula","Patella","Talus","Calcanéus","Cuboïde","Métatarsien","Os coxal"],n:["Humérus","Radius","Ulna","Scapula","Clavicule","Lunatum","Sternum","Côte","Mandibule","Métacarpien"]},
{k:"Glandes endocrines",y:["Thyroïde","Hypophyse","Surrénale","Parathyroïde","Ovaire","Testicule","Glande pinéale"],n:["Glande salivaire","Glande sudoripare","Glande lacrymale","Glande sébacée","Prostate","Rate","Côlon","Poumon","Estomac"]},
{k:"Os de la boîte crânienne",y:["Frontal","Pariétal","Temporal","Occipital","Sphénoïde","Ethmoïde"],n:["Mandibule","Maxillaire","Zygomatique","Vomer","Clavicule","Sternum","Humérus","Atlas","Axis","Hyoïde","Scapula"]},
{k:"Structures du cœur",y:["Oreillette droite","Ventricule gauche","Valve mitrale","Valve tricuspide","Valve aortique","Myocarde","Péricarde","Septum interventriculaire"],n:["Bronche","Plèvre","Trachée","Aorte abdominale","Veine porte","Foie","Thymus","Œsophage","Diaphragme"]}
],
[ /* DIFFICILE */
{k:"Os du carpe",y:["Scaphoïde","Lunatum","Triquétrum","Pisiforme","Trapèze","Trapézoïde","Capitatum","Hamatum"],n:["Talus","Calcanéus","Cuboïde","Naviculaire","Cunéiforme médial","Radius","Ulna","Métacarpien","Phalange","Patella"]},
{k:"Os du tarse",y:["Talus","Calcanéus","Naviculaire","Cuboïde","Cunéiforme médial","Cunéiforme intermédiaire","Cunéiforme latéral"],n:["Scaphoïde","Lunatum","Triquétrum","Hamatum","Capitatum","Fémur","Tibia","Métatarsien","Phalange"]},
{k:"Lobes du cerveau",y:["Lobe frontal","Lobe pariétal","Lobe temporal","Lobe occipital","Lobe de l'insula"],n:["Cervelet","Bulbe rachidien","Pont","Mésencéphale","Thalamus","Hypothalamus","Hypophyse","Corps calleux","Moelle spinale"]},
{k:"Muscles de la coiffe des rotateurs",y:["Supra-épineux","Infra-épineux","Petit rond","Subscapulaire"],n:["Deltoïde","Biceps brachial","Triceps brachial","Grand pectoral","Grand dorsal","Trapèze","Grand rond","Brachial","Dentelé antérieur","Rhomboïde"]},
{k:"Phases de la mitose",y:["Prophase","Prométaphase","Métaphase","Anaphase","Télophase"],n:["Phase G1","Phase S","Phase G2","Interphase","Réplication","Transcription","Traduction","Apoptose","Nécrose"]},
{k:"Segments du côlon",y:["Côlon ascendant","Angle colique droit","Côlon transverse","Angle colique gauche","Côlon descendant","Côlon sigmoïde"],n:["Duodénum","Jéjunum","Iléon","Estomac","Œsophage","Pylore","Vésicule biliaire","Cholédoque","Pancréas"]},
{k:"Organes et gros vaisseaux rétropéritonéaux",y:["Rein","Uretère","Surrénale","Aorte abdominale","Veine cave inférieure","Pancréas"],n:["Foie","Estomac","Rate","Jéjunum","Iléon","Vésicule biliaire","Côlon transverse","Côlon sigmoïde"]}
],
[ /* PRO */
{k:"Nerfs crâniens uniquement sensoriels",y:["Nerf olfactif","Nerf optique","Nerf vestibulocochléaire"],n:["Nerf oculomoteur","Nerf trochléaire","Nerf abducens","Nerf hypoglosse","Nerf facial","Nerf trijumeau","Nerf glossopharyngien","Nerf vague","Nerf accessoire"]},
{k:"Nerfs crâniens uniquement moteurs",y:["Nerf oculomoteur","Nerf trochléaire","Nerf abducens","Nerf accessoire","Nerf hypoglosse"],n:["Nerf olfactif","Nerf optique","Nerf vestibulocochléaire","Nerf facial","Nerf trijumeau","Nerf glossopharyngien","Nerf vague"]},
{k:"Branches du tronc cœliaque",y:["Artère gastrique gauche","Artère splénique","Artère hépatique commune"],n:["Artère mésentérique supérieure","Artère mésentérique inférieure","Artère rénale","Artère iliaque commune","Artère fémorale","Artère carotide commune","Artère sous-clavière","Artère radiale"]},
{k:"Artères du polygone de Willis",y:["Artère communicante antérieure","Artère cérébrale antérieure","Artère carotide interne","Artère communicante postérieure","Artère cérébrale postérieure"],n:["Artère carotide externe","Artère faciale","Artère temporale superficielle","Artère maxillaire","Artère sous-clavière","Artère thyroïdienne supérieure","Artère vertébrale","Artère axillaire","Artère radiale","Artère fémorale"]},
{k:"Os de la base du crâne",y:["Ethmoïde","Sphénoïde","Temporal","Occipital","Frontal"],n:["Pariétal","Mandibule","Hyoïde","Maxillaire","Zygomatique","Nasal","Atlas","Axis","Lacrymal","Clavicule"]},
{k:"Organes du médiastin",y:["Cœur","Thymus","Trachée","Œsophage","Aorte thoracique","Veine cave supérieure"],n:["Poumon droit","Poumon gauche","Foie","Rate","Estomac","Pancréas","Rein","Côlon","Vessie","Thyroïde"]}
]
],

/* ---------- ÉVASION : 6 casiers + mot final ---------- */
pcs: [
{k:"Droits du patient",c:"Le patient est informé, donne son accord et peut accéder à son dossier."},
{k:"Éthique et déontologie",c:"Respecter la personne, faire le bien, ne pas nuire, traiter chacun équitablement."},
{k:"Secret et information",c:"Ce que le soignant apprend sur un patient reste confidentiel."},
{k:"Démarche qualité",c:"Évaluer ses pratiques pour les améliorer, étape après étape."},
{k:"Santé publique",c:"Étudier la santé de la population pour prévenir et organiser les soins."},
{k:"Gestion des risques",c:"Signaler, analyser et corriger pour éviter que l'erreur se reproduise."}
],
escape: [
{ word:"SECRET", scr:"RTESCE", clue:"Ce que tout soignant doit garder sur la santé du patient.",
  memory:{hint:"Associe chaque mot à ce qu'il veut dire pour le patient.",pairs:[["Consentement","Accord du patient"],["Information","Explication claire"],["Secret","Ne rien divulguer"],["Dossier médical","Historique des soins"],["Refus de soins","Droit du patient"],["Personne de confiance","Désignée par le patient"]]},
  riddle:{hint:"Pense aux grands principes du soin.",items:[
    {t:"Je garantis que chaque patient soit traité avec respect, quelle que soit sa situation.",a:"La dignité",o:["Le profit","La vitesse","La notoriété"]},
    {t:"Je consiste à ne pas faire de mal au patient.",a:"La non-malfaisance",o:["L'autonomie","La justice","La rapidité"]},
    {t:"Je suis le droit du patient de décider pour lui-même.",a:"L'autonomie",o:["La bienfaisance","La justice","La hiérarchie"]}]},
  mirror:{hint:"Le texte se lit de droite à gauche, comme dans un miroir.",style:"mirror",items:[
    {t:"Le soignant ne divulgue pas les informations du patient.",a:"Secret professionnel",o:["Consentement","Hygiène","Dépistage"]},
    {t:"Le patient est informé puis donne son accord.",a:"Consentement",o:["Secret professionnel","Traçabilité","Incidence"]}]},
  anagram:{hint:"Un mot sur l'exigence des soins, un autre sur la propreté.",items:[
    ["QUALITE","Capacité d'un soin à répondre aux besoins du patient"],["HYGIENE","Règles qui évitent la transmission des infections"]]},
  caisse:{hint:"Pourcentage = partie ÷ total × 100.",items:[
    {q:"Une ville compte 1 000 habitants et 50 sont malades. Quel est le pourcentage de malades ?",a:5},
    {q:"Sur 200 patients, 20 fument. Quel est le pourcentage de fumeurs ?",a:10},
    {q:"Un service réalise 30 examens par jour pendant 5 jours. Combien d'examens au total ?",a:150}]},
  sequence:{hint:"On vérifie qui est le patient avant de faire l'examen.",title:"Remets dans l'ordre la prise en charge d'un patient en radiologie.",steps:["Accueillir le patient","Vérifier son identité","Expliquer l'examen","Réaliser l'examen","Transmettre les images au médecin"]}
},
{ word:"DROITS", scr:"TOSDRI", clue:"Ce que la loi du 4 mars 2002 reconnaît aux malades.",
  memory:{hint:"Des lois et des organismes à reconnaître.",pairs:[["Loi Kouchner","Droits des malades"],["HAS","Haute Autorité de santé"],["ARS","Agence régionale de santé"],["ASNR","Radioprotection et sûreté"],["OMS","Organisation mondiale"],["Personne de confiance","Accompagne le patient"],["Directives anticipées","Volontés de fin de vie"],["Mineur","Accord des parents"]]},
  riddle:{hint:"Autonomie, bienfaisance, non-malfaisance, justice : à toi de trier.",items:[
    {t:"Je demande d'agir pour le bien du patient.",a:"La bienfaisance",o:["La justice","L'autonomie","La confidentialité"]},
    {t:"Je demande un accès équitable aux soins pour tous.",a:"La justice",o:["La bienfaisance","L'autonomie","La non-malfaisance"]},
    {t:"Je suis l'ensemble des devoirs propres à une profession.",a:"La déontologie",o:["L'épidémiologie","L'hygiène","La radioprotection"]}]},
  mirror:{hint:"Le texte se lit de droite à gauche, comme dans un miroir.",style:"mirror",items:[
    {t:"Un soignant ne peut pas révéler ce qu'il a appris sur un patient.",a:"Secret professionnel",o:["Autorité parentale","Droit d'accès","Traçabilité"]},
    {t:"Le patient peut consulter les informations de son dossier médical.",a:"Droit d'accès",o:["Droit de grève","Droit d'auteur","Droit de vote"]},
    {t:"Pour un enfant, ce sont en principe ses parents qui donnent leur accord.",a:"Autorité parentale",o:["Directives anticipées","Droit de grève","Secret partagé"]}]},
  anagram:{hint:"Suivre tout ce qui est fait, puis être évalué par la HAS.",items:[
    ["TRACABILITE","Pouvoir retrouver l'historique d'un acte ou d'un produit"],["CERTIFICATION","Évaluation externe des établissements de santé par la HAS"]]},
  caisse:{hint:"Prévalence : cas existants. Incidence : nouveaux cas.",items:[
    {q:"Sur 5 000 habitants, 250 ont une maladie. Quelle est la prévalence en % ?",a:5},
    {q:"En un an, 20 nouveaux cas surviennent parmi 1 000 personnes indemnes. Quelle est l'incidence pour 1 000 ?",a:20},
    {q:"Un dépistage invite 400 femmes et 300 y participent. Quel est le taux de participation en % ?",a:75}]},
  sequence:{hint:"Plan, Do, Check, Act.",title:"Remets dans l'ordre la roue de Deming.",steps:["Planifier","Réaliser","Vérifier","Améliorer"]}
},
{ word:"RISQUE", scr:"QESRUI", clue:"Probabilité de survenue d'un événement indésirable.",
  memory:{hint:"Réparer un dommage ou protéger des données : à toi d'associer.",pairs:[["Aléa thérapeutique","Accident sans faute"],["ONIAM","Indemnise les accidents"],["CDU","Commission des usagers"],["RGPD","Protège les données"],["CNIL","Contrôle des données"],["Responsabilité civile","Réparer un dommage"],["Responsabilité pénale","Sanctionner une infraction"],["Consentement éclairé","Informé et sans pression"]]},
  riddle:{hint:"Une loi, un comité, un principe de radioprotection.",items:[
    {t:"Loi de 2005 qui refuse l'obstination déraisonnable en fin de vie.",a:"La loi Leonetti",o:["La loi Veil","La loi Kouchner","La loi Bichat"]},
    {t:"Comité national consultatif sur les questions éthiques de santé.",a:"Le CCNE",o:["La HAS","L'ARS","La CNIL"]},
    {t:"Je demande que toute exposition aux rayonnements apporte plus de bénéfice que de risque.",a:"La justification",o:["L'optimisation","La limitation","Le fractionnement"]}]},
  mirror:{hint:"Ici les lettres sont simplement dans l'ordre inverse : lis la phrase à l'envers.",style:"reverse",items:[
    {t:"Les professionnels de l'équipe échangent ce qui est utile aux soins.",a:"Secret partagé",o:["Droit de grève","Incidence","Déontologie"]},
    {t:"Le patient désigne un proche pour l'accompagner dans ses décisions.",a:"Personne de confiance",o:["Tuteur légal","Médecin du travail","Assureur"]},
    {t:"Les informations personnelles de santé doivent être protégées.",a:"Confidentialité",o:["Prévalence","Fractionnement","Aléa"]}]},
  anagram:{hint:"Comment on traite les patients, puis comment on mesure le travail.",items:[
    ["BIENTRAITANCE","Manière d'agir qui respecte le patient et ses besoins"],["EVALUATION","Mesure de la qualité des pratiques"]]},
  caisse:{hint:"Pour 1 000 : cas ÷ population × 1 000.",items:[
    {q:"Dans une population de 20 000 personnes, 300 cas existent. Quelle est la prévalence pour 1 000 ?",a:15},
    {q:"Sur 1 000 personnes suivies un an, 8 décèdent. Quelle est la mortalité en % ?",a:0.8},
    {q:"Un acte coûte 120 € et l'Assurance maladie rembourse 70 %. Combien reste-t-il à payer en € ?",a:36}]},
  sequence:{hint:"Avant de corriger, il faut comprendre.",title:"Remets dans l'ordre la gestion d'un événement indésirable.",steps:["Signaler l'événement","Analyser les causes","Définir des actions correctives","Mettre en œuvre les actions","Évaluer leur efficacité"]}
},
{ word:"ÉQUITÉ", scr:"TEIQEU", clue:"Principe d'accès juste à des soins adaptés à chacun.",
  memory:{hint:"Des textes, des sigles et le cadre du métier.",pairs:[["Loi du 4 mars 2002","Droits des malades"],["Loi HPST","Organisation de la santé"],["Loi Claeys-Leonetti","Sédation profonde"],["Code de la santé publique","Textes du soin"],["Décret d'actes","Cadre du manipulateur"],["ALD","Affection de longue durée"],["T2A","Tarification à l'activité"],["ESR","Événement significatif de radioprotection"],["DPC","Formation continue"]]},
  riddle:{hint:"Un principe de radioprotection et deux instances d'analyse.",items:[
    {t:"Je demande des doses aussi basses que raisonnablement possible.",a:"L'optimisation",o:["La justification","La limitation","La réparation"]},
    {t:"Réunion qui analyse collectivement les décès et complications pour améliorer les pratiques.",a:"La RMM",o:["La CME","La T2A","L'ALD"]},
    {t:"Comité qui analyse les événements indésirables signalés dans un service.",a:"Le CREX",o:["La CDU","Le CCNE","L'ARS"]}]},
  mirror:{hint:"Le texte est retourné : tourne ton téléphone, ou lis-le de bas en haut et de droite à gauche.",style:"flip",items:[
    {t:"Une information médicale ne se donne pas à un proche sans l'accord du patient.",a:"Secret médical",o:["Aléa thérapeutique","Tarification","Certification"]},
    {t:"En cas de danger immédiat, si le patient ne peut pas exprimer sa volonté, le soin peut se faire sans son accord.",a:"Urgence vitale",o:["Directives anticipées","Prévalence","Bientraitance"]},
    {t:"Dans certains cas prévus par la loi, le secret peut être levé.",a:"Dérogation légale",o:["Fractionnement","Optimisation","Incidence"]}]},
  anagram:{hint:"Faire le bon acte, et se protéger des rayons.",items:[
    ["PERTINENCE","Réaliser le bon acte, pour le bon patient, au bon moment"],["RADIOPROTECTION","Ensemble des mesures contre les effets des rayonnements ionisants"]]},
  caisse:{hint:"Sensibilité : malades dépistés ÷ malades. Spécificité : sains négatifs ÷ sains.",items:[
    {q:"Sur 100 malades, le test est positif chez 90. Quelle est la sensibilité en % ?",a:90},
    {q:"Sur 900 personnes saines, le test est négatif chez 810. Quelle est la spécificité en % ?",a:90},
    {q:"Un service a un budget de 1 200 000 €, dont 80 % de salaires. Quel est le montant des salaires en € ?",a:960000}]},
  sequence:{hint:"On identifie d'abord, on surveille à la fin.",title:"Remets dans l'ordre l'analyse d'un risque a priori.",steps:["Identifier les dangers","Évaluer la gravité et la fréquence","Hiérarchiser les risques","Mettre en place des barrières","Suivre et réévaluer"]}
}
]
};
