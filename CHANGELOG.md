# Change Log

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