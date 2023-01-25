const MAIN_TEXTBOX = document.querySelector('main'),
      MAIN_TEXTBOX_COMP_STYLE = window.getComputedStyle(MAIN_TEXTBOX),
      MENU_MODAL = document.querySelector('#menuModal'),
      MENU_MODAL_BG = document.querySelector('#menuModalBg'),
      LOG_BUTTON = document.querySelector('#logButton'),
      OPTIONS_BUTTON = document.querySelector('#optionsButton')
      SCRIPT_ARRAY = [
            ["Well, hello, mister detective."], 
            ["How have you been?"], 
            ["You've had quite the ordeal lately haven't you?", "It makes for quite an excellent story."], 
            ["Shall we reminisce about it together?"], 
            ["The tale of that time where the supernatural workings of the underworld came in contact with the life of the ace detective, whose name was..."],
            ["...Michael Crowley, was it? A nice name like that."], 
            ["Well, then, detective, you remember very well how it started, don't you? It was a night of stormy weather, when that case reached your hands..."],
            ['"Where in the name of everything holy does that much rain come from?!"', 'You were sitting on your table, mindlessly checking the notes of the last case you solved, when you heard your boss, the tall, slightly overweight, gray-haired commissioner Edmund "Mundie" Dunkirk, complain for the Nth time in just the last forty minutes.']
      ],
      TEXT_SPEEDS = {
          'NORMAL': 0.055,
          'SURPRISE': 0.0025,
          'SUSPENSE': 0.1,
          'SUPER SUSPENSE': 0.2
      };

let awaitingInput = false,
    textBlockIterator = 0,
    animationEventsNotRunning = {
        'CHANGE_TEXT': true,
        'OPEN_MENU_MODAL': true
    },
    printIntervalLoop;

function displayNextTextBlock(textSpeed){
    let textCharIterator = 0,
        textLineIterator = 0;
    printIntervalLoop = setInterval(() => {
        if(textLineIterator < SCRIPT_ARRAY[textBlockIterator].length){
            if(textCharIterator < SCRIPT_ARRAY[textBlockIterator][textLineIterator].length){
                MAIN_TEXTBOX.innerHTML += SCRIPT_ARRAY[textBlockIterator][textLineIterator][textCharIterator]
                textCharIterator++;
            }
            else{
                textLineIterator++;
                textCharIterator = 0;
                MAIN_TEXTBOX.innerHTML += "<br>"
            }
        }else{
            clearInterval(printIntervalLoop)
            awaitingInput = true;
            textBlockIterator += 1;
            if(textBlockIterator == SCRIPT_ARRAY.length){
                textBlockIterator = 0;
            }
        }
    }, textSpeed * 1000)
}

function changeText(){
    if(animationEventsNotRunning['CHANGE_TEXT']){
        animationEventsNotRunning['CHANGE_TEXT'] = false;
        if (awaitingInput){
            let cleanIntervalLoop = setInterval(function(){
                MAIN_TEXTBOX.style.opacity = MAIN_TEXTBOX_COMP_STYLE.getPropertyValue('opacity') - 0.1; 
            }, 50)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MAIN_TEXTBOX.innerHTML= '';
                MAIN_TEXTBOX.style.opacity = 1;
                displayNextTextBlock(TEXT_SPEEDS['NORMAL']);
                awaitingInput = false;
                animationEventsNotRunning['CHANGE_TEXT'] = true;      
            }, 500)
        }else{
            clearInterval(printIntervalLoop)
            MAIN_TEXTBOX.innerHTML = SCRIPT_ARRAY[textBlockIterator][0]
            for (let currentLine = 1; currentLine < SCRIPT_ARRAY[textBlockIterator].length; currentLine++){
                MAIN_TEXTBOX.innerHTML += '<br>' + SCRIPT_ARRAY[textBlockIterator][currentLine] 
            }
            textBlockIterator += 1
            if(textBlockIterator == SCRIPT_ARRAY.length){
                textBlockIterator = 0
            }
            awaitingInput = true
            animationEventsNotRunning['CHANGE_TEXT'] = true;
        }
    }
}

function openMenuModal(){
    MENU_MODAL_BG.style.display = 'block'

}

MAIN_TEXTBOX.addEventListener('click', () => changeText());

window.addEventListener('keyup', function(e){
    if(e.key == 'Enter') changeText() 
});

LOG_BUTTON.addEventListener("click", () => {
    openMenuModal()
})

displayNextTextBlock(TEXT_SPEEDS['NORMAL'])