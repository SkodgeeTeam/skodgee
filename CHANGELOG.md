# Change Log

## [0.0.10] - 2021-05-10

- Plus de plantage sur la directive if quand on tentait de tester la variable d'indice de la directive for qui la précédait
immédiatement alors que le groupe pointé par la directive for n'avait pas d'occurrence.
- Tout plantage lors de la génération retourne désormais le numéro et le contenu de la ligne qui provoque l'erreur.

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