const MAIN_TEXTSECTION = document.querySelector('#textSection'),
      MAIN_TEXTSECTION_COMP_STYLE = window.getComputedStyle(MAIN_TEXTSECTION),

      MENU_MODAL_BG = document.querySelector('#menuModalBg'),
      MENU_MODAL = document.querySelector('#menuModal'),
      MENU_MODAL_COMP_STYLE = window.getComputedStyle(MENU_MODAL),
      MENU_MODAL_HEADER = MENU_MODAL.querySelector('#modalHeader'),
      MENU_MODAL_MAIN = MENU_MODAL.querySelector("#modalMain"),
      MENU_MODAL_FOOTER = MENU_MODAL.querySelector("#modalFooter")

      LOG_BUTTON = document.querySelector('#logButton'),
      OPTIONS_BUTTON = document.querySelector('#optionsButton'),

      SCRIPT = [
            ["Well, hello, mister detective."], 
            ["How have you been?"], 
            ["You've had quite the ordeal lately haven't you?", "It makes for quite an excellent story."], 
            ["Shall we reminisce about it together?"], 
            ["The tale of that time where the supernatural workings of the underworld came in contact with the life of the ace detective, whose name was..."],
            ["...Michael Crowley, was it? A nice name like that."], 
            ["Well, then, detective, you remember very well how it started, don't you? It was a night of stormy weather, when that case reached your hands..."],
            ['"Where in the name of everything holy does that much rain come from?!"', 'You were sitting on your table, mindlessly checking the notes of the last case you solved, when you heard your boss, the tall, slightly overweight, gray-haired commissioner Edmund "Mundie" Dunkirk, complain for the Nth time in just the last forty minutes.']
      ],
      LOG = [],

      TEXT_SPEEDS = {
          'NORMAL': 0.055,
          'SURPRISE': 0.0025,
          'SUSPENSE': 0.1,
          'SUPER SUSPENSE': 0.2
      },
      ANIMATIONS_STATES = {
        'CHANGE_TEXT': 'NOT RUNNING',
        'TOGGLE_MENU_MODAL': 'NOT RUNNING'
      };

let awaitingInput = false,
    textBlockIterator = 0,
    textAnimationLoop;

function displayNextTextBlock(textSpeed){
    let textCharIterator = 0,
        textLineIterator = 0;
    textAnimationLoop = setInterval(() => {
        if(textLineIterator < SCRIPT[textBlockIterator].length){
            if(textCharIterator < SCRIPT[textBlockIterator][textLineIterator].length){
                MAIN_TEXTSECTION.innerHTML += SCRIPT[textBlockIterator][textLineIterator][textCharIterator]
                textCharIterator++;
            }
            else{
                textLineIterator++;
                textCharIterator = 0;
                MAIN_TEXTSECTION.innerHTML += "<br>"
            }
        }else{
            clearInterval(textAnimationLoop)
            awaitingInput = true;
            LOG.push(SCRIPT[textBlockIterator])
            textBlockIterator += 1;
            if(textBlockIterator == SCRIPT.length){
                textBlockIterator = 0;
            }
        }
    }, textSpeed * 1000)
}

function changeMainTextState(){
    if(ANIMATIONS_STATES['CHANGE_TEXT'] == 'NOT RUNNING'){
        ANIMATIONS_STATES['CHANGE_TEXT'] = 'RUNNING';
        if (awaitingInput){
            let cleanIntervalLoop = setInterval(function(){
                MAIN_TEXTSECTION.style.opacity = parseFloat(MAIN_TEXTSECTION_COMP_STYLE.getPropertyValue('opacity')) - 0.1; 
            }, 50)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MAIN_TEXTSECTION.innerHTML= '';
                MAIN_TEXTSECTION.style.opacity = 1;
                displayNextTextBlock(TEXT_SPEEDS['NORMAL']);
                awaitingInput = false;
                ANIMATIONS_STATES['CHANGE_TEXT'] = 'NOT RUNNING';      
            }, 500)
        }else{
            clearInterval(textAnimationLoop)
            MAIN_TEXTSECTION.innerHTML = SCRIPT[textBlockIterator][0]
            for (let currentLine = 1; currentLine < SCRIPT[textBlockIterator].length; currentLine++){
                MAIN_TEXTSECTION.innerHTML += '<br>' + SCRIPT[textBlockIterator][currentLine] 
            }
            LOG.push(SCRIPT[textBlockIterator])
            textBlockIterator += 1
            if(textBlockIterator == SCRIPT.length){
                textBlockIterator = 0
            }
            awaitingInput = true
            ANIMATIONS_STATES['CHANGE_TEXT'] = 'NOT RUNNING';
        }
    }
}

function toggleMenuModal(menuType = null){
    if(ANIMATIONS_STATES['TOGGLE_MENU_MODAL'] == 'NOT RUNNING'){
        ANIMATIONS_STATES['TOGGLE_MENU_MODAL'] = 'RUNNING'
        if(MENU_MODAL_COMP_STYLE.getPropertyValue('display') == 'none'){
            switch(menuType){
                case "LOG":
                    MENU_MODAL_HEADER.innerHTML = 'Log';
                    MENU_MODAL_MAIN.innerHTML = '';
                    MENU_MODAL_FOOTER.innerHTML = '';
                    if (LOG.length >= 1){
                        for (let currentBlock = 0; currentBlock < LOG.length; currentBlock++){
                            MENU_MODAL_MAIN.innerHTML += '<span>'
                            for (let currentLine = 0; currentLine < LOG[currentBlock].length; currentLine++){
                                MENU_MODAL_MAIN.innerHTML += LOG[currentBlock][currentLine] + "<br>"
                            }
                            MENU_MODAL_MAIN.innerHTML += "</span>"
                        }
                        MENU_MODAL_MAIN.style.overflowY = "scroll";
                        MENU_MODAL_MAIN.scrollTop = MENU_MODAL_MAIN.scrollHeight - 1
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
                ANIMATIONS_STATES['TOGGLE_MENU_MODAL'] = 'NOT RUNNING'
            }, 150);
        }else{
            let cleanIntervalLoop = setInterval(function(){
                MENU_MODAL.style.opacity = parseFloat(MENU_MODAL_COMP_STYLE.getPropertyValue('opacity')) - 0.1; 
            }, 15)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MENU_MODAL.style.display = 'none';
                MENU_MODAL_BG.style.display = 'none';
                ANIMATIONS_STATES['TOGGLE_MENU_MODAL'] = 'NOT RUNNING'
            }, 150);
        }
    }
}

menuIsVisible = () => MENU_MODAL_COMP_STYLE.getPropertyValue('display') != "none"

MAIN_TEXTSECTION.addEventListener('click', () => changeMainTextState());

window.addEventListener('keyup', function(e){

    switch(e.key){

        case 'Enter':
        case ' ':
            if (!menuIsVisible()) changeMainTextState()
        break;

        case 'l':
            toggleMenuModal('LOG')
        break;

        case 'o':
            toggleMenuModal('OPTIONS')
        break;

    }

});

LOG_BUTTON.addEventListener("click", () => toggleMenuModal('LOG'))

OPTIONS_BUTTON.addEventListener("click", () => toggleMenuModal('LOG'))

MENU_MODAL_BG.addEventListener("click", () => toggleMenuModal())

displayNextTextBlock(TEXT_SPEEDS['NORMAL'])