const MAIN_TEXTSECTION = document.querySelector('#textSection'),
    MAIN_TEXTSECTION_COMP_STYLE = window.getComputedStyle(MAIN_TEXTSECTION),

    NAME_SECTION = document.querySelector('#nameSection'),
    NAME_SECTION_COMP_STYLE = window.getComputedStyle(NAME_SECTION),
    NAME_LETTERS_ELEMENTS = []

    MODAL_BG = document.querySelector('#modalBg'),

    MENU_MODAL = document.querySelector('#menuModal'),
    MENU_MODAL_COMP_STYLE = window.getComputedStyle(MENU_MODAL),
    MENU_MODAL_HEADER = MENU_MODAL.querySelector('#menuModalHeader'),
    MENU_MODAL_MAIN = MENU_MODAL.querySelector("#menuModalMain"),

    CONFIRM_MODAL = document.querySelector('#confirmModal'),
    CONFIRM_MODAL_COMP_STYLE = window.getComputedStyle(CONFIRM_MODAL),
    CONFIRM_MODAL_HEADER = MENU_MODAL.querySelector('#confirmModalHeader'),
    CONFIRM_MODAL_MAIN = MENU_MODAL.querySelector("#confirmModalMain"),

    LOG_BUTTON = document.querySelector('#logButton'),
    OPTIONS_BUTTON = document.querySelector('#optionsButton'),

    TEXT_SPEEDS = {
        'NORMAL': 0.055,
        'NAME': 0.055,
        'SURPRISE': 0.0025,
        'SUSPENSE': 0.1,
        'SUPER SUSPENSE': 0.2
    };

for(let currentLetter = 0; currentLetter < 20; currentLetter++){
    NAME_LETTERS_ELEMENTS.push(document.querySelector('#nameLetter' + currentLetter))
}

let awaitingInput = false,
    logText = '',
    eventIterator = -1,
    currentEvent = 'NORMAL',
    currentTextBlock = '',
    currentCursorPosition = 0;

function startNextEvent(){
    eventIterator += 1
    if(eventIterator == SCRIPT.length){
        eventIterator = 0
    }
    currentEvent = SCRIPT[eventIterator]['EVENT']
    currentTextBlock = SCRIPT[eventIterator]['TEXT']

    switch(currentEvent){

        case 'NORMAL': 
            displayNextText(); 
        break;

        case 'NAME':
            displayNextText();
        break

    }

}

function endCurrentEvent(){
    switch(currentEvent){

        case 'NAME':
            awaitingInput = true
            NAME_SECTION.style.display = 'flex'
            ANIMATIONS['DISPLAY_NAME_SECTION']['STATE'] = 'RUNNING'
            ANIMATIONS['DISPLAY_NAME_SECTION']['LOOP'] = setInterval(() =>
                NAME_SECTION.style.opacity = parseFloat(NAME_SECTION_COMP_STYLE.getPropertyValue('opacity')) + 0.1
            , 20)
            ANIMATIONS['DISPLAY_NAME_SECTION']['CALLBACK'] = setTimeout(() => {
                clearInterval(ANIMATIONS['DISPLAY_NAME_SECTION']['LOOP']);
                NAME_SECTION.style.opacity = 1;
                ANIMATIONS['DISPLAY_NAME_SECTION']['STATE'] = 'NOT RUNNING';
                ANIMATIONS['NAME_TYPING_CURSOR']['STATE'] = 'RUNNING'
                ANIMATIONS['NAME_TYPING_CURSOR']['LOOP'] = setInterval(() => {
                    if(currentCursorPosition < 20){
                        toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition], "left")
                    }else{
                        toggleElementBorder(NAME_LETTERS_ELEMENTS[currentCursorPosition - 1], "right")
                    }
                }, 400)
            }, 200)
        break;

    }
}

