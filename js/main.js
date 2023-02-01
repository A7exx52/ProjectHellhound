const MAIN_TEXTSECTION = document.querySelector('#textSection'),
      MAIN_TEXTSECTION_COMP_STYLE = window.getComputedStyle(MAIN_TEXTSECTION),

      MENU_MODAL_BG = document.querySelector('#menuModalBg'),
      MENU_MODAL = document.querySelector('#menuModal'),
      MENU_MODAL_COMP_STYLE = window.getComputedStyle(MENU_MODAL),
      MENU_MODAL_HEADER = MENU_MODAL.querySelector('#modalHeader'),
      MENU_MODAL_MAIN = MENU_MODAL.querySelector("#modalMain"),

      LOG_BUTTON = document.querySelector('#logButton'),
      OPTIONS_BUTTON = document.querySelector('#optionsButton'),

      TEXT_SPEEDS = {
          'NORMAL': 0.055,
          'NAME': 0.055,
          'SURPRISE': 0.0025,
          'SUSPENSE': 0.1,
          'SUPER SUSPENSE': 0.2
      };

let awaitingInput = false,
    eventIterator = -1,
    logText = '',
    currentEvent = 'NORMAL',
    currentTextBlock = '',
    currentGameState = 'READING_TEXT';

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

function skipText(){
    if(!awaitingInput){
        if(ANIMATIONS['DISPLAY_TEXT']['STATE'] == 'RUNNING'){
            clearInterval(ANIMATIONS['DISPLAY_TEXT']['LOOP'])
            MAIN_TEXTSECTION.innerHTML = currentTextBlock.join('<br>')
            logText += "<span>" + currentTextBlock.join('<br>') + '</span>'
            ANIMATIONS['DISPLAY_TEXT']['STATE'] = 'NOT RUNNING';
        }
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
            MENU_MODAL_BG.style.display = 'block';
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
                MENU_MODAL_BG.style.display = 'none';
                ANIMATIONS['TOGGLE_MENU_MODAL']['STATE'] = 'NOT RUNNING'
            }, 150);
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
        }
    }, TEXT_SPEEDS[currentEvent] * 1000)
}

menuIsVisible = () => MENU_MODAL_COMP_STYLE.getPropertyValue('display') != "none"

MAIN_TEXTSECTION.addEventListener('click', () => skipText());

window.addEventListener('keyup', function(e){

    switch(e.key){

        case 'Enter':
        case ' ':
            if (!menuIsVisible()) skipText()
        break;

        case 'l':
        case 'L':
            toggleMenuModal('LOG')
        break;

        case 'o':
        case 'O':
            toggleMenuModal('OPTIONS')
        break;

        case 'Escape':
            if(menuIsVisible()) toggleMenuModal()
        break;

    }

});

window.addEventListener('keydown', function(e){

    switch(e.key){

        case 's':
        case 'S':
            if (!menuIsVisible()) skipText()
        break;

    }

});

LOG_BUTTON.addEventListener("click", () => toggleMenuModal('LOG'))

OPTIONS_BUTTON.addEventListener("click", () => toggleMenuModal('LOG'))

MENU_MODAL_BG.addEventListener("click", () => toggleMenuModal())

startNextEvent()