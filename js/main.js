// JS DOM ELEMENTS
const MAIN_TEXT_SECTION = document.querySelector('#textSection'),
    MAIN_TEXT_SECTION_COMP_STYLE = window.getComputedStyle(MAIN_TEXT_SECTION),
    ITEM_ADDED_TEXT_SECTION = document.querySelector('#itemAddedText'),
    ITEM_ADDED_TEXT_SECTION_COMP_STYLE = window.getComputedStyle(ITEM_ADDED_TEXT_SECTION),

    INPUT_SECTION = document.querySelector('#inputSection'),
    INPUT_SECTION_COMP_STYLE = window.getComputedStyle(INPUT_SECTION),
    NAME_LETTERS_ELEMENTS = [],
    CHOICE_BUTTONS = [],
    MAX_NUMBER_TEXT_CHOICES = 4,

    MODAL_BG = document.querySelector('#modalBg'),
    MODALS = {
        'MENU': {
            'ELEMENT': document.querySelector('#menuModal'),
            'COMPSTYLE': window.getComputedStyle(document.querySelector('#menuModal')),
            'HEADER': document.querySelector('#menuModalHeader'),
            'MAIN': document.querySelector("#menuModalMain")
        },
        'CONFIRM': {
            'ELEMENT': document.querySelector('#confirmModal'),
            'COMPSTYLE': window.getComputedStyle(document.querySelector('#confirmModal')),
            'HEADER': document.querySelector('#confirmModalHeader'),
            'MAIN': document.querySelector("#confirmModalMain"),
            'BUTTONS': {
                'YES': document.querySelector('#confirmModalButtonYes'),
                'NO': document.querySelector('#confirmModalButtonNo')
            }
        }
    }

    LOG_BUTTON = document.querySelector('#logButton'),
    OPTIONS_BUTTON = document.querySelector('#optionsButton'),
    
    INVENTORY_BUTTON = document.querySelector('#inventoryButton'),
    INVENTORY_MENU = document.querySelector('#inventoryMenu'),
    INVENTORY_MENU_COMP_STYLE = window.getComputedStyle(INVENTORY_MENU),
    INVENTORY_MENU_TEXT = document.querySelector('#inventoryMenuText'),

    TEXT_SPEEDS = {
        'NORMAL': 0.030,
        'SCENARIO_CHANGE': 0.1,
        'SURPRISE': 0.0025,
        'SUSPENSE': 0.2
    };

for(let currentLetter = 0; currentLetter < 20; currentLetter++) NAME_LETTERS_ELEMENTS.push(document.querySelector('#nameLetter' + currentLetter))
for(let currentButton = 0; currentButton < 4; currentButton++){
    CHOICE_BUTTONS.push({
        'ELEMENT': document.querySelector('#choiceButton' + currentButton),
        'COMPSTYLE': window.getComputedStyle(document.querySelector('#choiceButton' + currentButton))
    })
}

let awaitingInput = false,
    logText = '',
    modalActive = null,

    eventIterator = -1,
    currentEvent = {},
    currentEventType = 'NORMAL'
    currentTextBlock = '',
    currentTextSpeed = 'NORMAL',

    lastEventCheckpoint = {'EVENT_ID': 0, 'CHOICE_ROUTE': '0'},
    infoGatheringCheckpoints = [],
    currentInfoGatheringCheckpoint = -1,
    reachedInfoGatheringAnswerEnd = false,

    choiceRoute = ["0"],
    currentChoice = null
    previousChoice = null,

    currentCursorPosition = 0,
    playerName = [null, null],
    
    playerInventory = {};
                              
