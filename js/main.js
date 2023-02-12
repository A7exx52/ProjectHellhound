const MAIN_TEXT_SECTION = document.querySelector('#textSection'),
    MAIN_TEXT_SECTION_COMP_STYLE = window.getComputedStyle(MAIN_TEXT_SECTION),

    INPUT_SECTION = document.querySelector('#inputSection'),
    INPUT_SECTION_COMP_STYLE = window.getComputedStyle(INPUT_SECTION),
    NAME_LETTERS_ELEMENTS = [],
    CHOICE_BUTTONS = [],

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

    TEXT_SPEEDS = {
        'NORMAL': 0.055,
        'NAME': 0.055,
        'CHOICE': 0.055,
        'AFTER_CHOICE': 0.055,
        'SURPRISE': 0.0025,
        'SUSPENSE': 0.1,
        'SUPER SUSPENSE': 0.2
    };

for(let currentLetter = 0; currentLetter < 20; currentLetter++) NAME_LETTERS_ELEMENTS.push(document.querySelector('#nameLetter' + currentLetter))
for(let currentButton = 1; currentButton < 5; currentButton++){
    CHOICE_BUTTONS.push({
        'ELEMENT': document.querySelector('#choiceButton' + currentButton),
        'COMPSTYLE': window.getComputedStyle(document.querySelector('#choiceButton' + currentButton))
    })
}

let awaitingInput = false,
    logText = '',
    eventIterator = -1,
    currentEvent = 'NORMAL',
    currentTextBlock = '',
    currentCursorPosition = 0,
    playerName = [null, null],
    modalActive = null,
    currentChoice = null;

function startNextEvent(){
    eventIterator += 1
    if(eventIterator == SCRIPT.length){
        eventIterator = 0
    }
    currentEvent = SCRIPT[eventIterator]['EVENT']
    if(eventIterator > 0){
        if(SCRIPT[eventIterator - 1]['EVENT'] == 'CHOICE'){
            currentTextBlock = SCRIPT[eventIterator]['TEXT'][currentChoice]
        }
        else currentTextBlock = SCRIPT[eventIterator]['TEXT']
    }
    else currentTextBlock = SCRIPT[eventIterator]['TEXT']

    displayNextText();

}

function endCurrentEvent(){

    if(currentEvent == 'NAME' || currentEvent == 'CHOICE'){
        awaitingInput = true
        if(currentEvent == 'CHOICE'){
            SCRIPT[eventIterator]['CHOICES'].forEach((choice, index) => {
                CHOICE_BUTTONS[index]['ELEMENT'].innerHTML = choice
                CHOICE_BUTTONS[index]['ELEMENT'].style.display = 'flex'
            })
            INPUT_SECTION.style.flexDirection = 'column'
            INPUT_SECTION.style.justifyContent = 'flex-start'
            INPUT_SECTION.style.alignItems = 'flex-start'
        }
        INPUT_SECTION.style.display = 'flex'
        ANIMATIONS['DISPLAY_INPUT_SECTION']['STATE'] = 'RUNNING'
        ANIMATIONS['DISPLAY_INPUT_SECTION']['LOOP'] = setInterval(() =>
            INPUT_SECTION.style.opacity = parseFloat(INPUT_SECTION_COMP_STYLE.getPropertyValue('opacity')) + 0.1
        , 20)
        ANIMATIONS['DISPLAY_INPUT_SECTION']['CALLBACK'] = setTimeout(() => {
            clearInterval(ANIMATIONS['DISPLAY_INPUT_SECTION']['LOOP']);
            INPUT_SECTION.style.opacity = 1;
            ANIMATIONS['DISPLAY_INPUT_SECTION']['STATE'] = 'NOT RUNNING';
            switch(currentEvent){
                case 'NAME':
                    ANIMATIONS['NAME_TYPING_CURSOR']['STATE'] = 'RUNNING'
                    ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'] = setInterval(() => {
                        if(currentCursorPosition < 20){
                            toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition], "left")
                        }else{
                            toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition - 1], "right")
                        }
                    }, 400)
                break;
            }
        }, 200)
    }
}

