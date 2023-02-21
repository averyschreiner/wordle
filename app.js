document.addEventListener("DOMContentLoaded", () => {
    let grid = document.querySelector('#game');
    let fragment = document.createDocumentFragment();
    let apiKey = "089d4349-7892-44fe-9517-a3bdd8cd7315";
    let pathToTxtFile = "words/"
    let wordDefinition = "";
    let numOfGuesses = 6;
    let wordLength = 5;
    let currentTile = 1;
    let currentWord = "";
    let magicWord = "";
    let enterAllowed = false;
    let delAllowed = false;
    let haveSubmitted = false;
    let gameOver = false;
    let currentRow = 1;
    let words = [];
    let date = new Date();
    let seed = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let allowedKeys = ["Q","W","E","R","T","Y","U","I","O","P","A","S","D","F","G","H","J","K","L","Z","X","C","V","B","N","M"];

    generateGrid();
    init();

    //adjust our title according to the word length
    function init() {
        switch (wordLength) {
            case 3:
                document.getElementById("title").textContent = "Wrd";
                pathToTxtFile += "words3.txt"
                break;
            case 4:
                document.getElementById("title").textContent = "Wrdl";
                pathToTxtFile += "words4.txt"
                break;
            case 5:
                document.getElementById("title").textContent = "Wordl";
                pathToTxtFile += "words5.txt"
                break;
            case 6:
                document.getElementById("title").textContent = "Wordle";
                pathToTxtFile += "words6.txt"
                break;
            case 7:
                document.getElementById("title").textContent = "Woordle";
                pathToTxtFile += "words7.txt"
                break;
            case 8:
                document.getElementById("title").textContent = "Wooordle";
                pathToTxtFile += "words8.txt"
                break;
            case 9:
                document.getElementById("title").textContent = "Woooordle";
                pathToTxtFile += "words9.txt"
                break;
            case 10:
                document.getElementById("title").textContent = "Wooooordle";
                pathToTxtFile += "words10.txt"
                break;
        }
        getWord();
    }

    function getWord() {
        // only 1 word per length per day
        let generator = new Math.seedrandom(seed);
        let randomNumber = generator();

        fetch(pathToTxtFile)
            .then(response => response.text())
            .then(data => {
                data = data.replace(/\r/g, "");
                words = data.split("\n");
                let index = Math.ceil(randomNumber * words.length);
                magicWord = words[index];
            })
            .catch(error => console.log(error));
    }

    function resetValues() {
        currentTile = 1;
        currentWord = "";
        enterAllowed = false;
        delAllowed = false;
        haveSubmitted = false;
        gameOver = false;
        currentRow = 1;
        grid.innerHTML = '';
        pathToTxtFile = "words/"
        wordDefinition = "";
        document.getElementById("define-word").style.display = "none";
        document.getElementById("define-word").innerHTML = "";
        document.getElementById("define-link").style.display = "none";
        document.getElementById("define-link").href = "https://www.google.com/search?q=define+";
        generateGrid();
        resetKeys();
        init();
    }

    // word length
    let selectors = document.querySelectorAll(".selectors-container button");
    for (let i = 0; i < selectors.length; i++) {
        selectors[i].onclick = ({ target }) => {
            wordLength = Number(target.getAttribute("wl"));
            resetValues();
        }
    }

    // difficulty
    let difficulty = document.querySelectorAll(".difficulty-container button");
    for (let i = 0; i < difficulty.length; i++) {
        difficulty[i].onclick = ({ target }) => {
            numOfGuesses = Number(target.getAttribute("nr")); 
            resetValues();
        }
    }

    // computer keyboard input
    document.addEventListener("keydown", function(event) {
        let letter = event.key;

        //enters only allowed when a row is full of letters
        if (currentTile % wordLength == 1 && currentTile != 1 && currentWord !== "") {
            enterAllowed = true;
        }
        else {
            enterAllowed = false;
        }

        if (letter == "Enter") {
            event.preventDefault();
            if (enterAllowed && !gameOver) {
                updateKeyboard();
                gameCheck();
                updateTiles();
            }
        }
        //delete only if there is a letter to delete, and if the row hasnt been submitted yet
        else if (letter == "Backspace") {
            if (delAllowed && currentTile > 1 && sameRow() && !gameOver) {
                document.getElementById(currentTile - 1).textContent = "";
                currentWord = currentWord.substring(0, currentWord.length - 1);
                currentTile--;
            }
        }
        else if ((!enterAllowed || haveSubmitted && !gameOver) && allowedKeys.includes(letter.toUpperCase())) {
            document.getElementById(currentTile).textContent = letter.toUpperCase();
            currentWord += letter.toUpperCase();
            currentTile++;
            haveSubmitted = false;
            delAllowed = true;
        }
    })

    // our input from the screen keyboard
    let keys = document.querySelectorAll(".keyboard-row button");
    for (let i = 0; i < keys.length; i++) {
        keys[i].onclick = ({ target }) => {
            let letter = target.getAttribute("data-key");
            
            //enters only allowed when a row is full of letters
            if (currentTile % wordLength == 1 && currentTile != 1) {
                enterAllowed = true;
            }
            else {
                enterAllowed = false;
            }

            if (letter == "enter") {
                if (enterAllowed && !gameOver) {
                    updateKeyboard();
                    gameCheck();
                    updateTiles();
                }
            }
            //delete only if there is a letter to delete, and if the row hasnt been submitted yet
            else if (letter == "del") {
                if (delAllowed && currentTile > 1 && sameRow() && !gameOver) {
                    document.getElementById(currentTile - 1).textContent = "";
                    currentWord = currentWord.substring(0, currentWord.length - 1);
                    currentTile--;
                }
            }
            else if (!enterAllowed || haveSubmitted && !gameOver) {
                document.getElementById(currentTile).textContent = letter.toUpperCase();
                currentWord += letter.toUpperCase();
                currentTile++;
                haveSubmitted = false;
                delAllowed = true;
            }
        }
    }

    function gameCheck() {
        // win
        if (currentWord === magicWord) {
            alertScreen("Congratulations!", 2500);
            gameOver = true;
        }
        // silly last row bug
        else if ((currentRow === numOfGuesses) && !words.includes(currentWord)) {
            delAllowed;
        }
        // lose
        else if (currentRow === numOfGuesses) {
            alertScreen("You'll get 'em next time, word was: " + magicWord, 10000);
            gameOver = true;
        }

        // reveal definition, etc
        if (gameOver) {
            definition();
        }
    }

    function updateKeyboard() {
        if (words.includes(currentWord)) {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let keyboardLetter = key.getAttribute("data-key").toUpperCase();

                // if the keyboard button is in the word, change accordingly
                if (currentWord.includes(keyboardLetter)) {
                    let cwIndex = currentWord.indexOf(keyboardLetter);
                    let mwIndex = magicWord.indexOf(keyboardLetter);

                    //once green dont change
                    if (key.style.backgroundColor != "rgb(25, 148, 25)") {
                        //green
                        if (mwIndex == cwIndex) {
                            key.style.backgroundColor = 'rgb(25, 148, 25)';
                        }
                        //yellow
                        else if (isYellow(cwIndex)) {
                            key.style.backgroundColor = 'rgb(183, 183, 31)';
                        }
                        //grey
                        else {
                            key.style.backgroundColor = 'rgb(45, 45, 45)';
                        }
                    }   
                }
            }
        }
    }

    function updateTiles() {
        if (words.includes(currentWord)) {
            for (let i = 0; i < magicWord.length; i++) {
                let tile = document.getElementById(getTileID(i));

                //green
                if (magicWord[i] === currentWord[i]) {
                    tile.classList.add("correct");
                }
                //yellow
                else if (isYellow(i)) {
                    tile.classList.add("present");
                }
                //grey
                else {
                    tile.classList.add("absent");
                }
            }
            //permissions bookkeeping 
            haveSubmitted = true;
            currentRow++;
            delAllowed = false;
            currentWord = "";
        }
        else {
            alertScreen("Word not in list.", 2000);
        }
    }

    function isYellow(index) {
        let mwCount = 0;
        let cwCount = 0;
        for (let i = 0; i < wordLength; i++) {
            if (magicWord[i] === currentWord[index] && currentWord[i] !== currentWord[index]) {
                mwCount += 1;
            }
            if (i <= index) {
                if (currentWord[i] === currentWord[index] && magicWord[i] !== currentWord[index]) {
                    cwCount += 1;
                }
            }

            if (i >= index) {
                if (cwCount == 0) {
                    return false;
                }
                if (cwCount <= mwCount) {
                    return true;
                }
            }
        }
    }

    function alertScreen(message, time) {
        let alerto = document.getElementById("custom-alert");
        alerto.style.display = 'block';
        alerto.textContent = message;
        setTimeout(function () {
            alerto.style.display = 'none';
        }, time);
    }

    function getTileID(index) {
        return (currentRow * wordLength) - (wordLength - index - 1);
    }

    function sameRow() {
        let tileToDelete = currentTile - 1;
        if (Math.ceil(tileToDelete / wordLength) == currentRow) {
            haveSubmitted = true;
            return true;
        }
        else {
            return false;
        }
    }

    function generateGrid() {
        let tileCount = 1;

        Array.from({ length: numOfGuesses }).forEach(() => {
            //create row
            let row = document.createElement('div');
            row.classList.add('row');

            Array.from({ length: wordLength }).forEach(() => {
                //create tile
                let tile = document.createElement('div');
                tile.textContent = "";
                tile.setAttribute("id", tileCount)

                //size of tile depends on number of guesses allowed
                tile.classList.add('tile');
                switch (numOfGuesses) {
                    case 4:
                        tile.classList.add("expert");
                        document.getElementById("game").classList.add("game-expert");
                        break;
                    case 6:
                        tile.classList.remove("expert");
                        tile.classList.remove("easy");
                        document.getElementById("game").classList.remove("game-expert");
                        break;
                    case 8:
                        tile.classList.add("easy");
                        document.getElementById("game").classList.remove("game-expert");
                        break;
                }

                //add it the row
                row.appendChild(tile);
                tileCount++;
            })
            //add row to our fragment
            fragment.appendChild(row);
        });

        grid.appendChild(fragment);
    }

    function resetKeys() { 
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            key.style.backgroundColor = 'rgb(74, 74, 74)';
        }
        
    }

    function definition() {
        fetch(`https://dictionaryapi.com/api/v3/references/collegiate/json/${magicWord}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                let definitionElt = document.getElementById("define-word");
               
                // definition in API
                if (data[0].shortdef != undefined) {
                    definitionElt.style.display = "block";
                    definitionElt.style.fontStyle = "normal";
                    definitionElt.innerHTML = "<h2><u>" + magicWord.toLowerCase() + ":</u></h2>";

                    for (let i = 0; i < data[0].shortdef.length; i++) {
                        definitionElt.innerHTML += i+1 + ". " + data[0].shortdef[i] + "<br>";
                    }
                    definitionElt.innerHTML += "<br>";
                }
                // provide google search link
                else {
                    let link = document.getElementById("define-link");
                    link.href += magicWord.toLowerCase();
                    link.style.display = "block";
                }  
            })
            .catch(error => console.error(error));
    }

});