// MAIN GAME EVENTS FUNCTIONS
function startNextEvent(){

    // EVENT CHANGE
    // Advances to next event
    eventIterator += 1
    // Resets game if it reaches the end
    if(eventIterator == SCRIPT.length){
        eventIterator = 0
    }

    // EVENT CHOICE ROUTING
    // Goes to last choice layer possible
    currentEvent = SCRIPT[eventIterator]
    choiceRouteLayer = 1
    while(currentEvent.hasOwnProperty(choiceRoute.slice(0, choiceRouteLayer).join('.'))){
        currentEvent = currentEvent[choiceRoute.slice(0, choiceRouteLayer).join('.')]  
        choiceRouteLayer++
    }
    choiceRouteLayer--
    
    // If it reaches a layer that doesn't exist anymore, goes to a previous layer (the narrative unifies)
    if(!currentEvent.hasOwnProperty(choiceRoute.slice(0, choiceRouteLayer).join('.'))){
        for(let lastChoiceLayer = choiceRoute.length - 1; lastChoiceLayer >= choiceRouteLayer; lastChoiceLayer--) choiceRoute.pop()
    }

    // Gets event type
    currentEventType = currentEvent['EVENT_TYPE']
    
    // Sets current info remaining according to the choices of the event
    if(currentEventType == "INFO_GATHERING"){
        infoGatheringCheckpoints.push({
            'EVENT_ID': eventIterator,
            'CHOICE_ROUTE': JSON.parse(JSON.stringify(choiceRoute)), // Creates deep copy of the object
            'INFO_REMAINING': currentEvent['CHOICES']
        })
        currentInfoGatheringCheckpoint++
    }

    // Clears info remaining if all choices have already been picked
    if(currentInfoGatheringCheckpoint > -1 && Object.keys(infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['INFO_REMAINING']).length == 0){
        infoGatheringCheckpoints.pop()
        currentInfoGatheringCheckpoint--
    }

    // Text selection
    currentTextBlock = currentEvent['TEXT']
    currentTextBlock = currentTextBlock.map(textLine => textLine.replace('playerName0', playerName[0]).replace('playerName1', playerName[1]))
    currentTextSpeed = currentEvent['TEXT_SPEED']

    // Display text animation loop
    ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'RUNNING'
    let textCharIterator = 0,
    textLineIterator = 0;
    ANIMATIONS['DISPLAY_TEXT']['LOOP'] = setInterval(() => {
        if(textLineIterator < currentTextBlock.length){
            if(textCharIterator < currentTextBlock[textLineIterator].length){
                MAIN_TEXT_SECTION.innerHTML += currentTextBlock[textLineIterator][textCharIterator]
                textCharIterator++;
            }
            else{
                textLineIterator++;
                textCharIterator = 0;
                MAIN_TEXT_SECTION.innerHTML += "<br>"
            }
        }else{
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING'

            // Shows additional line in case of being an "item added" type of event
            if(currentEventType == 'ITEM_ADDED'){

                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] = 'RUNNING'
                ITEM_ADDED_TEXT_SECTION.innerHTML = currentEvent['ITEM_ADDED_TEXT']
                ITEM_ADDED_TEXT_SECTION.style.display = 'inline'
                MAIN_TEXT_SECTION.append(ITEM_ADDED_TEXT_SECTION)

                // Initiates fade-in animation
                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['LOOP'] = setInterval(() =>
                    ITEM_ADDED_TEXT_SECTION.style.opacity = parseFloat(ITEM_ADDED_TEXT_SECTION_COMP_STYLE.getPropertyValue('opacity')) + 0.1
                , 20)
                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['CALLBACK'] = setTimeout(() => {
                    clearInterval(ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['LOOP']);
                    ITEM_ADDED_TEXT_SECTION.style.opacity = 1;
                    logText += '<span>' + currentEvent['ITEM_ADDED_TEXT'] +"</span>"
                    ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] = 'NOT RUNNING';
                    startInputPhase()
                }, 200)
            }
            else{
                startInputPhase()
            }
        }
    }, TEXT_SPEEDS[currentTextSpeed] * 1000)

}

