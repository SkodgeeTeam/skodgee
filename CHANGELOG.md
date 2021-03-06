# Change Log

## [0.1.4] - 2021-06-10

- La génération est impossible tant qu'il reste au moins un champ de formulaire invalide ; en cliquant sur `Générer le code` on obtient
un message "Certains champs du formulaire contiennent des valeurs invalides" au lieu du document généré.
- Un champ de formulaire peut-être rendu obligatoire en déclarant la variable avec l'option required.

## [0.1.3] - 2021-06-09

- Correction sur la manipulation de variable déclarée par defnum et defstr ; 1) pour qu'une variable déclarée par defnum et defstr
soit toujours résolue en dehors de tout path ; 2) pour qu'un calc sur une variable de type string puisse utiliser
les fonctions javascripts comme un calc sur une variable numérique.

## [0.1.2] - 2021-06-08

- Modification de l'apparence des groupes qui ne sont pas répétés dans le formulaire utilisateur. Au lieu d'avoir
une ligne pour le groupe + une ligne pour la seule occurrence, on a juste une ligne pour le groupe et la mention `(1 seul)` en
fin de ligne pour bien le distinguer des groupes pouvant contenir plusieurs occurrences.

## [0.1.1] - 2021-05-27

- Levée de limitation sur la profondeur des données récupérées lors de l'injection d'un dictionnaire
(concerne uniquement les documents qui embarquent un dictionnaire au format compact lors de
l'appel de la fonctionnalité "SKodgee - revenir au squelette").
- Refonte du code pour une meilleur maintenabilité.

## [0.1.0] - 2021-05-24

- Ajout de capacités de déclaration et d'utilisation de webapi dans les squelettes.

## [0.0.13] - 2021-05-19

- L'injection de tous les formats de dictionnaires fonctionne alors que précédemment seul le format dense était correcte.  
- Pour la mise au point d'un squelette, ajout d'un message de cause probable quand un modèle n'a pas été trouvé.

## [0.0.12] - 2021-05-13

- Les groupes ne contenant pas de variables ne sont plus affichés dans le formulaire de saisie.
- Dans une formulaire qui n'a pas été obtenue par analyse d'un document, un groupe répété contient maintenant
son nombre minimum d'occurrence (zéro ou plus); ce n'était pas le cas avant, il y avait toujours
au moins une occurrence affichée pour les groupes dont le nombre minimum était de zéro.

## [0.0.11] - 2021-05-12

- Nouveaux contrôles de surface dans le formulaire avec les champs `min`, `max`, `step`, `type`, `pattern` pouvant être ajouté
dans la déclaration de varibales du dictionnaire ; ajout également du champ `description` pour la génération d'une info-bulle et
du champ `placeholder` pour l'affichage d'une information dans les champs vides.

## [0.0.10] - 2021-05-10

- Plus de plantage sur la directive if quand on tentait de tester la variable d'indice de la directive for qui la précédait
immédiatement alors que le groupe pointé par la directive for n'avait pas d'occurrence.
- Tout plantage lors de la génération retourne désormais le numéro et le contenu de la ligne qui provoque l'erreur.
- La directive `calc` est maintenant utilisable sur les variables de travail déclarée par la directive `defstr`.

## [0.0.9]

- Pour les variables avec une liste de valeurs, la liste filtrante a été remplacé par une liste classique, ce qui permet
d'avoir la visibilité sur toutes les valeurs possibles.
- Les boutons "Générer le code" et "Récupérer le code généré" on été déplacé en haut du formulaire.

## [0.0.8]

- Il n'est plus tenté de résoudre à tort des variables appelées dans les directives repeat
non vérifiées (repeat contenu dans if sur condition fausse, dans for sur groupe vide, dans un repeat zéro)
ce qui pouvait provoquer des erreurs de génération.

## [0.0.7]

- Correction pour voir les groupes vides après une injection qui n'étaient pas visibles, donc pour lesquelles il était
impossible de créer une 1ère occurrence dedans.
- Correction du problème d'affichage qui affichait des informations en surimpression lors de la création
d'une nouvelle occurrence dans les groupes complexes.

## [0.0.6]

- Nouvelle directive `defstr` pour définir une variable de stype chaine de caractère.

## [0.0.5]

- Ajout des directives `pushformat` et `popformat` pour mémoriser et restituer un format. Voir la documentation de la format de sortie
pour plus de précisions.

## [0.0.4]

- Correction d'une anomalie dans la génération du formulaire quand on faisait appel à un squelette par include et que ce
squelette inclu ne contenait aucun paramètre
- Mise au point de squelettes de test supplémentaires dans le répertoire resources/skeleton
- On abandonne (déjà!) la double documentation en français et en anglais. On va plutôt se concentrer sur la qualité de la documentation
en français. Si quelqu'un souhaite en assurer la traduction, il sera accueuillie comme il se doit.

## [0.0.3]

- Dans les préférences, ajout d'un `User mode` pour choisir entre le `mode utilisateur` et le `mode développeur`.
Le premier permet à l'utilisateur de générer des documents avec SKodgee. Le second est réservé à la mise au point et l'évolution de squelettes.
Très peu de différences entre ces 2 modes, mais cela pourra être enrichi. Dans le mode utilisateur, l'interface ne montre pas le squelette.
- L'emplacement des squelettes paramétré dans les préférences était unique ; si on voulait changer de collection de squelettes, il fallait
modifier ce paramètre à chaque fois. Maintenant on peut donner plusieurs emplacements, il n'est plus nécessaire d'en changer pour utiliser
les squelettes de plusieurs collections.

## [0.0.2]

- directive `calc` corrigée
- directive `include` corrigée

## [0.0.1]

- Version initiale avec quelques anomalies ;)