// Every time the player holds "S" or press "Space/Enter"
function skipText(){
    if(!awaitingInput){

        // Checks if letters are being draw
        if(ANIMATIONS['DISPLAY_TEXT']['STATE'] == 'RUNNING'){
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            MAIN_TEXT_SECTION.innerHTML = currentTextBlock.join('<br>')
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING';
            endCurrentEvent()
        }

        // Checks if text is already full shown
        else if(ANIMATIONS['CLEAR_TEXT']['STATE'] == 'NOT RUNNING'){
            ANIMATIONS['CLEAR_TEXT']['STATE'] = 'RUNNING'
            ANIMATIONS['CLEAR_TEXT']['LOOP'] = setInterval(() => {
                if(currentEvent == 'CHOICE') INPUT_SECTION.style.opacity = parseFloat(INPUT_SECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1;    
                MAIN_TEXT_SECTION.style.opacity = parseFloat(MAIN_TEXT_SECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1;
            }, 50)
            ANIMATIONS['CLEAR_TEXT']['CALLBACK'] = setTimeout(() => {
                clearInterval(ANIMATIONS['CLEAR_TEXT']['LOOP']);
                if(currentEvent == 'CHOICE'){ 
                    INPUT_SECTION.style.opacity = 0.1;
                    INPUT_SECTION.style.display = 'none';
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
            startNextEvent();
        }
    }
}

function toggleModal(modalType, menuType = null){
    if(ANIMATIONS['TOGGLE_MODAL']['STATE'] == 'NOT RUNNING' && !anyOtherModalIsVisible(modalType)){
        ANIMATIONS['TOGGLE_MODAL']['STATE'] = 'RUNNING'
        if(MODALS[modalType]['COMPSTYLE'].getPropertyValue('display') == 'none'){
            if(modalType == 'MENU'){
                MODALS[modalType]['HEADER'].innerHTML = menuType.charAt(0) + menuType.slice(1).toLowerCase();
                MODALS[modalType]['MAIN'].innerHTML = '';
                if(menuType == "LOG"){
                    if (logText.length >= 1){
                        MODALS[modalType]['MAIN'].innerHTML = logText
                        MODALS[modalType]['MAIN'].style.overflowY = "scroll";
                    }
                    else{
                        MODALS[modalType]['MAIN'].innerHTML = '';
                    }
                }
            }
            MODAL_BG.style.display = 'block';
            MODALS[modalType]['ELEMENT'].style.display = 'flex';
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

function displayNextText(){
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
            endCurrentEvent()
        }
    }, TEXT_SPEEDS[currentEvent] * 1000)
}

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

MAIN_TEXT_SECTION.addEventListener('click', () => skipText());

window.addEventListener('keyup', function(e){

    switch(e.key){

        case 'Enter':
        case ' ':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                if (!anyModalIsVisible()) skipText()
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
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                toggleModal('MENU', 'LOG')
            }
        break;

        case 'o':
        case 'O':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
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
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                if (!anyModalIsVisible()) skipText()
            }else{
                if(awaitingInput == true){
                    if (!anyModalIsVisible()) changeCurrentLetter(e.key)
                }
            }
        break;

        default:
            if(currentEvent == "NAME"){
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

MODAL_BG.addEventListener("click", () => toggleModal(modalActive))

MODALS['CONFIRM']['BUTTONS']['YES'].addEventListener("click", () => {
    switch(currentEvent){
        case "NAME":
            SCRIPT = SCRIPT.map((event, index) => {

                event['TEXT'] = event['TEXT'].map(text => {
                    if(index > 0){
                        if(SCRIPT[index - 1]['EVENT'] == 'CHOICE'){
                            text = text.map(choiceText => {
                                if(choiceText.includes('playerName0')) choiceText = choiceText.replace('playerName0', playerName[0])
                                if(choiceText.includes('playerName1')) choiceText = choiceText.replace('playerName1', playerName[1]) 
                                return choiceText       
                            })
                        }else{
                            if(text.includes('playerName0')) text = text.replace('playerName0', playerName[0])
                            if(text.includes('playerName1')) text = text.replace('playerName1', playerName[1])
                        }
                    }
                    else{
                        if(text.includes('playerName0')) text = text.replace('playerName0', playerName[0])
                        if(text.includes('playerName1')) text = text.replace('playerName1', playerName[1])
                    }
                    return text
                })
                return event
            })
            clearInterval(ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'])
            ANIMATIONS['NAME_TYPING_CURSOR']['STATE'] = 'NOT RUNNING'
            INPUT_SECTION.style.display = "none"
            INPUT_SECTION.style.opacity = 0.1
            Array.from(document.querySelectorAll('.nameSectionColumn')).forEach(section => section.remove())
            toggleModal('CONFIRM')
            awaitingInput = false
            skipText()
        break;
    }
})

MODALS['CONFIRM']['BUTTONS']['NO'].addEventListener("click", () => {
    switch(currentEvent){
        case "NAME":
            toggleModal('CONFIRM')
        break;
    }
})

CHOICE_BUTTONS.forEach((buttonClicked, indexClickedButton) => {
    buttonClicked['ELEMENT'].addEventListener('click', () =>{
        awaitingInput = false;
        currentChoice = indexClickedButton
        CHOICE_BUTTONS.forEach((button, index) => {
            if(index != indexClickedButton){
                button['ELEMENT'].style.display = 'none'
            }
        })
        skipText()
    })
})

startNextEvent()