function startInputPhase(){

    if(currentEventType == 'NAME' || currentEventHasChoices()){
        awaitingInput = true
        if(currentEventType != "NAME"){

            let choices = null;

            // Checks if the event has choices
            if(currentEvent.hasOwnProperty('CHOICES')){ 
                choices = JSON.parse(JSON.stringify(currentEvent['CHOICES'])) // Creates deep copy of the object

                // Deletes last choice if it's an info gathering starting event
                if(currentEventType == 'INFO_GATHERING') delete choices[Object.keys(choices).at(-1)]

            }

            // or else it's an info gathering returning event
            else {
                choices = JSON.parse(JSON.stringify(infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['INFO_REMAINING'])) // Creates deep copy of the object
                if (stillHasInfoToGather()) delete choices[Object.keys(choices).at(-1)]
            }

            // Display choices on input section
            Object.keys(choices).forEach((choiceVal, index) => {
                CHOICE_BUTTONS[index]['ELEMENT'].innerHTML = choices[choiceVal]
                CHOICE_BUTTONS[index]['ELEMENT'].style.display = 'flex'
                CHOICE_BUTTONS[index]['ELEMENT'].setAttribute('choiceval', choiceVal)
            })
            INPUT_SECTION.style.flexDirection = 'column'
            INPUT_SECTION.style.justifyContent = 'flex-start'
            INPUT_SECTION.style.alignItems = 'flex-start'
        }
        INPUT_SECTION.style.display = 'flex'

        // Initiates fade-in animation
        ANIMATIONS['DISPLAY_INPUT_SECTION']['STATE'] = 'RUNNING'
        ANIMATIONS['DISPLAY_INPUT_SECTION']['LOOP'] = setInterval(() =>
            INPUT_SECTION.style.opacity = parseFloat(INPUT_SECTION_COMP_STYLE.getPropertyValue('opacity')) + 0.1
        , 20)
        ANIMATIONS['DISPLAY_INPUT_SECTION']['CALLBACK'] = setTimeout(() => {
            clearInterval(ANIMATIONS['DISPLAY_INPUT_SECTION']['LOOP']);
            INPUT_SECTION.style.opacity = 1;
            ANIMATIONS['DISPLAY_INPUT_SECTION']['STATE'] = 'NOT RUNNING';

            // Starts typing cursor animation in case of being the naming event
            if(currentEventType == "NAME"){
                ANIMATIONS['NAME_TYPING_CURSOR']['STATE'] = 'RUNNING'
                ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'] = setInterval(() => {
                    if(currentCursorPosition < 20){
                        toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition], "left")
                    }else{
                        toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition - 1], "right")
                    }
                }, 400)
            }
        }, 200)
    }
    else if (currentEventType == 'ITEM_ADDED'){

        // Checks if item is stackable and already exists on the player inventory
        if(ITEMS[currentEvent['ITEM_ADDED_ID']]['IS_STACKABLE'] && playerInventory.keys().includes(currentEvent['ITEM_ADDED_ID'])){
            playerInventory[currentEvent['ITEM_ADDED_ID']]['QUANTITY'] += 1
        }
        // If not, then adds item to the inventory
        else{
            playerInventory[currentEvent['ITEM_ADDED_ID']] = JSON.parse(JSON.stringify(ITEMS[currentEvent['ITEM_ADDED_ID']])) // Creates deep copy of the object
            if(INVENTORY_MENU_TEXT.innerHTML.includes('-- Empty Inventory --')) INVENTORY_MENU_TEXT.innerHTML = ''
            INVENTORY_MENU_TEXT.insertAdjacentHTML('beforeend', 
                `<button class="itemButton" itemId="${currentEvent['ITEM_ADDED_ID']}" title="${ITEMS[currentEvent['ITEM_ADDED_ID']]['DESCRIPTION']}">` +
                    `<i class="itemIcon ${ITEMS[currentEvent['ITEM_ADDED_ID']]['ICON']}"></i>` +
                    `- ${ITEMS[currentEvent['ITEM_ADDED_ID']]['NAME']}`+
                `</button>`)
        }

    }
}

