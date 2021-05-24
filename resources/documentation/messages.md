# Description des événements et messages échangés entre l'extension et le webview

## Cinématique "génération à partir d'une sélection de squelettes"

                         ╭───────────────────────────────╮
    webview   →          │ commande "skodgee.generation" │        → extension
                         ╰───────────────┬───────────────╯
                                         │
                                         ↓     ╭────◂────╮
                           ╭─────────────┴─────┴──────╮  │
    extension →            │  message "bindSkeleton"  │  ↑            → webview
                           ╰─────────────┬─────┬──────╯  │
                                         ↓     ╰─────▸───╯
                                         │
                         ╭───────────────┴───────────────╮
    webview   →          │    message "loadSkeleton"     │            → extension
                         ╰───────────────┬───────────────╯
                                         ├──────────────────────────────────────────┐
                                         ↓                                          ↓
                    ╭────────────────────┴───────────────────╮   ╭──────────────────┴───────────────────╮
    extension →     │    message "loadSkeletonOnSuccess"     │   │    message "loadSkeletonOnError"     │   → webview
                    ╰────────────────────┬───────────────────╯   ╰──────────────────┬───────────────────╯
                                         ├──────────◂───────────╮                 ──┴──
                                         ↓                      |
                    ╭────────────────────┴───────────────────╮  │
    webview   →     │   message "variableChangePropagation"  │  │     → extension
                    ╰────────────────────┬───────────────────╯  │
                                         ↓                      ↑
                       ╭─────────────────┴────────────────╮     │
    extension →        │  message "afterVariableChanged"  │     │     → webview
                       ╰─────────────────┬──────────┬─────╯     │
                                         ↓          ╰─────▸─────╯
                                         │
                         ╭───────────────┴───────────────╮
    webview   →          │   message "resolveSkeleton"   │            → extension
                         ╰───────────────┬───────────────╯
                                         ├──────────────────────────────────────────┐
                                         ↓                                          ↓
                    ╭────────────────────┴───────────────────╮   ╭──────────────────┴───────────────────╮
    extension →     │   message "resolveSkeletonOnSuccess"   │   │   message "resolveSkeletonOnError"   │   → webview
                    ╰────────────────────┬───────────────────╯   ╰──────────────────────────────────────╯
                                         ↓                                        ──┴──
                   ╭─────────────────────┴──────────────────────╮
    webview   →    |   message "editGeneratedCodeInNewEditor"   │  → extension
                   ╰─────────────────────┬──────────────────────╯
                                         ↓
                      ╭──────────────────┴───────────────────╮ 
    extension →       | ouverture d'un nouvel onglet avec le |
                      |      contenu du document généré      | 
                      ╰──────────────────────────────────────╯

## Cinématique "revenir au squelette"

                         ╭───────────────────────────────╮
    webview   →          │   commande "skodgee.inject"   │        → extension
                         ╰───────────────┬───────────────╯
                                         ↓
                         ╭───────────────┴───────────────╮
    extension →          │ commande "skodgee.generation" │        → extension
                         ╰───────────────┬───────────────╯
                                         │
                                         ↓     ╭────◂────╮
                           ╭─────────────┴─────┴──────╮  │
    extension →            │  message "bindSkeleton"  │  ↑        → webview
                           ╰─────────────┬─────┬──────╯  │
                                         ↓     ╰─────▸───╯
                                         │
                         ╭───────────────┴───────────────╮
    webview   →          │   message "resolveSkeleton"   │        → extension
                         ╰───────────────┬───────────────╯
                                         ├──────────────────────────────────────────┐
                                         ↓                                          ↓
                    ╭────────────────────┴───────────────────╮   ╭──────────────────┴───────────────────╮
    extension →     │   message "resolveSkeletonOnSuccess"   │   │   message "resolveSkeletonOnError"   │   → webview
                    ╰────────────────────────────────────────╯   ╰──────────────────────────────────────╯

## Cinématique "tester le squelette"

                        ╭────────────────────────────────╮
    webview   →         │   commande "skodgee.develop"   │        → extension
                        ╰────────────────┬───────────────╯
                                         ├──────────────────────────────────────────┐
                                         ↓                                          ↓
                    ╭────────────────────┴───────────────────╮   ╭──────────────────┴───────────────────╮
    extension →     │   message "developSkeletonOnSuccess"   │   │   message "developSkeletonOnError"   │   → webview
                    ╰────────────────────┬───────────────────╯   ╰──────────────────┬───────────────────╯
                                         ↓                                        ──┴──
                         ╭───────────────┴───────────────╮
    webview   →          │   message "resolveSkeleton"   │        → extension
                         ╰───────────────┬───────────────╯
                                         ├──────────────────────────────────────────┐
                                         ↓                                          ↓
                    ╭────────────────────┴───────────────────╮   ╭──────────────────┴───────────────────╮
    extension →     │   message "resolveSkeletonOnSuccess"   │   │   message "resolveSkeletonOnError"   │   → webview
                    ╰────────────────────────────────────────╯   ╰──────────────────────────────────────╯

## Evénements déclenchés par l'utilisateur

### skodgee.generation

Depuis la palette de commande, par la commande "SKodgee - génération à partir d'une sélection de squelettes"
provoque l'exploration par l'extension des répertoires paramétrés dans l'extension pour identifier tous les
squelettes non cachés (çàd sans propriété hidden) et l'émission vers le webview de la liste de ces squelette
par le message "bindSkeleton" (1 message émis par squelette)

