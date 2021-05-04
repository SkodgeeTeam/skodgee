# SKodgee 
SKodgee Obviously Designed for Generation Enhanced Efficiently

[Consulter la version française](https://github.com/SkodgeeTeam/skodgee/blob/main/README.fr.md)

## What it is

SKodgee is a tool for code and document skeleton developers.
It allows to generate structured sets of code or text by simply
applying directives that use structured data provided by the user.

## How it works

Three possibilities for the user:  
[1] - Launch SKodgee to generate a new document by choosing one of the skeletons
 then filling in the requested structured data.  
[2] - Ask Skodgee to start from a document to identify the skeleton,
retrieve the values of the generation data and automatically propose to redo a new generation in the interface
generation in the interface described in point [1].  
[3] - Develop a skeleton by generating the generation interface starting from the skeleton under development.
the skeleton under development.

## Create a new document

From the command palette call "SKodgee - generation based on skeleton" to launch the user 
interface. It proposes to choose a skeleton and to load it.
A form is then built automatically after analysis by Skodgee of the chosen skeleton.

The interface also shows 2 panels that allow to visualize the skeleton and 
to consult the dictionary that has been extracted.

The user has to fill in the form and then ask for the code generation.
The panel on the right shows the result of the generation (or messages 
when the generation did not work correctly).

To the left of the other panel and over its entire height is a button marked
symbol (pipe or vertical bar). By clicking on this button the user can
toggle the panels to display one, the other or both at the same time.

The text contained in each panel can be selected and copied.

When a generation is successful, an additional button proposes to recover the generated code.
This allows the result to be automatically copied into a new editing tab. The user can
take advantage of this new tab to perform selection, modification, comparison operations...

## Correct a document

If a document generated with SKodgee contains the dictionary that allowed its generation (1), then
the user can call the command "SKodgee - reverse from generated with dictionary" from the
palette. 

Automatically, the user interface is displayed with the form pre-filled with the
the values that generated the document in the first place. In addition to the dictionary, the skeleton must
be accessible to SKodgee. This technique allows to correct a document for which we have to
to modify one or more values and also to take into account all the evolutions which
could have been made on the skeleton since the generation of the document. 

The result of the 
generation can then be compared to the original document and the user can use the comparison
capabilities of VSCode to reintegrate all the parts that were not generated by a generation
but had been added manually to the document.

 _(1) : the skeleton must contain a valid `dictionnary` directive in order to generate a correctable document_.