// Every time the player holds "S" or press "Space/Enter"
function advanceText(){
    if(!awaitingInput){

        // Checks if letters are being draw
        if(ANIMATIONS['DISPLAY_TEXT']['STATE'] == 'RUNNING'){

            // Shows the entire text at once
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            MAIN_TEXT_SECTION.innerHTML = currentTextBlock.join('<br>') + '<br>'
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING';

            // Shows additional line in case of being an "item added" type of event
            if(currentEventType == 'ITEM_ADDED'){

                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] = 'RUNNING'
                ITEM_ADDED_TEXT_SECTION.innerHTML = currentEvent['ITEM_ADDED_TEXT']
                ITEM_ADDED_TEXT_SECTION.style.display = 'inline'
                MAIN_TEXT_SECTION.append(ITEM_ADDED_TEXT_SECTION)

                // Initiates fade-in animation
                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['LOOP'] = setInterval(() =>
                    ITEM_ADDED_TEXT_SECTION.style.opacity = parseFloat(ITEM_ADDED_TEXT_SECTION_COMP_STYLE.getPropertyValue('opacity')) + 0.1
                , 20)
                ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['CALLBACK'] = setTimeout(() => {
                    clearInterval(ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['LOOP']);
                    ITEM_ADDED_TEXT_SECTION.style.opacity = 1;
                    logText += '<span>' + currentEvent['ITEM_ADDED_TEXT'] +"</span>"
                    ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] = 'NOT RUNNING';
                    startInputPhase()
                }, 200)
            }
            else{
                startInputPhase()
            }
        }

        // Checks if the item added line is being shown
        else if(ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] == 'RUNNING'){

            // Shows the entire text at once
            clearInterval(ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['LOOP'])
            ITEM_ADDED_TEXT_SECTION.style.opacity = 1
            ITEM_ADDED_TEXT_SECTION.style.display = 'inline'
            MAIN_TEXT_SECTION.append(ITEM_ADDED_TEXT_SECTION)
            logText += '<span>' + currentEvent['ITEM_ADDED_TEXT'] +"</span>"
            ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] = 'NOT RUNNING';
            startInputPhase()

        }

        // Checks if text is already full shown
        else if(ANIMATIONS['CLEAR_TEXT']['STATE'] == 'NOT RUNNING' && ANIMATIONS['DISPLAY_ITEM_ADDED_TEXT']['STATE'] == 'NOT RUNNING'){

            // Starts clearing text animation
            ANIMATIONS['CLEAR_TEXT']['STATE'] = 'RUNNING'
            ANIMATIONS['CLEAR_TEXT']['LOOP'] = setInterval(() => {
                if(elementIsVisible(INPUT_SECTION_COMP_STYLE)){
                    INPUT_SECTION.style.opacity = parseFloat(INPUT_SECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1;
                }  
                MAIN_TEXT_SECTION.style.opacity = parseFloat(MAIN_TEXT_SECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1;
            }, 50)
            ANIMATIONS['CLEAR_TEXT']['CALLBACK'] = setTimeout(() => {

                // Upon finishing the text clearing animation, clears the input and item added sections too
                clearInterval(ANIMATIONS['CLEAR_TEXT']['LOOP']);
                if(elementIsVisible(INPUT_SECTION_COMP_STYLE)){ 
                    INPUT_SECTION.style.opacity = 0.1;
                    INPUT_SECTION.style.display = 'none';
                    CHOICE_BUTTONS[currentChoice]['ELEMENT'].style.display = 'none'
                }
                if(elementIsVisible(ITEM_ADDED_TEXT_SECTION_COMP_STYLE)){
                    ITEM_ADDED_TEXT_SECTION.style.display = 'none'
                    ITEM_ADDED_TEXT_SECTION.style.opacity = 0
                }
                MAIN_TEXT_SECTION.innerHTML= '';
                MAIN_TEXT_SECTION.style.opacity = 1;
                ANIMATIONS['CLEAR_TEXT']['STATE'] = 'NOT RUNNING';
                startNextEvent();

            }, 500)
        }

        // Checks if text is fading out
        else if(ANIMATIONS['CLEAR_TEXT']['STATE'] == 'RUNNING'){
            clearInterval(ANIMATIONS['CLEAR_TEXT']['LOOP'])
            clearTimeout(ANIMATIONS['CLEAR_TEXT']['CALLBACK'])
            ANIMATIONS['CLEAR_TEXT']['STATE'] = 'NOT RUNNING';
            MAIN_TEXT_SECTION.innerHTML= '';
            MAIN_TEXT_SECTION.style.opacity = 1;

            // Upon finishing the text clearing animation, clears the input and item added sections too
            if(elementIsVisible(INPUT_SECTION_COMP_STYLE)){
                INPUT_SECTION.style.opacity = 0.1;
                INPUT_SECTION.style.display = 'none';
                CHOICE_BUTTONS[currentChoice]['ELEMENT'].style.display = 'none'
            }
            if(elementIsVisible(ITEM_ADDED_TEXT_SECTION_COMP_STYLE)) {
                ITEM_ADDED_TEXT_SECTION.style.display = 'none'
                ITEM_ADDED_TEXT_SECTION.style.opacity = 0
            }

            startNextEvent();
        }

    }
}