### skodgee.inject

Depuis un document généré (et uniquement si il contient un dictionnaire valorisé), par la commande
"SKodgee - revenir au squelette", déclenche un événement skodgee.generation avec le dictionnaire fourni ce qui va
forcer la sélection, le chargement du squelette et la valorisation des données du formulaire.

### skodgee.develop

Depuis le code source d'un squelette, par la commande "SKodgee - tester le squelette"
provoque l'émission du message "developSkeletonOnSuccess" par l'extension

## Messages émis par l'extension, traités par le webview

### bindSkeleton

### loadSkeletonOnSuccess

    {
        command:'loadSkeletonOnSuccess',
        name: nom du fichier squelette,
        location: tableau des emplacements de fichiers squelette,
        source: source squelette après résolution des modèles,
        sourceBrut: source squelette,
        dictionnary: dictionnaire valorisé si injection,
        values: tableau des valeurs pour alimenter les champs du formulaire [value|values,...]
    }

### loadSkeletonOnError

    {
        command: 'loadSkeletonOnError',
        error: détail de l'erreur,
        log: pseudo dump 
    }

### resolveSkeletonOnSuccess

Ce message est émis après réussite de skeleton.resolveSkeleton sur les paramètres name, source, encodedVars, analyzeResult
envoyés par le webview par un message resolveSkeleton.

    {
        command: 'resolveSkeletonOnSuccess',
        name: message.skeleton,
        resolvedSkeleton : résultat de skeleton.resolveSkeleton
    }

### resolveSkeletonOnError

Si le webview a envoyé un message resolveSkeleton avec des paramètres encodedVars et analyzeResult
qui ne sont pas identiques, alors l'extension déclenche d'une exception pour signaler
que le webview a échoué à transcrire dans le dictionnaire les valeurs provenant du formulaire.

    {
        command: 'resolveSkeletonOnError',
        error: détail de l'erreur
    }

### developSkeletonOnSuccess

Ce message est émis après traitement de l'événement skodgee.injection si aucune anomalie n'est détectée dans la
séquence suivante :

1 - skeleton.extendDictionnaryWithIncludes sur le source de squelette reçu de l'événement déclencheur  
2 - skeleton.resolveModels sur le source étendu résultat de 1  
3 - skeleton.generateValuesFromDictionnary sur le dictionnaire résultat de 1 pour récupération des valeurs
initiales qui sont soit celles codées dans le dictionnaire, soit le nom de la variable.  
4 - émission

    {
        command:'developSkeletonOnSuccess',
        source: source squelette après résolution des modèles (résultat de 2),
        sourceBrut: source squelette remis en forme pour affichage (résultat de 1),
        dictionnary: dictionnaire valorisé si injection (résultat de 1),
        values: tableau des valeurs initiales pour alimenter les champs du formulaire [value|values,...] (résultat de 3)
    }

### developSkeletonOnError

    {
        command: 'developSkeletonOnError',
        error: détail de l'erreur
    }

### afterVariableChanged

Ce message est émis pour répondre au message 'variableChangePropagation' émis par
le webview.

Le message retourne un dictionnaire dont les variables dépendantes peuvent avoir été
mises à jour après résolution de leurs paramètres de valorisation.

    {
        command: 'afterVariableChanged',
        name: nom du squelette,
        source: source du squelette,
        dictionnary: dictionnaire après résolution des paramètres,
        values: valeurs
    }

## Messages émis par le webview, traités par l'extension

### loadSkeleton

    { 
        command:'loadSkeleton',
        skeleton:'nom du fichier squelette,
        values?: liste des valeurs provenant d'un dictionnaire embarqué dans un document [{path:,value:},...]
    }

    réponses possibles :
    - loadSkeletonOnSuccess
    - loadSkeletonOnError

### resolveSkeleton

    {
        command:'resolveSkeleton',
        encodedVars:dictionnaire valorisé avec les saisies,
        name:nom du squelette ou à blanc si on est sur un squelette en cours de mise au point
        source:source du squelette,
        analyzeResult:dictionnaire valorisé avec les saisies
    }

    réponses possibles : 
    - resolveSkeletonOnSuccess
    - resolveSkeletonOnError

### variableChangePropagation

Ce message est émis à chaque fois qu'une variable mère de dépendances sur d'autres
variable change de valeur. Le but est de recevoir en retour un dictionnaire sur lequel
aura été appliqué pour chaque variables dépendantes la résolution de leurs valeurs.

    {
        command:"variableChangePropagation",
        variable:variable dont la valeur a changé,
        value:nouvelle valeur de la variable,
        name:nom du squelette,
        sourcesource du squelette,
        dictionnary:dictionnaire valorisé avec les saisies
    }

## Formats

### path

    chemin univoque complet vers une variable, utilisé pour produire un vidage de dictionnaire embarqué dans le document

    ─▸──┬───────────────────────▸────────────────────┬──▸─( var )
        ├──────────▸────────( group> )───────▸───────┤
        ├──▸──( group[ )──▸──( indice )─▸──( ]> )──▸─┤
        ╰────────────────────────◂───────────────────╯





─│┌┐└┘├┤┬┴┼┼╯╭╮╰▸◂▸▾▴←↑→↓⋄⬦◇⤓

