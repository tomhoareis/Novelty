
/*
    Break_Before_Style
    Version: 1.0

    Bruno Herfst 2017

*/

// ToDo: Run over all stories

var Doc = app.documents[0];

// Create list of paragraph styles
var pStyleNames = [];
var pStyles = [];

for(i = 0; i < Doc.paragraphStyles.length; i++) {
    pStyleNames.push(Doc.paragraphStyles[i].name);
    pStyles.push(Doc.paragraphStyles[i]);
}

for(i = 0; i < Doc.paragraphStyleGroups.length; i++) {
    for(b = 0; b < Doc.paragraphStyleGroups[i].paragraphStyles.length; b++) {
        pStyleNames.push(Doc.paragraphStyleGroups[i].name+'/'+Doc.paragraphStyleGroups[i].paragraphStyles[i].name);
        pStyles.push(Doc.paragraphStyleGroups[i].paragraphStyles[i]);
    }
}

// Create UI
var ui = app.dialogs.add({name:"Fix paragraph style pairs"});

with(ui.dialogColumns.add()){
    with(dialogRows.add()){
        staticTexts.add({staticLabel:"PageBreak before:"});
    }
    with(borderPanels.add()){
        var paragraphDD = dropdowns.add({stringList:pStyleNames, selectedIndex:0});
    }
}

ui.show();

// find paragraph
var selectedStyle = pStyles[paragraphDD.selectedIndex];

// Set find grep preferences to find all paragraphs with selected paragraph style
app.findChangeGrepOptions.includeFootnotes = false;
app.findChangeGrepOptions.includeHiddenLayers = false;
app.findChangeGrepOptions.includeLockedLayersForFind = false;
app.findChangeGrepOptions.includeLockedStoriesForFind = false;
app.findChangeGrepOptions.includeMasterPages = false;
app.findGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.appliedParagraphStyle = selectedStyle;
app.findGrepPreferences.findWhat = "$";

//Seatch all stories
var foundParas = Doc.findGrep();

var appendParas = [];

// Loop through the paragraphs and create a list of any previous paragrahs we want to append a page-break to.
// This reason for this is two-fold:
// Firstly because we want the page break to be in the style of the previous paragraph at the end.
// Secondly we don't want to add a page break if the style is the first paragraph in the story.

myCounter = 0;

var i = foundParas.length;
while(i--) {
    try {
        // If we can find a previous paragraph create a reference to it.
        // The quickest way to do this is via the story's charater reference
        // as discussed here: https://forums.adobe.com/thread/757619

        var storyIndex = foundParas[i].paragraphs[0].characters[0].index;
        var myStory    = foundParas[i].paragraphs[0].parentStory;

        if(storyIndex > 0) {
            var previousParagraph = myStory.characters[storyIndex-1].paragraphs[0];
            if(previousParagraph.isValid) {
                appendParas.unshift(previousParagraph);
            }
        }
    } catch(err) { alert(err) }
}

// Insert the frame breaks
var i = appendParas.length;
while(i--) {
    var myStory = appendParas[i].parentStory;
    var lastCharIndex = appendParas[i].characters[-1].index;
    try {
        var lastCharCode = myStory.characters[lastCharIndex].contents.charCodeAt(0);
    } catch ( err ) {
        var lastCharCode = 0;
    }
    
    // Insert pagebreak
    appendParas[i].insertionPoints[-1].contents = SpecialCharacters.FRAME_BREAK;
    
    if( lastCharCode == 13 ){ //remove
        myStory.characters[lastCharIndex].remove();
    }
}

alert("Added " + appendParas.length + " frame breaks.");