// ANIMATION FUNCTIONS
function toggleModal(modalType, menuType = null, itemId = null){
    if(ANIMATIONS['TOGGLE_MODAL']['STATE'] == 'NOT RUNNING' && !anyOtherModalIsVisible(modalType)){
        ANIMATIONS['TOGGLE_MODAL']['STATE'] = 'RUNNING'
        if(MODALS[modalType]['COMPSTYLE'].getPropertyValue('display') == 'none'){
            if(modalType == 'MENU'){
                if(menuType == 'LOG' || menuType == 'OPTIONS') MODALS[modalType]['HEADER'].innerHTML = menuType.charAt(0) + menuType.slice(1).toLowerCase();
                switch(menuType){
                    case 'LOG':
                        if (logText.length >= 1){
                            MODALS[modalType]['MAIN'].innerHTML = logText
                        }
                        else{
                            MODALS[modalType]['MAIN'].innerHTML = '-- Empty Log --';
                        }
                        break;
                    case 'ITEM':
                        MODALS[modalType]['HEADER'].innerHTML = ITEMS[itemId]['NAME']
                        MODALS[modalType]['MAIN'].innerHTML = ITEMS[itemId]['CONTENT'].replaceAll('\n', '<br>')
                        break
                }
            }
            MODAL_BG.style.display = 'block';
            MODALS[modalType]['ELEMENT'].style.display = 'flex';
            if(modalType == 'MENU'){
                if(menuType == 'LOG'){
                    MODALS[modalType]['MAIN'].scrollTop = MODALS[modalType]['MAIN'].scrollHeight
                }
                else{
                    MODALS[modalType]['MAIN'].scrollTop = 0
                }
            }
            let cleanIntervalLoop = setInterval(function(){
                MODALS[modalType]['ELEMENT'].style.opacity = parseFloat(MODALS[modalType]['COMPSTYLE'].getPropertyValue('opacity')) + 0.1; 
            }, 15)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop)
                ANIMATIONS['TOGGLE_MODAL']['STATE'] = 'NOT RUNNING'
                modalActive = modalType
            }, 150);
        }else{
            let cleanIntervalLoop = setInterval(function(){
                MODALS[modalType]['ELEMENT'].style.opacity = parseFloat(MODALS[modalType]['COMPSTYLE'].getPropertyValue('opacity')) - 0.1; 
            }, 15)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MODALS[modalType]['ELEMENT'].style.display = 'none';
                MODAL_BG.style.display = 'none';
                ANIMATIONS['TOGGLE_MODAL']['STATE'] = 'NOT RUNNING'
                modalActive = null
            }, 150);
        }
    }
}

function toggleElementBorder(element, borderSide){
    if(borderSide == "left"){
        if(element.style.borderLeft.includes('white')){
            element.style.borderLeft = 'solid black 1px'
        }
        else{
            element.style.borderLeft = 'solid white 1px'
        }
    }
    else if(borderSide == "right"){
        if(element.style.borderRight.includes('white')){
            element.style.borderRight = 'solid black 1px'
        }
        else{
            element.style.borderRight = 'solid white 1px'
        }
    }
}

