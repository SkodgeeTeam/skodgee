# SKodgee 
SKodgee Obviously Designed for Generation Enhanced Efficiently

[Go to english version](/README.md)

## Qu'est-ce que c'est ?

SKodgee est un outil pour les développeurs de squelettes de code et de document. 
Il permet de générer des ensembles structurés de code ou de texte par la simple
application de directives qui utilise des données structurées fournies par l'utilisateur.

## Comment ça marche ?

Trois possibilités pour l'utilisateur :  
[1] - Lancer SKodgee pour générer un nouveau document en choisissant l'un des squelettes
 proposés puis en renseignant les données structurées demandées.  
[2] - Demander à Skodgee de repartir d'un document pour identifier le squelette,
récupérer les valeurs des données de génération et automatiquement proposer de refaire une
nouvelle génération dans l'interface décrite au point [1].  
 [3] - Mettre au point un squelette en générant l'interface de génération en partant
du squelette en cours de développement.

## Générer un nouveau document

Depuis la palette de commande appeler "SKodgee - generation based on skeleton" pour 
lancer l'interfaçe utilisateur. Il propose de choisir un squelette et de le charger.
Un formulaire est alors contruit automatiquement après analyse par Skodgee du squelette choisi.

L'interface montre aussi 2 panneaux qui permettent de visualiser le squelette et 
de consulter le dictionnaire qui en a été extrait.

L'utilisateur doit renseigner le formulaire puis demander la génération du code.
Le panneau le plus à droite montre alors le résultat de la génération (ou des messages 
d'anomalie quand la génération n'a pas correctement fonctionnée).

A la gauche de l'autre panneau et sur toute sa hauteur est disposé un bouton marqué
du symbole `|` (pipe ou barre verticale). En cliquant sur ce bouton l'utilisateur peut
faire basculer alternativement les panneaux pour afficher l'un, l'autre ou les deux en même temps.

Le texte contenu dans chaque panneau peut-être sélectionné et copier.

Quand une génération est réussi, un bouton supplémentaire propose de récupérer le code généré.
Ceci permet de recopier automatiquement le résultat dans une nouvell onglet d'édition. L'utilisateur
peut profiter de ce nouvel onglet pour réaliser des opérations de sélection, modification, comparaison...

## Corriger un document

Si un document généré avec SKodgee contient le dictionnaire qui a permis sa génération (1), alors
l'utilisateur peut appeler la commande "SKodgee - reverse from generated with dictionnary" depuis la
palette. 

Automatiquement, l'interface utilisateur est affichée avec le formulaire pré-rempli des
valeurs à l'origine de la génération du document. En plus du dictionnaire, le squelette doit
être accessible à SKodgee. Cette technique permet de corriger un document pour lequel on doit
modifier une ou plusieurs valeurs et aussi de prendre en compte toute les évolutions qui
auraient pu être faites sur le squelette depuis la génération du document. 

Le résultat de la génération peut alors être comparé au document d'origine 
et l'utilisateur peut utiliser les capacités de comparaison de VSCode pour réintégrer
toutes les parties qui n'étaient pas issue d'une génération mais avait été ajoutée 
manuellement dans le document.

_(1) : le squelette doit contenir une directive `dictionnary` valide afin de générer un document corrigeable_