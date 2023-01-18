const MAIN_TEXTBOX = document.querySelector('main'),
      MAIN_TEXTBOX_COMP_STYLE = window.getComputedStyle(MAIN_TEXTBOX),
      TEXT_ARRAY = [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          'Phasellus sed elit ac nulla dictum bibendum. Praesent lacinia quam nec erat feugiat egestas. Vivamus quis vulputate ligula, eu mollis mauris. Aenean orci felis, rutrum nec pharetra ac, tempus sit amet nisi. Etiam elementum lacus id orci luctus consectetur. Pellentesque eget mattis lacus, sit amet sagittis augue. Ut semper turpis vel cursus ullamcorper. Pellentesque at pharetra ex. Nulla lacus leo, dignissim id est ac, dignissim mattis diam. Nulla augue magna, condimentum eget nunc eget, semper rutrum turpis.'
      ],
      TEXT_SPEEDS = {
          'NORMAL': 0.025,
          'SURPRISE': 0.0025,
          'SUSPENSE': 0.1,
          'SUPER SUSPENSE': 0.2
      };

let awaitingInput = false,
    textArrayIterator = 0,
    changeTextEventNotRunning = true,
    printIntervalLoop;

MAIN_TEXTBOX.addEventListener('click', () => changeText());

window.addEventListener('keyup', function(e){
    if(e.key == 'Enter') changeText() 
});

function showNextTextWithTimer(seconds){
    let currentStringIterator = 0;
    printIntervalLoop = setInterval(() => {
        MAIN_TEXTBOX.innerHTML += TEXT_ARRAY[textArrayIterator][currentStringIterator]
        currentStringIterator++
        if (currentStringIterator == TEXT_ARRAY[textArrayIterator].length){
            clearInterval(printIntervalLoop)
            awaitingInput = true
            textArrayIterator += 1
            if(textArrayIterator == TEXT_ARRAY.length){
                textArrayIterator = 0
            }
        }
    }, seconds * 1000)
}

function changeText(){
    if(changeTextEventNotRunning){
        changeTextEventNotRunning = false;
        if (awaitingInput){
            let cleanIntervalLoop = setInterval(function(){
                MAIN_TEXTBOX.style.opacity = MAIN_TEXTBOX_COMP_STYLE.getPropertyValue('opacity') - 0.1; 
            }, 50)
            setTimeout(() => {
                clearInterval(cleanIntervalLoop);
                MAIN_TEXTBOX.innerHTML= '';
                MAIN_TEXTBOX.style.opacity = 1;
                showNextTextWithTimer(TEXT_SPEEDS['SURPRISE']);
                awaitingInput = false;
                changeTextEventNotRunning = true;      
            }, 500)
        }else{
            clearInterval(printIntervalLoop)
            MAIN_TEXTBOX.innerHTML = TEXT_ARRAY[textArrayIterator]
            textArrayIterator += 1
            if(textArrayIterator == TEXT_ARRAY.length){
                textArrayIterator = 0
            }
            awaitingInput = true
            changeTextEventNotRunning = true;
        }
    }
}

showNextTextWithTimer(TEXT_SPEEDS['NORMAL'])