// NAME TYPING FUNCTIONS
function changeCurrentLetter(keyPressed){
    let currentLetter;
    if(currentCursorPosition == 20){
        currentLetter = NAME_LETTERS_ELEMENTS[currentCursorPosition - 1]
    }
    else{
        currentLetter = NAME_LETTERS_ELEMENTS[currentCursorPosition]
    }
    if(((keyPressed >= "a" && keyPressed <= "z") || (keyPressed >= "A" && keyPressed <= "Z") || keyPressed == ' ') && keyPressed.length == 1){
        if(currentCursorPosition < 20){
            if(keyPressed == ' '){
                currentLetter.innerHTML = '&nbsp;'
            }else{
                currentLetter.innerHTML = keyPressed
            }
            changeTypingCursorPosition(currentCursorPosition + 1)        }
    }else{
        if(keyPressed == "ArrowLeft" || keyPressed == "ArrowRight" || keyPressed == "ArrowUp" || keyPressed == "ArrowDown" || 
           keyPressed == "Backspace" || keyPressed == "Delete" || keyPressed == "Enter"){

            switch(keyPressed){
                case "ArrowLeft":
                    if(currentCursorPosition > 0){
                        changeTypingCursorPosition(currentCursorPosition - 1)
                    }
                break;
                case "ArrowRight":
                    if(currentCursorPosition < 20){
                        changeTypingCursorPosition(currentCursorPosition + 1)
                    }
                break;
                case "ArrowDown":
                    if(currentCursorPosition < 10){
                        changeTypingCursorPosition(currentCursorPosition + 10)
                    }
                break;
                case "ArrowUp":
                    if(currentCursorPosition > 9){
                        if(currentCursorPosition == 20){
                            changeTypingCursorPosition(currentCursorPosition - 1)
                        }
                        changeTypingCursorPosition(currentCursorPosition - 10)
                    }
                break;
                case "Backspace":
                    if(currentCursorPosition > 0){
                        changeTypingCursorPosition(currentCursorPosition - 1)
                        NAME_LETTERS_ELEMENTS[currentCursorPosition].innerHTML = '&nbsp;'
                    }
                break;
                case "Delete":
                    if(currentCursorPosition < 10){
                        for(let currentDeletePosition = currentCursorPosition; currentDeletePosition < 9; currentDeletePosition++){
                            NAME_LETTERS_ELEMENTS[currentDeletePosition].innerHTML = NAME_LETTERS_ELEMENTS[currentDeletePosition + 1].innerHTML
                        }
                        NAME_LETTERS_ELEMENTS[9].innerHTML = '&nbsp;'
                    }else if(currentCursorPosition > 9 && currentCursorPosition < 20){
                        for(let currentDeletePosition = currentCursorPosition; currentDeletePosition < 19; currentDeletePosition++){
                            NAME_LETTERS_ELEMENTS[currentDeletePosition].innerHTML = NAME_LETTERS_ELEMENTS[currentDeletePosition + 1].innerHTML
                        }
                        NAME_LETTERS_ELEMENTS[19].innerHTML = '&nbsp;'
                    }
                break;
            }
        }
    }
}

function changeTypingCursorPosition(newPosition){
    clearInterval(ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'])
    if(currentCursorPosition == 20){
        NAME_LETTERS_ELEMENTS[currentCursorPosition - 1].style.borderRight = 'solid black 1px'
    }else{
        NAME_LETTERS_ELEMENTS[currentCursorPosition].style.borderLeft = 'solid black 1px'
    }
    currentCursorPosition = newPosition
    ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'] = setInterval(() => {
        if(currentCursorPosition < 20){
            toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition], "left")
        }else{
            toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition - 1], "right")
        }
    }, 400)
}

// VISIBILITY FUNCTIONS
elementIsVisible = elementCompStyle => elementCompStyle.getPropertyValue('display') != "none"

