# [SKodgee](https://github.com/SkodgeeTeam/skodgee)

_**SKodgee Obviously Designed for Generation Enhanced Efficiently**_

![logo](https://github.com/SkodgeeTeam/skodgee/blob/main/resources/skodgee256.png)

## Introduction

### Qu'est-ce que c'est ?

SKodgee est un outil pour les développeurs de squelettes de code et de document.
Il permet de générer des ensembles structurés de code ou de texte par la simple
application de directives qui utilisent les données structurées fournies par l'utilisateur.

### Comment ça marche ?

Trois possibilités pour l'utilisateur :  

- Lancer SKodgee pour générer un nouveau document en choisissant l'un des squelettes
 proposés puis en renseignant les données structurées demandées.  
- Demander à Skodgee de repartir d'un document pour identifier le squelette,
récupérer les valeurs des données de génération et automatiquement proposer de refaire une
nouvelle génération avec possibilité de changer les valeurs.  
- Tester un squelette en cours de mise au point ou de maintenance.

### Générer un nouveau document

Depuis la palette de commande appeler "SKodgee - génération à partir d'une sélection de squelettes" pour
lancer l'interfaçe utilisateur. Il propose de choisir un squelette et de le charger.
Un formulaire est alors contruit automatiquement après analyse par Skodgee du squelette choisi.

L'utilisateur doit renseigner le formulaire puis demander la génération du code.
Si la génération est réussie alors le résultat est affiché, sinon des messages d'anomalie
sont affichés.

Quand une génération est réussi, un bouton supplémentaire propose de récupérer le code généré.
Ceci permet de recopier automatiquement le résultat dans une nouvell onglet d'édition. L'utilisateur
peut profiter de ce nouvel onglet pour réaliser des opérations de sélection, modification, comparaison...

_**Spécificité du mode développeur**_

Il existe un mode développeur (activable depuis les préférences) pour lequel l'interface montre
2 panneaux qui permettent de visualiser le squelette et de consulter le dictionnaire qui en a été extrait.

A la gauche du 1er panneau et sur toute sa hauteur est disposé un bouton marqué
du symbole `|` (pipe ou barre verticale). En cliquant sur ce bouton le développeur peut
faire basculer alternativement les panneaux pour afficher l'un, l'autre ou les deux en même temps.

Le texte contenu dans chaque panneau peut-être sélectionné et copier.

### Corriger un document

Si un document généré avec SKodgee contient le dictionnaire qui a permis sa génération⁽¹⁾, alors
l'utilisateur peut appeler la commande "SKodgee - revenir au squelette" depuis la
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

_⁽¹⁾ le squelette doit contenir une directive `dictionnary` valide afin de générer un document corrigeable_

### Tester un squelette en cours de mise au point

Pour un développeur de squelette, le choix "SKodgee - tester le squelette" permet de lancer l'interface
en utilisant le squelette alors même que celui-ci n'est pas enregistré dans la liste des emplacements
qui ont été paramétrés dans les préférences.

___

## Création d'un squelette

Chaque squelette est composé de 3 parties

- Un `entête` pour l'identification du squelette
- Un `dictionnaire` pour identifier les paramètres
- Un `corps` paramétré pour spécifier le texte et les règles de génération

### Entête du squelette

Elle commence par `# skodgee` sur la 1ère ligne et se termine par `# end` sur la dernière ligne.
 Entre ces 2 lignes on retrouve un objet JSON dont les champs obligatoires sont `"name"` et `"prefix"`  

    # skodgee  
      { "name": "nom du squelette",
        "description": "texte décrivant la finalité du squelette",
        "author": "auteur du squelette",
        "version": "version du squelette",
       "hidden": "",
        "prefix": "#" }
    # end

avec  

- `"name"` : nom du squelette dans la liste proposée dans l'interface  
- `"description"` :  texte libre qui sera restitué comme info-bulle dans l'interface lors du survol d'un item de la liste des squelettes  
- `"author"` : nom de l'auteur du squelette  
- `"version"` : identifiant de version du squelette
- `"hidden"` : si ce champ est présent, quelle que soit sa valeur, alors le squelette n'est pas restitué dans la liste de sélection proposée à l'utilisateur ; un squelette caché sera donc exclusivement utilisable par inclusion (voir § Inclusion de squelettes)  
- `"prefix"` : caractère ou chaine de caractère qui va précéder chaque directive dans la suite du squelette. Attention, ce paramètre est défini pour un usage futur, son changement de valeur est actuellement sans effet.

> Dans le reste du document, tous les exemples utilisent # comme  `prefix`.

### Dictionnaire du squelette

Le dictionnaire des paramètres est précédé d'un directive `declare` et suivi d'une directive `end`.  
Le dictionnaire est une suite d'objets au format JSON séparés par une virgule.  

Il existe 2 types d'objets :

- l'objet variable qui sert à la déclaration d'une variable (donnée élémentaire). Le seul champ obligatoire de cet objet est `"var"`
- l'objet groupe qui sert à la déclaration d'un groupe. Les champs obligatoires de cet objet sont soient `"grp"` et `"cmp"`, soient `"grp"` et `"include"`.

<!---->
    # declare
      { "var": "variable1", 
        "lib": "libellé de la variable",
        "opt": ["valeur1","valeur2","valeur3"] },
      { "grp": "groupe1",
        "lib": "libellé du groupe",
        "rpt": "min,max",
        "cmp": [
            { "var": "variable2", "lib": "libellé de la variable" },
            { "var": "variable3", "lib": "libellé de la variable" },
            { "grp": "groupe1",
                "lib": "libellé du groupe",
                "rpt": "min,max",
                "include" : "nom du fichier squelette à inclure"
            }
        ]
      }
    # end

avec pour un objet variable

- `"var"` : code de la variable
- `"lib"` : libellé de la variable  
- `"opt"` : liste de valeurs possibles pour la variable  
- `"description"` : texte informatif qui sera restitué comme bulle d'aide dans le formulaire
- `"placeholder"` : valeur informative apparaissant dans le formulaire quand la variable n'est pas renseignée
- `"min"` : valeur minimum autorisée⁽¹⁾⁽²⁾
- `"max"` : valeur maximum autorisée⁽¹⁾⁽²⁾
- `"step"` : pas d'incrément⁽¹⁾⁽²⁾
- `"type"` : typage de la variable pour contrôle dans le formulaire, renseigner à `numeric` pour contrôler un nombre⁽¹⁾
- `"pattern"` : expression régulière pour le contrôle de la validité dans le formulaire (standard pattern html)⁽¹⁾

_⁽¹⁾ `min`, `max` et `step` sont prioritaires sur `type` qui est prioritaire sur `pattern`_
_⁽²⁾ si `min`, `max` ou `step` sont utilisés, le champ de saisie dans le formulaire est de la forme html &lt;input type="number"&gt;_

avec pour un objet groupe

- `"grp"` : code du groupe
- `"lib"` : libellé du groupe
- `"rpt"` : nombre d'occurrences mini et maxi autorisées pour le groupe (par défaut "1,1")
- `"cmp"` : tableau des objets qui composent le groupe. Peut contenir un mix d'objets variables et d'objets groupes sans limitation de profondeur
- `"include"` : nom d'un fichier squelette qui pourra être appelé dans le corps du squelette avec la directive `include`

Dans un même groupe on ne peut pas avoir à la fois les champs `"cmp"` et `"include"` au même niveau,
mais dans un champ `"cmp"` on peut avoir des objets variables, des objets groupes avec champ `"cmp"` et des objets groupes avec champ `"include"`.
Les champs `"rpt"` et `"include"` ne peuvent pas non plus être présents au même niveau dans un groupe.

### Corps du squelette

Le corps du squelette contient du texte qui sera restitué tel quel à la génération après résolution des appels de paramètres et application des directives décrites ci-après.

### 🡆 Appels de paramètres

Les appels de paramètres utilisent la notation "double-moustaches" : `{{paramètre}}`.  
Un paramètre est soit une variable, soit un groupe, soit un chemin vers une variable ou un groupe.  
Un chemin vers une variable est composé de plusieurs termes séparés par un `_` (caractère de soulignement ou underscore), le dernier terme devant être une variable, les précédents étant des groupes.  
Un chemin vers un groupe est composé pareillement mais le dernier terme est un groupe.  

> Variables et groupes doivent être déclarés au dictionnaire.

#### 🡆 Répétition

La directive `repeat` permet de répéter toutes les lignes suivantes situées avant la directive `endrepeat` qui lui correspond. Les directives `repeat`, `for`, `if` et `path` sont imbriquables sans limitation de profondeur.

    # repeat 5|{{variable}}
        ligne répétée {{_ri}} fois sur {{_rm}}
    # endrepeat

A l'intérieur d'une répétition on peut utiliser les variables spéciales (calculée sur la répétiton en cours la plus profonde en cas d'imbrication)

- `{{_ri}}` : retourne l'indice de la répétition en cours qui est incrémenté par la directive `endrepeat`
- `{{_rx}}` : retourne la lettre de l'alphabet correspondant à l'indice de la répétition en cours module 26
- `{{_rm}}` : retourne la valeur maxi possible pour l'indice. Le nombre maxi est déterminé par la directive `repeat` (valeur en dur ou valeur fixée par une variable)

Quand les directives `repeat` sont imbriquées, on peut faire référence à l'indice ou à la valeur maxi d'une directive `repeat` de niveau supérieur. Pour cela on utilise une notation relative entre crochets, [0] étant la répétition courante, [1] la répétition qui la contient ... :  

    # repeat 4
    #   repeat 5
    #     repeat 3
            valeur indice courant                 = {{_ri}} / {{_rm}}  ou  {{_ri[0]}} / {{_rm[0]}}
            valeur indice du niveau intermédiaire = {{_ri[1]}} / {{_rm[1]}}
            valeur indice du niveau supérieur     = {{_ri[2]}} / {{_rm[2]}}
    #     endrepeat
    #   endrepeat
    # endrepeat

#### 🡆 Boucle sur les occurrences d'un groupe

La directive `for` permet de produire pour chaque occurrence d'un groupe toutes les lignes suivantes situées avant le directive `endfor` qui lui correspond. Les directives `repeat`, `for`, `if` et `path` sont imbriquables sans limitation de profondeur.

    # for {{groupe1}}
        appel de paramètre {{groupe1_variable1}}
    # endfor

A l'intérieur d'une boucle on peut utiliser les variables spéciales (ou leur chemin pour éviter toute ambiguïté)

- `{{_i}}` : retourne l'index numérique de l'occurrence de groupe en cours (de 1 à n)
- `{{_x}}` : retourne l'index alphabétique de l'occurrence de groupe en cours (de A à Z) modulo 26
- `{{_n}}` : retourne le nombre d'occurrences du groupe en cours

Si l'une de ces variables est précédée du nom du groupe auquel elle appartient (pour former un chemin), il convient de doubler le caractère `_` qui la démarque. Cette notation est nécessaire
pour lever toute ambiguïté dans les directives `for` imbriquées.

    # for {{groupe1}}
        index boucle de 1er niveau = {{_i}} / {{_n}}                           <== pas d'ambiguïté
        # for {{groupe2}}
            index de la boucle courante = {{_i}}                               <== attention, notation ambiguë !
            index boucle de 1er niveau = {{groupe1__i}}                        <== pas d'ambiguïté
            index boucle de 2nd niveau = {{groupe2__i}} / {{groupe2__n}}       <== pas d'ambiguïté
        # endfor
    # endfor

> Pour un groupe et en-dehors d'une directive `for` attachée à ce groupe, on peut récupérer le nombre d'occurrences du groupe en utilisant la notation `{{groupe__n}}`.  
> On peut aussi récupérer une variable contenue dans une occurrence spécifique du groupe en utilisant la notation `{{groupe[i]_var}}`. L'indice utilisé peut prendre les valeurs 1 à n. Une erreur sera retournée si l'occurrence n'existe pas, stoppant la génération.

#### 🡆 Condition

La directive `if` permet de conditionner toutes les lignes suivantes situées avant le directive `endif` qui lui correspond. Les directives `repeat`, `for`, `if` et `path` sont imbriquables sans limitation de profondeur.

    # if {{variable1}} == 'toto'
        si et seulement si la variable1 est égale à toto
    # endif
 
    # if {{variable1}} > {{variable1}}
        si et seulement si la variable1 est supérieure à la variable2
    # endif

Les opérateurs de comparaison valides :  

- égal : `eq`, `EQ`, `==`, `=`
- différent : `ne`, `NE`, `#`, `!=`, `<>`
- inférieur : `lt`, `LT`, `<`
- inférieur ou égal : `le`, `LE`, `<=`
- supérieur : `gt`, `GT`, `>`
- supérieur ou égal : `ge`, `GE`, `>=`

#### 🡆 Forçage du chemin

La directive `path` permet de forcer le chemin de chaque variable appelée après elle et avant la directive `endpath` qui lui correspond.  Les directives `repeat`, `for`, `if` et `path` sont imbriquables sans limitation de profondeur.

Par exemple la ligne

    variable {{groupe1_toto}} et {{groupe1_titi}}

peut être remplacée par

    # path {{groupe1}}
    variable {{toto}} et {{titi}}
    # endpath

Cette directive peut être utilisée pour simplifier l'écriture d'un squelette ; mais elle révèle tout son sens de par son utilisation indirecte avec la directive `include`.

#### 🡆 Inclusion de squelettes

La directive `include` permet d'appeler un squelette ; l'inclusion est complète à l'emplacement de la directive.

    # include {{groupe}}

Le paramètre `{{groupe}}` est obligatoire, il permet d'indiquer un groupe qui portera le dictionnaire du squelette ainsi que le nom du fichier squelette. Voir la documentation de l'objet groupe dans le paragraphe 'Dictionnaire du squelette'.

La génération du code est toujours précédée par une phase de résolution des inclusions ; pendant celle-ci, chaque directive `include` est remplacée par la séquence `path` suivante :

    # path {{groupe}}
    contenu du squelette inclu (sans ses directives # skodgee et # declare)
    # endpath

#### 🡆 Paramètres spéciaux

Ce sont des paramètres génériques, non définis dans le dictionnaire du squelette, appelable n'importe où dans le corps du squelette.  

- `{{_date}}` : date du jour au format local  
- `{{_ddSmmSyy}}` : date au format JJ/MM/AA  
- `{{_ddSmmSyyyy}}` : date au format JJ/MM/SSAA  
- `{{_yyyyTmmTdd}}` : date au format SSAA-MM-JJ  
- `{{_hhDmmDss}}` : heure au format HH:MM:SS  

#### 🡆 Commentaire

Toute ligne qui débute par le préfixe et n'est pas suivie d'une directive valide est une ligne de commentaire

#### 🡆 Appel du dictionnaire

Avec cette directive on peut inclure dans le texte généré les données relatives au squelette et aux variables qui ont été utilisées pour la génération.

<!-- -->
    # dictionnary compact|compact64|standard|base64|serialize|serialize64|dense|dense64
    formattage : ________________________________________________ :

La ligne qui suit directement la directive force la restitution à s'inscrire dans le champ représentée par la succession de `_` (caractère de soulignement ou underscore).

Plusieurs formats disponibles pour la directive `dictionnary`  

- `compact` : seule les valeurs des variables sont restituées.  
- `compact64` : la restitution est identique à `compact` mais encodée en base64  
- `standard` : le dictionnaire est complet (déclaration + valeurs des variables)  
- `base64` : identique à `standard` mais encodée en base64  
- `serialize` : contient les chemins des variables et leur valeur  
- `serialize64` : identique à `serialize` mais encodée en base64  
- `dense` : plus léger que `serialize`, il contient les mêmes informations mais est moins pratique à décoder
- `dense64` : identique à `dense` mais encodée en base64  

 > Tous les formats sont réinjectables à partir du code source généré pour remonter au squelette ; cependant les formats `compact` et `compact64` ne sont pas compatibles ascendant, c'est à dire que si des nouvelles rubriques ont été ajoutées ou retirées en milieu du
 dictionnaire alors l'injection va provoquer un décalage des valeurs. Les autres formats ne sont pas concernés par cette limitation
 parce qu'ils portent soit la description du dictionnaire d'origine (formats `standard` et `standard64`) soit le chemin des variables
 (formats `serialize`, `serialize64`, `dense` et `dense64`).

Les formats encodés en **base64** permettent d'embarquer le dictionnaire dans des fichiers générés au jeu de caractère réduit, mais sont 30% plus gros que leur équivalent.

_**Comparaison des formats**_

<table>
<thead><tr><th></th><th>ratio taille</th><th>évolution dictionnaire</th><th>human friendly</th><th>computer friendly</th></thead>
<tbody>
<tr><td>standard</td><td>1</td><td>compatible</td><td>lourd</td><td>complet</td></tr>
<tr><td>serialize</td><td>0.7</td><td>compatible</td><td>clair mais partiel</td><td>orienté data</td></tr>
<tr><td>dense</td><td>0.4</td><td>compatible</td><td>clair mais partiel</td><td>peu pratique</td></tr>
<tr><td>compact</td><td>0.15</td><td>limité</td><td>faible</td><td>imprécis</td></tr>
</tbody>
</table>
  
-**Exemple d'implantation et de restitution**_

Par exemple l'extrait d'un squelette ci-dessous

    =====================
    dictionnary compact64
    =====================
    #dictionnary compact64
      >>>> ________________________________________________ <<<<

pourrait produire le résultat suivant

    =====================
    dictionnary compact64
    =====================
      >>>> 007048005dicoeyJzbiI6ImRvYy5za2wiLCJkdCI6IjIwMjE <<<<
      >>>> tMDQtMTFUMjI6MTk6MDUuNDUzWiIsImRhdGEiOlsiQUFBMSI <<<<
      >>>> sIkFBQTIiLFtbIkEiLCJCIixbWyJDIiwiRCJdLFsidmFyNiI <<<<
      >>>> sInZhcjciXV0sIkUiXSxbIkYiLCJHIixbWyJIIiwiSSJdLFs <<<<
      >>>> iSiIsIksiXV0sIkwiXV0sW1siTyIsIlAiXV1dfQ==        <<<<

#### 🡆 Format de la sortie

La directive `format` permet de formatter le résultat de la génération.  
Elle est suivie d'une ligne qui décrit le formattage en utilisant le caractère `_` (undescore ou caractère de soulignement).  
Chaque ligne produite par le squelette est inscrite dans le champ représenté par la succession de `_` et les caractères surnuméraires sont tronqués.

    # format
    formattage : ________________________________________________ :

La directive prend effet pour toutes les lignes produites après elle et jusqu'à la fin du squelette ou jusqu'à la directive `format` suivante.

Deux directives complémentaires ont été définies pour mémoriser le format courant puis le récupérer plus tard. La mémorisation se fait par la
directive `pushformat` et la récupération par la directive `popformat`. Attention à ne pas boucler de façon non contrôlé sur la directive
`pushformat` afin de ne pas provoquer un débordement de pile. L'intérêt de ces directives est de permettre de récupérer un format précédent
sans le connaître. Ceci peut arriver si on fait appel par include à un squelette qui doit modifier le format provisoirement.

#### 🡆 Définition et utilisation de modèles

La directive `model` permet de déclarer un ensemble de lignes réutilisables et de lui associer un nom pour pouvoir le rappeler avec la directive `usemodel`.
La déclaration d'un ensemble se fait entre les directives `model` et  `endmodel`.

    # model nomDuModele
    ces lignes forment le 
    modèle nommé nomDuModele
    # endmodel

Une directive `model` ne peut être imbriquée dans une autre directive `model`, mais elle peut être déclarée dans tout squelette,
même dans un squelette appelé par la directive `include`. De plus, dans un modèle, on peut appeler un squelette, mais ni ce squelette,
ni tout squelette inclu dans ce squelette ne peut déclarer un modèle puisque l'imbrication de modèle n'est pas autorisée.

Si une directive `model` associe un nom identique à une directive `model` précédente, alors elle la remplace.

A chaque fois que la directive `usemodel` est rencontrée elle est remplacée par le contenu du dernier modèle de même nom précédemment déclaré auquel elle fait référence.

    # usemodel nomDuModele

L'utilisation d'une directive `usemodel` dans une directive `model` est sans effet, on ne pourra donc pas utiliser cette directive pour provoquer une imbrication de modèle.

> Si un modèle provient d'un squelette appelé par `include`, et de ce modèle fait référence à des variables définie dans ce squelette, alors il faut inclure la directive `usemodel` dans une directive `path` qui pointe sur le groupe défini pour l'appel de l'include.

#### 🡆 Variable de type chaine de caractère

La directive `defstr` permet de définir une variable de travail alphanumérique.

    # defstr variableDeTravail valeur

Le nom de la variable de travail est libre et sa valeur initiale est donnée par la totalité des caractères qui suivent, incluant même
les espaces jusqu'à la fin de ligne. On peut composer la valeur en appelant d'autres variables.

Si lors de la génération une directive `defstr` est rencontrée plus d'une fois pour déclarer une même variable de travail, alors la génération
est stoppée en erreur. On s'interdira donc d'utiliser une directive `defstr` dans une répétition ou une boucle.

La directive `calc` permet d'affecter une nouvelle valeur à la variable déclarée par `defstr`.

    # calc variableDeTravail formule

La formule suit les mêmes règles que pour la directive `defnum`. Il est aussi possible d'utiliser
la variable de travail elle-même dans la formule de calcul. Le résultat est une concaténation de toutes les données qui composent la formule.

Pour utiliser la variable de travail on doit systématiquement la faire précéder d'un double underscore `{{__variableDeTravail}}`.

Quand on utilise la directive `if` avec une variable définie par la directive `defstr` pour la comparer à une chaine de caractère, alors
il faut encadrer la chaine de caractère avec des simples quotes (apos), sinon le résultat de la comparaison ne sera pas prévisible.

#### 🡆 Opérations numériques

La directive `defnum` permet de déclarer une variable de travail numérique.

    # defnum variableDeTravail formule

Le nom de la variable de travail est libre et sa valeur initiale est donnée par la formule qui la suit.
Cette formule doit être exprimée en notation arithmétique avec la possibilité d'utiliser dans la formule
toutes les variables nécessaires, celles-ci pouvant être soient des variable déclarées au dictionnaire,
soient des variables de tavail ou des variables techniques, c'est à dire des variables issues de l'application
de toute autre directive précédente ; elles devront également être numériquement valides au moment de l'application de la déclaration.

Si lors de la génération une directive `defnum` est rencontrée plus d'une fois pour déclarer une même variable de travail, alors la génération
est stoppée en erreur. On s'interdira donc d'utiliser une directive `defstr` dans une répétition ou une boucle.

La variable de travail est valide à partir de la directive `defnum` et ne peut-être déclarée à nouveau dans la suite du squelette.

La directive `calc` permet faire des opérations sur une variable déclarée par `defnum`.

    # calc variableDeTravail formule

La formule suit les mêmes règles que pour la directive `defnum`. Il est aussi possible d'utiliser la variable de travail elle-même dans la formule de calcul.

Pour utiliser un variable de travail on la fait systématiquement précéder d'un double underscore `{{__variableDeTravail}}` ;
bien que le double underscore soit déjà utilisé pour les variables techniques de boucles et
de répétition quand elle sont préfixées par un chemin, cette notation est ici non ambiguë puisqu'une
 variable de travail n'est jamais évaluée dans un chemin, sa portée étant valide depuis sa déclaration et jusqu'à la fin du squelette.