// Every time the player holds "S" or press "Space/Enter"
function skipText(){
    if(!awaitingInput){

        // Checks if letters are being draw
        if(ANIMATIONS['DISPLAY_TEXT']['STATE'] == 'RUNNING'){
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            MAIN_TEXTSECTION.innerHTML = currentTextBlock.join('<br>')
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING';
            endCurrentEvent()
        }
        // Checks if text is already full shown
        else if(ANIMATIONS['CLEAR_TEXT']['STATE'] == 'NOT RUNNING'){
            ANIMATIONS['CLEAR_TEXT']['STATE'] = 'RUNNING'
            ANIMATIONS['CLEAR_TEXT']['LOOP'] = setInterval(() => 
                MAIN_TEXTSECTION.style.opacity = parseFloat(MAIN_TEXTSECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1
            , 50)
            ANIMATIONS['CLEAR_TEXT']['CALLBACK'] = setTimeout(() => {
                clearInterval(ANIMATIONS['CLEAR_TEXT']['LOOP']);
                MAIN_TEXTSECTION.innerHTML= '';
                MAIN_TEXTSECTION.style.opacity = 1;
                ANIMATIONS['CLEAR_TEXT']['STATE'] = 'NOT RUNNING';
                startNextEvent();
            }, 500)
        } 
        // Checks if text is fading out
        else if(ANIMATIONS['CLEAR_TEXT']['STATE'] == 'RUNNING'){
            clearInterval(ANIMATIONS['CLEAR_TEXT']['LOOP'])
            clearTimeout(ANIMATIONS['CLEAR_TEXT']['CALLBACK'])
            ANIMATIONS['CLEAR_TEXT']['STATE'] = 'NOT RUNNING';
            MAIN_TEXTSECTION.innerHTML= '';
            MAIN_TEXTSECTION.style.opacity = 1;
            startNextEvent();
        }
    }
}

function toggleMenuModal(menuType = null){
    if(ANIMATIONS['TOGGLE_MENU_MODAL']['STATE'] == 'NOT RUNNING'){
        ANIMATIONS['TOGGLE_MENU_MODAL']['STATE'] = 'RUNNING'
        if(MENU_MODAL_COMP_STYLE.getPropertyValue('display') == 'none'){
            switch(menuType){
                case "LOG":
                    MENU_MODAL_HEADER.innerHTML = 'Log';
                    MENU_MODAL_MAIN.innerHTML = '';
                    if (logText.length >= 1){
                        MENU_MODAL_MAIN.innerHTML = logText
                        MENU_MODAL_MAIN.style.overflowY = "scroll";
                    }
                    else{
                        MENU_MODAL_MAIN.innerHTML = '';
                    }
                break;
                case "OPTIONS":
                    MENU_MODAL_HEADER.innerHTML = 'Options';
                    MENU_MODAL_MAIN.innerHTML = '';
                break;
            }
            MODAL_BG.style.display = 'block';
            MENU_MODAL.style.display = 'flex';
            let cleanIntervalLoop = setInterval(function(){
                MENU_MODAL.style.opacity = parseFloat(MENU_MODAL_COMP_STYLE.getPropertyValue('opacity')) + 0.1; 
            }, 15)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop)
                ANIMATIONS['TOGGLE_MENU_MODAL']['STATE'] = 'NOT RUNNING'
            }, 150);
        }else{
            let cleanIntervalLoop = setInterval(function(){
                MENU_MODAL.style.opacity = parseFloat(MENU_MODAL_COMP_STYLE.getPropertyValue('opacity')) - 0.1; 
            }, 15)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MENU_MODAL.style.display = 'none';
                MODAL_BG.style.display = 'none';
                ANIMATIONS['TOGGLE_MENU_MODAL']['STATE'] = 'NOT RUNNING'
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
                MAIN_TEXTSECTION.innerHTML += currentTextBlock[textLineIterator][textCharIterator]
                textCharIterator++;
            }
            else{
                textLineIterator++;
                textCharIterator = 0;
                MAIN_TEXTSECTION.innerHTML += "<br>"
            }
        }else{
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING'
            endCurrentEvent()
        }
    }, TEXT_SPEEDS[currentEvent] * 1000)
}