anyModalIsVisible = () => Object.keys(MODALS).reduce((prevVal, currVal, index) => {
    if(index == 1) return elementIsVisible(MODALS[prevVal]['COMPSTYLE'])
    return true ? prevVal == true : elementIsVisible(MODALS[currVal]['COMPSTYLE'])
})

anyOtherModalIsVisible = modalType => Object.keys(MODALS).reduce((prevVal, currVal, index) => {
    if(index == 1 && prevVal != modalType) return elementIsVisible(MODALS[prevVal]['COMPSTYLE'])
    if(currVal != modalType) return elementIsVisible(MODALS[currVal]['COMPSTYLE'])
    return false
})

// INFO GATHERING FUNCTIONS       
stillHasInfoToGather = () => currentInfoGatheringCheckpoint > -1 && Object.keys(infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['INFO_REMAINING']).length > 1

reachedInfoAnswerLastEvent = () => {

    if(currentInfoGatheringCheckpoint == -1) return false;

    let nextEvent = SCRIPT[eventIterator + 1],
        choiceRouteLayer = 1,
        nextEventChoiceRoute = ''

    while(nextEvent.hasOwnProperty(choiceRoute.slice(0, choiceRouteLayer).join('.'))){
        nextEvent = nextEvent[choiceRoute.slice(0, choiceRouteLayer).join('.')]
        nextEventChoiceRoute = choiceRoute.slice(0, choiceRouteLayer).join('.')  
        choiceRouteLayer++
    }
    choiceRouteLayer--
    return currentInfoGatheringCheckpoint > -1 && nextEventChoiceRoute != choiceRoute.join('.')
}

currentEventHasChoices = () => currentEvent.hasOwnProperty('CHOICES') || reachedInfoAnswerLastEvent()

// JS EVENTS
document.querySelector('main').addEventListener('click', () => {
    if(elementIsVisible(INVENTORY_MENU_COMP_STYLE)) INVENTORY_MENU.style.display = 'none'
    advanceText()
});

window.addEventListener('keyup', function(e){

    switch(e.key){

        case 'Enter':
        case ' ':
            if((currentEventType != "NAME") || (currentEventType == "NAME" && awaitingInput == false)){
                if (!anyModalIsVisible()) advanceText()
            }else{
                if(awaitingInput == true){
                    if(e.key == "Enter"){
                        if(currentCursorPosition > 9){
                            if (!anyModalIsVisible()){
                                playerName = Array.from(document.querySelectorAll('.nameLetter'))
                                    .reduce((prevVal, currVal, index) => {
                                        if(index == 1) prevVal = prevVal.innerHTML
                                        if(index == 10) prevVal += '&'
                                        return prevVal + currVal.innerHTML.replace('&nbsp;', ' ').trim()
                                    })
                                    .split('&')
                                    .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
                                
                                if(playerName[0].length > 0 && playerName[1].length > 0){
                                    MODALS['CONFIRM']['HEADER'].innerHTML = '"' + playerName[0] + ' ' + playerName[1] + '", is that your true name?'
                                    toggleModal('CONFIRM')
                                }
                            }
                        } else if(currentCursorPosition < 10){
                            let cursorPositionVerifier = 19
                            do{
                                cursorPositionVerifier--;
                            }while(NAME_LETTERS_ELEMENTS[cursorPositionVerifier].innerHTML == '&nbsp;' && cursorPositionVerifier >= 10)
                            changeTypingCursorPosition(cursorPositionVerifier + 1);
                        }
                    }                    
                }
            }
        break;

        case 'l':
        case 'L':
            if(currentEventType != "NAME" || (currentEventType == "NAME" && awaitingInput == false)){
                toggleModal('MENU', 'LOG')
            }
        break;

        case 'o':
        case 'O':
            if(currentEventType != "NAME" || (currentEventType == "NAME" && awaitingInput == false)){
                toggleModal('MENU', 'OPTIONS')
            }
        break;

        case 'Escape':
            if(elementIsVisible(MENU_MODAL_COMP_STYLE)) toggleModal('MENU')
        break;
    }

});

window.addEventListener('keydown', function(e){

    switch(e.key){

        case 's':
        case 'S':
            if(currentEventType != "NAME" || (currentEventType == "NAME" && awaitingInput == false)){
                if (!anyModalIsVisible()) advanceText()
            }else{
                if(awaitingInput == true){
                    if (!anyModalIsVisible()) changeCurrentLetter(e.key)
                }
            }
        break;

        default:
            if(currentEventType == "NAME"){
                if(awaitingInput == true){
                    if(e.key != "Enter" && !anyModalIsVisible()){
                        changeCurrentLetter(e.key)
                    }
                }
            }
        break;

    }

});

LOG_BUTTON.addEventListener("click", () => toggleModal('MENU', 'LOG'))
OPTIONS_BUTTON.addEventListener("click", () => toggleModal('MENU', 'OPTIONS'))

INVENTORY_BUTTON.addEventListener("click", () => INVENTORY_MENU.style.display = elementIsVisible(INVENTORY_MENU_COMP_STYLE) ? 'none' : 'block')

MODAL_BG.addEventListener("click", () => toggleModal(modalActive))

MODALS['CONFIRM']['BUTTONS']['YES'].addEventListener("click", () => {
    switch(currentEventType){
        case "NAME":
            clearInterval(ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'])
            ANIMATIONS['NAME_TYPING_CURSOR']['STATE'] = 'NOT RUNNING'
            INPUT_SECTION.style.display = "none"
            INPUT_SECTION.style.opacity = 0.1
            Array.from(document.querySelectorAll('.nameSectionColumn')).forEach(section => section.remove())
            toggleModal('CONFIRM')
            awaitingInput = false
            advanceText()
        break;
    }
})

MODALS['CONFIRM']['BUTTONS']['NO'].addEventListener("click", () => {
    switch(currentEventType){
        case "NAME":
            toggleModal('CONFIRM')
        break;
    }
})

CHOICE_BUTTONS.forEach((buttonClicked, indexClickedButton) => {
    buttonClicked['ELEMENT'].addEventListener('click', () =>{
        awaitingInput = false;
        previousChoice = currentChoice;
        currentChoice = buttonClicked['ELEMENT'].getAttribute('id').slice(-1);

        // Deletes choice from the info remaining of the current info gathering event loop and goes back to the info gathering event in case it reaches the end of the answer from a certain info
        if(currentInfoGatheringCheckpoint > -1 && (currentEventType == "INFO_GATHERING" || reachedInfoAnswerLastEvent())){
            if(reachedInfoAnswerLastEvent()){
                choiceRoute.pop()
                if(stillHasInfoToGather()){
                    eventIterator = infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['EVENT_ID']
                    currentEvent = SCRIPT[eventIterator]
                }
            }

            if(stillHasInfoToGather()) choiceRoute.push(buttonClicked['ELEMENT'].getAttribute('choiceval'))
            // Goes to the end of the info gathering evet in case there's no other choice
            else{
                choiceRoute = infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['CHOICE_ROUTE']
                while(!SCRIPT[eventIterator + 1][infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['CHOICE_ROUTE'].join('.')].hasOwnProperty('TEXT')){
                    eventIterator++;
                }
            } 

            delete infoGatheringCheckpoints[currentInfoGatheringCheckpoint]['INFO_REMAINING'][buttonClicked['ELEMENT'].getAttribute('choiceval')]
        }
        else{
            // Adds choice to the choice route
            choiceRoute.push(currentChoice)
        }
        
        // Clears input section excluding the actual choice
        CHOICE_BUTTONS.forEach((button, index) => {
            if(index != indexClickedButton){
                button['ELEMENT'].style.display = 'none'
            }
        })
        advanceText()
    })
})

document.body.addEventListener("click", function(e){
    if(e.target.classList.contains('itemButton')){
        let itemId = e.target.getAttribute('itemId')
        if(ITEMS[itemId]['USAGE_TYPE'] == 'READABLE'){
            toggleModal('MENU', 'ITEM', itemId)
        }
    }
})

startNextEvent()