function confirmPlayerName(){
    
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
            if(currentLetter.style.borderLeft.includes('white')){
                currentLetter.style.borderLeft = 'solid black 1px'
            }
            currentCursorPosition += 1
        }
    }else{
        if(keyPressed == "ArrowLeft" || keyPressed == "ArrowRight" || keyPressed == "ArrowUp" || keyPressed == "ArrowDown" || 
           keyPressed == "Backspace" || keyPressed == "Delete" || keyPressed == "Enter"){
            if(currentCursorPosition == 20){
                if(currentLetter.style.borderRight.includes('white')){
                    currentLetter.style.borderRight = 'solid black 1px'
                }
            }else{
                if(currentLetter.style.borderLeft.includes('white')){
                    currentLetter.style.borderLeft = 'solid black 1px'
                }
            }
            switch(keyPressed){
                case "ArrowLeft":
                    if(currentCursorPosition > 0){
                        currentCursorPosition -= 1
                    }
                break;
                case "ArrowRight":
                    if(currentCursorPosition < 20){
                        currentCursorPosition += 1
                    }
                break;
                case "ArrowDown":
                    if(currentCursorPosition < 10){
                        currentCursorPosition += 10
                    }
                break;
                case "ArrowUp":
                    if(currentCursorPosition > 9){
                        if(currentCursorPosition == 20){
                            currentCursorPosition -= 1
                        }
                        currentCursorPosition -= 10
                    }
                break;
                case "Backspace":
                    if(currentCursorPosition > 0){
                        currentCursorPosition -= 1
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
                case "Enter":
                    if(currentCursorPosition < 10){
                        currentCursorPosition = 10
                    }
                break;
            }
        }
    }
}

elementIsVisible = elementCompStyle => elementCompStyle.getPropertyValue('display') != "none"

MAIN_TEXTSECTION.addEventListener('click', () => skipText());

window.addEventListener('keyup', function(e){

    switch(e.key){

        case 'Enter':
        case ' ':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                if (!elementIsVisible(MENU_MODAL_COMP_STYLE)) skipText()
            }else{
                if(awaitingInput == true){
                    if(e.key == "Enter"){
                        if(currentCursorPosition > 9){
                            if (!elementIsVisible(MENU_MODAL_COMP_STYLE)) confirmPlayerName()
                        }
                    }                    
                }
            }
        break;

        case 'l':
        case 'L':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                toggleMenuModal('LOG')
            }
        break;

        case 'o':
        case 'O':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                toggleMenuModal('OPTIONS')
            }
        break;

        case 'Escape':
            if(elementIsVisible(MENU_MODAL_COMP_STYLE)) toggleMenuModal()
        break;
    }

});

window.addEventListener('keydown', function(e){

    switch(e.key){

        case 's':
        case 'S':
            if(currentEvent != "NAME" || (currentEvent == "NAME" && awaitingInput == false)){
                if (!elementIsVisible(MENU_MODAL_COMP_STYLE)) skipText()
            }else{
                if(awaitingInput == true){
                    if (!elementIsVisible(MENU_MODAL_COMP_STYLE)) changeCurrentLetter(e.key)
                }
            }
        break;

        default:
            if(currentEvent == "NAME"){
                if(awaitingInput == true){
                    if (!elementIsVisible(MENU_MODAL_COMP_STYLE)) changeCurrentLetter(e.key)
                }
            }
        break;

    }

});

LOG_BUTTON.addEventListener("click", () => toggleMenuModal('LOG'))

OPTIONS_BUTTON.addEventListener("click", () => toggleMenuModal('OPTIONS'))

MODAL_BG.addEventListener("click", () => toggleMenuModal())

startNextEvent()