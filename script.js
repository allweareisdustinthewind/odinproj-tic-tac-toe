// ---------------------------------------------------
//           Modul 'gameBoard'
// Functionality for supporting manipulations with game's board.
// Contains actual status of game. 
// ---------------------------------------------------

const gameBoard = (function () {
   const boardSize = 3; // Size of board (NxN)
   
   let board = []; // Gameboard: N arrays of size N

   //
   // Initialize gameboard with empty data
   //
   for (let i = 0; i < boardSize; ++i) {
      board [i] = Array (boardSize).fill ('');
   }

   //
   // Funktion to get a board's size
   //
   const getBoardSize = () => boardSize;

   //
   // Funktion to get a value in certain cell of game's board
   //
   const getValue = (row, col) => board [row] [col];

   //
   // Set certain cell in specified value
   //
   const setValue = (row, col, val) => { board [row] [col] = val; };
   
   //
   // Return true, if the cell has some symbol - X or O
   //
   const isSymbolSet = (row, col) => board [row] [col] === 'X' || board [row] [col] === 'O';

   return {getBoardSize, getValue, setValue, isSymbolSet};
})();

// ---------------------------------------------------
//           Modul 'gameLogic'
// Contains list of players and main logic of a game
// ---------------------------------------------------
const gameLogic = (function () {
   let autoPlay = true;      // Flag 'Play with computer' (true) or 'Play with a friend' (false)
   let firstMove = true;     // Flag if it was a first click on a cell in game's board
   let gameStarted = false;  // If true, game is was started
   let inputBlocked = false; // If true, gamer can't change his name and his symbol anymore (the game isn't finished yet)
   let players = [];  // All gamers to play
   let curPlayer = 0; // Index of actual player in array 'players'

   //
   // Set next player from array 'players' as active
   //
   const switchToNextPlayer = () => {
      if (++curPlayer >= players.length)
         curPlayer = 0;
   };

   //
   // Switch mode 'Play with computer' on or off
   //
   const toggleAutoPlay = () => {
       autoPlay = !autoPlay;
   };

   //
   // Return true, if gamer plays with computer
   //
   const isAutoPlay = () => autoPlay;

   //
   // Add new player to the list of all players
   //
   const addPlayer = (player) => {
      players.push (player);
   };

   //
   // Set flag 'game was started'
   //
   const startGame = (val) => {
      gameStarted = val;
   };

   //
   // Return true if the game was started
   //
   const isGameStarted = () => gameStarted;

   //
   // Disable possibility to change player's name or player's symbol
   //
   const blockInput = (val) => {
      if (val === inputBlocked)
         return;

      document.querySelector ('#player1').disabled = val;
      if (!autoPlay)
         document.querySelector ('#player2').disabled = val;

      inputBlocked = val;
   };

   //
   // Return true if player can't change his name and his symbol
   //
   const isInputBlocked = () => inputBlocked;

   //
   // Set player's symbol on certain cell of game's board
   //
   const setSymbolOnBoard = (row, col) => {
      const symbol = players [curPlayer].symbol;
      gameBoard.setValue (row, col, symbol);

      // Update clicked cell on a page
      const el = document.querySelector (`div[data-row="${row}"][data-col="${col}"]`);
      if (symbol === 'X')
         el.classList.add ('symbol_x');
       else
          el.classList.add ('symbol_o');
      el.innerText = symbol;
   };

   //
   // Reset actual game's status and start new game from scratch
   //
   const resetGame = () => {
      // Clear game's board
      const boardSize = gameBoard.getBoardSize ();
      for (let i = 0; i < boardSize; ++i) {
         for (let j = 0; j < boardSize; ++j) {
            gameBoard.setValue (i, j, '');
            const el = document.querySelector (`div[data-row="${i}"][data-col="${j}"]`);
            el.classList.remove ('symbol_x');
            el.classList.remove ('symbol_o');
            el.innerText = '';
         }
      }

      // Reset intern parameters of modul
      firstMove = true;
      curPlayer = 0;

      // Switch of tip of invalid user's input
      resetInvalidHighlight ();

      // Hide celebration of previous winner
      document.querySelector ('.result_container > path').setAttribute ('d', '');
      document.querySelector ('.result_text').innerText = '';
      document.querySelector ('.result > path').setAttribute ('d', '');

      // Hide line throug winning cells
      const line = document.querySelector ('.win_line');
      line.style.width = '0';
      line.style.height = '0';

      // Allow user to change his name or his symbol before starting of new game
      blockInput (false);
   };

   //
   // Funktion check if there is a winner in the game. If so it return data of winning player
   // and positions of three consecutive cells 
   //
   const getWinner = () => {
      const boardSize = gameBoard.getBoardSize ();
      
      // Counts of X and O pro each column of board
      let colX = Array (boardSize).fill (0);
      let colO = Array (boardSize).fill (0);
      
      // Counts of X and O on straight and opposite diagonals of board
      let diagX = 0, diagO = 0;
      let diagOppositeX = 0, diagOppositeO = 0;

      //
      // Helper to create winner's data to return from function
      //
      function createWinner (symbol, row_start, col_start, row_end, col_end) {
         let player;

         // Search player with a given symbol in array 'players'
         if (symbol === 'X' || symbol === 'O') {
            for (let i = 0; i < players.length; ++i) {
               if (players [i].symbol === symbol) {
                  player = players [i];
                  break;
               }
            }
         }

         return {player, row_start, col_start, row_end, col_end};
      };

      let isEmptyCell = false; // Flag  to indicate, if there is an cell ohne symbol in the board

      // Analyze current status of game
      for (let i = 0; i < boardSize; ++i) {
         // Count of X and O in actual row 
         let rowX = 0, rowO = 0;

         // Cycle through columns of actual row
         for (let j = 0; j < boardSize; ++j) {
            const val = gameBoard.getValue (i, j);
            
            // X found
            if (val == 'X') {
               ++rowX;     // Increase count of X's in actual row
               ++colX [j]; // Increase count of X's in actual column 

               if (i ===j)  // On diagonal element? Increase count of X's on straight diagonal
                  ++diagX;

               if (j === boardSize - i - 1) // On opposite diagonal? Increase count of X's on opposite diagonal
                  ++diagOppositeX;
            }
            else if (val == 'O') /*O found*/ {
               ++rowO;      // Increase count of O's in actual row
               ++colO [j];  // Increase count of O's in actual column 

               if (i === j) // On diagonal element? Increase count of O's on straight diagonal
                  ++diagO;

               if (j === boardSize - i - 1) // On opposite diagonal? Increase count of O's on opposite diagonal
                  ++diagOppositeO;
            }
            else // There is no X or O in cell, the cell is empty.
               isEmptyCell = true;
         }

         if (rowX === boardSize) // Entire row filled with X, X won 
            return createWinner ('X', i, 0, i, boardSize - 1);
         else if (rowO === boardSize) // Entire row filled with O, O won 
            return createWinner ('O', i, 0, i, boardSize - 1);
      }

      if (diagX === boardSize) // Entire straight diagonal filled with X, X won 
         return createWinner ('X', 0, 0, boardSize - 1, boardSize - 1);
      else if (diagO === boardSize) // Entire straight diagonal filled with O, O won 
         return createWinner ('O', 0, 0, boardSize - 1, boardSize - 1);
      else if (diagOppositeX === boardSize) // Entire opposite diagonal filled with X, X won 
         return createWinner ('X', 0, boardSize - 1, boardSize - 1, 0);
      else if (diagOppositeO === boardSize) // Entire opposite diagonal filled with O, O won 
         return createWinner ('O', 0, boardSize - 1, boardSize - 1, 0);

      for (let i = 0; i < boardSize; ++i) {
         // Entire column filled with X, X won
         if (colX [i] === boardSize)
            return createWinner ('X', 0, i, boardSize - 1, i);

         // Entire column filled with O, O won
         if (colO [i] === boardSize)
            return createWinner ('O', 0, i, boardSize - 1, i);
      }

      // There is no empty cells in a board, tie.
      if (!isEmptyCell)
         return createWinner ('=', -2, 0, 0, 0);

      // No winners and no losers
      return createWinner ('', -1, 0, 0, 0);
   };

   //
   // Function searches best first position for first computer's move
   //
   function getBestFirstPosition () {

      // Try to set first symbol in central cell, if the cell still free
      if (!gameBoard.isSymbolSet (1, 1))
         return {row: 1, col: 1};

      
      // Randomly select ob of a corner - second move in a corner is a best option not to lose
      const boardSize = gameBoard.getBoardSize ();
      const index = Math.floor (Math.random () * 4);
      switch (index) {
         case 0:
            return {row: 0, col: 0};

         case 1:
            return {row: 0, col: boardSize - 1};

         case 2:
            return {row: boardSize - 1, col: 0};
      }

      return {row: boardSize - 1, col: boardSize - 1};
   };

   //
   // Tries to find a row, column or diagonal with 'boardSize - 1' given symbols. 
   // Return coordinates of found free cell in this row / column / diagonal.
   //
   function getFreeCellFor (testSymbol) {
      const boardSize = gameBoard.getBoardSize ();
      const maxCount = boardSize - 1; // Count of same symbols, which should have the needed row / column / diagonal

      // Initialize array with information about columns
      let colInfo = [];
      for (let i = 0; i < boardSize; ++i)
         colInfo.push ({num: 0, freeCell: 0, hasOtherSymbols: false});

      // Info about straight and opposite diagonals
      let diag = {num: 0, freeCell: 0, hasOtherSymbols: false};
      let diagOpposite = {num: 0, freeCell: 0, hasOtherSymbols: false};

      // Make search of row / column / diagonal with 'maxCount' of 'testSymbol'
      for (let i = 0; i < boardSize; ++i) /*Cycle on rows*/ {
         let freeCell = 0; // Index of last free cell in actual row
         let num = 0;      // Count of cells with 'testSymbol' in actual row
         let hasOtherSymbols = false; // Flag, if actual row has other symbols in addition to 'testSymbol'

         for (let j = 0; j < boardSize; ++j) /*Cycle on columns*/ {
            const symbol = gameBoard.getValue (i, j);
            
            // Empty cell found
            if (symbol != 'X' && symbol != 'O') {
               freeCell = j;             // Save index of free cell in actual row
               colInfo [j].freeCell = i; // Save index of free cell in actual column

               // On straight diagonal? Save index of free cell
               if (i === j)
                  diag.freeCell = j;

               // On opposite diagonal? Save index of free cell
               if (j === maxCount - i)
                  diagOpposite.freeCell = j;

               continue;
            }

            // Test-symbol ist found, increase count of found symbols
            if (symbol === testSymbol) {
               ++num;              // Increase count of found symbols in actual row
               ++colInfo [j].num;  // Increase count of found symbols in actual column

               // On straight diagonal? Increase count of found symbols
               if (i === j)
                  ++diag.num;

               // On opposite diagonal? Increase count of found symbols
               if (j === maxCount - i)
                  ++diagOpposite.num;

               continue;
            }

            // Actual cell is not free, but has some other symbol.
            // We save this info for actual row / column and diagonals
            hasOtherSymbols = true;
            colInfo [j].hasOtherSymbols = true;

            if (i === j)
               diag.hasOtherSymbols = true;

            if (j === maxCount - i)
               diagOpposite.hasOtherSymbols = true;
         }

         // Actual row contains 'maxCount' symbols and all of symbols are 'testSymbol', result is found.
         if (num === maxCount && !hasOtherSymbols)
            return {row: i, col: freeCell};
      }

      // Straight diagonal contains 'maxCount' symbols and all of symbols are 'testSymbol', result is found.
      if (diag.num === maxCount && !diag.hasOtherSymbols)
         return {row: diag.freeCell, col: diag.freeCell};

      // Opposite diagonal contains 'maxCount' symbols and all of symbols are 'testSymbol', result is found.
      if (diagOpposite.num === maxCount && !diagOpposite.hasOtherSymbols)
         return {row: maxCount - diagOpposite.freeCell, col: diagOpposite.freeCell};

      for (let i = 0; i < boardSize; ++i) {
         // Column contains 'maxCount' symbols and all of symbols are 'testSymbol', result is found.
         if (colInfo [i].num === maxCount && !colInfo [i].hasOtherSymbols)
            return {row: colInfo [i].freeCell, col: i};
      }

      // There is no row / column / diagonal with 'maxCount' of 'testSymbol'
      return {row: -1, col: -1};
   };

   //
   // Tries to find a cell to win the game
   //
   function tryToWin () {
      let pos = getFreeCellFor (players [1].symbol);
      if (pos.row === -1 || pos.col === -1)
         return false;

      setSymbolOnBoard (pos.row, pos.col);
      return true;
   };

   //
   // Prevent other player to make a winning combination
   //
   function preventedNextPlayerToMove () {
      let pos = getFreeCellFor (players [0].symbol);
      if (pos.row === -1 || pos.col === -1)
         return false;

      setSymbolOnBoard (pos.row, pos.col);
      return true;
   };

   // 
   // Get some random free cell to make next move automatically
   //
   function getRandomFreeCell () {
      let freeCells = []; // Indexes of all free cells

      const boardSize = gameBoard.getBoardSize ();

      // Get indexes of all free cells
      for (let i = 0; i < boardSize; ++i) {
         for (let j = 0; j < boardSize; ++j) {
            if (gameBoard.isSymbolSet (i, j))
               continue;

            freeCells.push ({row: i, col: j});
         }
      }

      if (freeCells.length === 0)
         return {row: -1, col: -1};

      // Get some random index of one of free cell
      const index = Math.floor (Math.random () * freeCells.length);
      return {row: freeCells [index].row, col: freeCells [index].col};
   };

   //
   // Play one turn of a game
   //
   const playTurn = (row, col) => {

      // By first move adopt names and symbols of actual players
      if (firstMove) {
         for (let i = 0; i < players.length; ++i) {
            players [i].name = getPlayerName (i + 1);
            players [i].symbol = getPlayerSymbol (i + 1);
         }
      }

      setSymbolOnBoard (row, col)
      switchToNextPlayer ();

      // By playing with a friend just switch actual player and let other player make his move
      if (!autoPlay) {
         firstMove = false;
         
         // Check, if we have a winner
         processWinner ();
         return;
      }

      // Actual gamer plays with computer. If it is a first move of computer, 
      // computer searches best position to increase chances to win
      if (firstMove) {
         firstMove = false;
         const pos = getBestFirstPosition ();
         setSymbolOnBoard (pos.row, pos.col);
         switchToNextPlayer ();
         return;
      }

      // Computer tries to find a move, that will lead him to win
      if (tryToWin ()) {
         processWinner ();
         return;
      }
      
      // There is actually no winning combination. At least try to prevent other player to win 
      if (preventedNextPlayerToMove ()) {
         switchToNextPlayer ();
         return;
      }

      // No other options - pick up some random cell for next move
      const pos = getRandomFreeCell ();
      if (pos.row != -1 && pos.col != -1)
         setSymbolOnBoard (pos.row, pos.col);

      switchToNextPlayer ();

      // Check, if we have a winner (normally not, but who knows) 
      processWinner ();
   };

   //
   // Show celebration text for a winner
   // 
   function celebrate (player) {
      const el = document.querySelector ('.result');
      const elText = document.querySelector ('.result_text');
      
      // Special case - gamer plays with computer and has a name 'Computer'.
      // In this case the computer's name will be just for fun changed to 'Real Computer :)'
      let name = player.name;
      if (autoPlay && player.symbol === players [1].symbol && players [0].name.toLowerCase () === 'computer')
         name = 'Real Computer :)';

      // Player with X-symbol won
      if (player.symbol === 'X') {
         elText.innerText = `Congratulation! Player '${name}' won!`;
         elText.style.textShadow = '-2px 0 rgb(168, 9, 9), 0 2px rgb(168, 9, 9), 2px 0 rgb(168, 9, 9), 0 -2px rgb(168, 9, 9)';
         el.style.stroke = 'rgb(168, 9, 9)';
         el.style.fill = 'rgba(235, 49, 49, 0.404)';
         el.style.filter = 'drop-shadow(0 0 10px red)';
      } else if (player.symbol === 'O') /*Player with O-symbol won*/ {
         elText.innerText = `Congratulation! Player '${name}' won!`;
         elText.style.textShadow = '-1px 0 green, 0 1px green, 1px 0 green, 0 -1px green';
         el.style.stroke = 'lightgreen';
         el.style.fill = 'rgba(16, 165, 16, 0.278)';
         el.style.filter = 'drop-shadow(0 0 10px lightgreen)';
      } else if (player.symbol === '=') /*Tie*/ {
         elText.innerText = 'No winners - tie!';
         elText.style.textShadow = '-1px 0 gold, 0 1px gold, 1px 0 gold, 0 -1px gold';
         el.style.stroke = 'gold';
         el.style.fill = 'rgba(255, 217, 0, 0.74)';
         el.style.filter = 'drop-shadow(0 0 3rem gold)';
      } else
         return;

      const rc = elText.getBoundingClientRect ();
      const offsetTop = 80;
      const offsetTopExt = 74;
      const offsetLeft = (window.innerWidth - rc.width) / 2;
      const sizeAngleX = 20;
      const sizeAngleY = (rc.height + 10) / 2;
      const sizeAngleXExt = 35;
      const sizeAngleYExt = (rc.height + 24) / 2;

      elText.style.left = offsetLeft + 'px';
      elText.style.top = offsetTop + 'px';

      // Big container for celebration's element (background with blue color)
      let path = `M${offsetLeft - 15} ${offsetTopExt - 15} 
                  H${offsetLeft + rc.width + 15} 
                  L${offsetLeft + rc.width + sizeAngleXExt + 15} ${offsetTopExt + sizeAngleYExt} 
                  L${offsetLeft + rc.width + 15} ${offsetTopExt + rc.height + 30} 
                  H${offsetLeft - 15} 
                  L${offsetLeft - sizeAngleXExt - 15} ${offsetTopExt + sizeAngleYExt} 
                  z`;
      document.querySelector ('.result_container > path').setAttribute ('d', path);

      // Celebration in big container (red, green or gold element)
      path = `M${offsetLeft - 5} ${offsetTop - 5} 
              H${offsetLeft + rc.width + 5} 
              L${offsetLeft + rc.width + sizeAngleX + 5} ${offsetTop + sizeAngleY} 
              L${offsetLeft + rc.width + 5} ${offsetTop + rc.height + 10} 
              H${offsetLeft - 5} 
              L${offsetLeft - sizeAngleX - 5} ${offsetTop + sizeAngleY} 
              z`;

      document.querySelector ('.result > path').setAttribute ('d', path);
   };

   //
   // Check, if there is a winner. If yes, celebrate him and show result on a board
   //
   const processWinner = () => {
      // Is there a winner?
      const winner = getWinner ();
      
      // No winners
      if (winner.row_start === -1)
         return;

      // Tie
      if (winner.row_start === -2) {
         celebrate (createPlayer ('', '='));
         return;
      }

      // There is a winner, celebrate him
      celebrate (winner.player);

      // Show result on a board - line through all winnig cells 
      const line = document.querySelector ('.win_line');
      const el = document.querySelector ('.win_line > line');
      const rcStart = document.querySelector (`div[data-row="${winner.row_start}"][data-col="${winner.col_start}"]`).getBoundingClientRect ();
      const rcEnd = document.querySelector (`div[data-row="${winner.row_end}"][data-col="${winner.col_end}"]`).getBoundingClientRect ();
      
      const minX = Math.min (rcStart.x, rcEnd.x);
      const minY = Math.min (rcStart.y, rcEnd.y);
      const maxX = Math.max (rcStart.x, rcEnd.x) + rcEnd.width;
      const maxY = Math.max (rcStart.y, rcEnd.y) + rcEnd.height;

      line.style.left   = minX + 'px';
      line.style.top    = minY + 'px';
      line.style.width  = (maxX - minX) + 'px';
      line.style.height = (maxY - minY) + 'px';

      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

      if (winner.row_start === winner.row_end) /*Horizontal*/ {
         x1 = 0;
         x2 = maxX - minX;
         y1 = rcStart.y + (rcStart.height / 2) - minY;
         y2 = y1;
      } else if (winner.col_start === winner.col_end) /*Vertical*/ {
         x1 = rcStart.x + (rcStart.width / 2) - minX;
         x2 = x1;
         y1 = 0;
         y2 = maxY - minY;
      } else /*Diagonal*/ {
         y1 = 0;
         y2 = maxY - minY;
         if (winner.row_start === winner.col_start) /*Diagonal 'top left' -> 'bottom right'*/ {
            x1 = 0;
            x2 = maxX - minX;
         } else /*Diagonal 'top right' -> 'bottom left'*/ {
            x1 = maxX - minX;
            x2 = 0;
         }
      }

      if (winner.player.symbol === 'X')
         el.setAttribute ('stroke', 'rgb(168, 9, 9)');
      else
         el.setAttribute ('stroke', 'lightgreen');

      // Draw line
      el.setAttribute ('x1', x1);
      el.setAttribute ('y1', y1);
      el.setAttribute ('x2', x2);
      el.setAttribute ('y2', y2);
   };

   return {getWinner, playTurn, switchToNextPlayer, toggleAutoPlay, isAutoPlay, addPlayer, startGame, isGameStarted, 
           blockInput, isInputBlocked, setSymbolOnBoard, resetGame};
})();

//
// Factory function to create a new player
//
function createPlayer (name, symbol) {
   return {name, symbol};
}

//
// Click on one cell in a board
//
function clickOnCell (ev) {
   const row = ev.target.dataset.row;
   const col = ev.target.dataset.col;
   
   // If the cell has some symbol, nothing to do 
   if (gameBoard.isSymbolSet (row, col))
      return;

   // No playing, if by first clicking on a board there is false data in game's settings
   if (!gameLogic.isInputBlocked () && !checkData ())
      return;

   // Make next turn of a game
   gameLogic.playTurn (row, col);
}

//
// Hide tip about false input data
//
function resetInvalidHighlight () {
   let inputs = document.querySelectorAll ('form input');
   for (let i = 0; i < inputs.length; ++i) {
      inputs [i].style.boxShadow = ''
      inputs [i].style.border = '2px solid var(--outline-color)';
   }

   document.querySelector ('.tooltyp_text').innerText = ''
   document.querySelector ('.tooltyp > path').setAttribute ('d', '');
}

//
// Click on button 'Play with a friend' / 'Play with machine'
//
function playWithFriend (ev) {
   ev.preventDefault ();

   gameLogic.toggleAutoPlay ();

   const el = document.querySelector ('#player2');
   const btn = document.querySelector ('.play_with_friend');

   if (gameLogic.isAutoPlay ()) {
      el.disabled = true;
      el.value = 'Computer';
      el.style.color = '#32ADF0'
      el.style.fontWeight = 'bold';
      btn.innerText = 'Play with a friend';
   }
   else {
      el.disabled = false;
      el.value = '';
      el.style.color = 'white'
      el.style.fontWeight = 'normal';
      btn.innerText = 'Play with machine';
   }

   // Each click on a button will reset actual state of  a game
   gameLogic.resetGame ();
}

//
// Click on X- or O-symbol rights from a player's name
// 
function switchSymbol (ev) {
   ev.preventDefault ();

   // Player's symbol can't be changed in a middle of game
   if (gameLogic.isInputBlocked ())
      return;

   // Get info about next player
   const other_btn = ev.target.id === 'btn_1' ? document.querySelector ('#btn_2') : document.querySelector ('#btn_1');
   
   // Change all from X to O or otherweise
   if (ev.target.innerText === 'X') {
      ev.target.innerText = 'O';
      other_btn.innerText = 'X';

      ev.target.classList.remove ('decor_x');
      ev.target.classList.remove ('decor_x_hover');
      ev.target.classList.add ('decor_o');
      ev.target.classList.add ('decor_o_hover');

      other_btn.classList.remove ('decor_o');
      other_btn.classList.remove ('decor_o_hover');
      other_btn.classList.add ('decor_x');
   } else {
      ev.target.innerText = 'X';
      other_btn.innerText = 'O';

      ev.target.classList.remove ('decor_o');
      ev.target.classList.remove ('decor_o_hover');
      ev.target.classList.add ('decor_x');
      ev.target.classList.add ('decor_x_hover');

      other_btn.classList.remove ('decor_x');
      other_btn.classList.remove ('decor_x_hover');
      other_btn.classList.add ('decor_o');
   }
}

//
// Hover effect for a button with player's symbol
// 
function hoverSymbolButton (ev) {
   ev.preventDefault ();

   // No effects in a middle of game
   if (gameLogic.isInputBlocked ())
      return;

   if (ev.target.innerText === 'X')
      ev.target.classList.add ('decor_x_hover');
   else
      ev.target.classList.add ('decor_o_hover');
}

//
// Mouse leaves button with player's symbol, disable hover effect
//
function unhoverSymbolButton (ev) {
   ev.preventDefault ();
   
   // In a middle of game nothing to do with hovering
   if (gameLogic.isInputBlocked ())
      return;

   if (ev.target.innerText === 'X')
      ev.target.classList.remove ('decor_x_hover');
   else
      ev.target.classList.remove ('decor_o_hover');
}

//
// Display tip about false input data
//
function showTooltyp (numPlayer, text) {
   const el = numPlayer === 1 ? document.querySelector ('#player1') : document.querySelector ('#player2');

   el.style.border = '1px solid violet';
   el.style.boxShadow = '1px 1px 4px violet, 0 0 1em violet, 0 0 0.2em violet';

   const rc = el.getBoundingClientRect ();
   const elText = document.querySelector ('.tooltyp_text');
   elText.innerText = text;
   
   const x = rc.left + 50;
   const y = rc.bottom;
   elText.style.left = x + 'px';
   elText.style.top = (y + 3) + 'px';

   const rcText = elText.getBoundingClientRect ();
   let path = `M${x} ${y} L${x + 5} ${y + 4} H${rcText.right + 12} L${rcText.right + 5} ${y + rcText.height + 3} H${x - 17} L${x - 10} ${y + 4} H${x - 5} z`;
   document.querySelector ('.tooltyp > path').setAttribute ('d', path);
}

//
// Get name of player1 or player2 from interface
//
function getPlayerName (player) {
   const el = player === 1 ? document.querySelector ('#player1') : document.querySelector ('#player2');
   let name = el.value.trim ();
   if (name.length > 40)
      return name.substring (0, 37) + '...';

   return name;
}

//
// Get symbol of player1 or player2 from interface
//
function getPlayerSymbol (player) {
   const el = player === 1 ? document.querySelector ('#btn_1') : document.querySelector ('#btn_2');
   return el.innerText;
}

//
// Check of all game's settings are correct
// 
function checkData () {
   // Name of first player must be alwas set
   const namePlayer1 = getPlayerName (1);
   if (namePlayer1 === '') {
      showTooltyp (1, 'No name - no game');
      return false;
   }

   // By playing with computer we needn't to check a name of second player's (we know it already)
   if (gameLogic.isAutoPlay ())
      return true;

   // By playing with a friend check a friend's name
   const namePlayer2 = getPlayerName (2);
   if (namePlayer2 === '') {
      showTooltyp (2, 'No name - no game');
      return false;
   }

   // Player1 und player2 must not be the same
   if (namePlayer1 === namePlayer2) {
      showTooltyp (1, "Trying to play with yourself?");
      return false;
   }

   return true;
}

//
// Reset tip about false input data by entering some data in empty editbox 
//
function inputPlayerName (ev) {
   ev.preventDefault ();

   ev.target.style.border = '2px solid var(--outline-color)';
   ev.target.style.boxShadow = '';
   document.querySelector ('.tooltyp_text').innerText = ''
   document.querySelector ('.tooltyp > path').setAttribute ('d', '');
}

//
// Click on button "Start Game" or "Reset"
//
function startGame (ev) {
   ev.preventDefault ();

   // Click on "Reset"? Then start a new game 
   if (gameLogic.isGameStarted ()) {
      gameLogic.resetGame ();
      return;
   }

   // Click on "Start Game". If some input data are false, then show tooltyp and prevent user to play further
   if (!checkData ())
      return;

   // Change button to from "Start Game" to "Reset"
   ev.target.innerText = 'Reset Game';
   ev.target.classList.remove ('start');
   ev.target.classList.add ('reset');

   // Aktivate jover effect for all cells on board
   let cells = document.querySelectorAll ('.cell');
   cells.forEach (cell => {
      cell.classList.add ('cell_hover');
   });

   // Hide tip about false input data
   resetInvalidHighlight ();

   // Append to new players to game's logic
   gameLogic.addPlayer (createPlayer (getPlayerName (1), getPlayerSymbol (1)));
   gameLogic.addPlayer (createPlayer (getPlayerName (2), getPlayerSymbol (2)));
 
   // Disable change ob player's name or player's symbol
   gameLogic.blockInput (true);

   gameLogic.startGame (true);
}

//
// initialize - create initial UI and set all needed data before starting a game
//
function initialize () {
   const offsetLeft = 450;
   const offsetTop = 200;
   const sideSize = 80;

   const width  = window.innerWidth - (offsetLeft * 2);
   const height = window.innerHeight - (offsetTop * 2);

   // Draw main board
   let path = `M${offsetLeft + sideSize} ${offsetTop} 
               H${offsetLeft + width - sideSize} 
               L${offsetLeft + width} ${offsetTop + sideSize} 
               V${offsetTop + height - sideSize}
               L${offsetLeft + width - sideSize} ${offsetTop + height}
               H${offsetLeft + sideSize} 
               L${offsetLeft} ${offsetTop + height - sideSize}
               V${offsetTop + sideSize}
               z`;
   document.querySelector ('.gameboard > path').setAttribute ('d', path);

   // Draw triangle 1
   path = `M${offsetLeft} ${offsetTop} H${offsetLeft + sideSize - 10} L${offsetLeft} ${offsetTop + sideSize - 10} z`;
   document.querySelector ('.triangle1 > path').setAttribute ('d', path);

   // Draw triangle 2
   path = `M${offsetLeft + width - sideSize + 10} ${offsetTop} H${offsetLeft + width} V${offsetTop + sideSize - 10} z`;
   document.querySelector ('.triangle2 > path').setAttribute ('d', path);

   // Draw triangle 3
   path = `M${offsetLeft + width} ${offsetTop + height - sideSize + 10} V${offsetTop + height} H${offsetLeft + width - sideSize + 10} z`;
   document.querySelector ('.triangle3 > path').setAttribute ('d', path);

   // Draw triangle 4
   path = `M${offsetLeft} ${offsetTop + height - sideSize + 10} V${offsetTop + height} H${offsetLeft + sideSize - 10} z`;
   document.querySelector ('.triangle4 > path').setAttribute ('d', path);

   const grid = document.querySelector ('.grid');
   grid.style.left = (offsetLeft + 80) + 'px';
   grid.style.top = (offsetTop + 80) + 'px';

   // Create cells for X and O symbols and append them to gameboard   
   const boardSize = gameBoard.getBoardSize ();
   for (let i = 0; i < boardSize; ++i) {
      for (let j = 0; j < boardSize; ++j) {
         const cell = document.createElement ('div');
         cell.setAttribute ('data-row', i);
         cell.setAttribute ('data-col', j);
         cell.classList.add ('cell');
         cell.addEventListener ('click', clickOnCell);
         grid.appendChild (cell);
      }
   }

   // Move form with game's settings rights to game's board
   const el1 = document.querySelector (`div[data-row="0"][data-col="${boardSize - 1}"]`);
   const rc1 = el1.getBoundingClientRect ();
   const el2 = document.querySelector (`div[data-row="${boardSize - 1}"][data-col="0"]`);
   const rc2 = el2.getBoundingClientRect ();
   const info = document.querySelector ('form');
   const leftPos = rc1.right + 30;
   info.style.left = leftPos + 'px';
   info.style.top = rc1.top + 'px';
   info.style.width = (offsetLeft + width - leftPos - 50) + 'px';
   info.style.height = (rc2.bottom - rc1.top) + 'px';

   document.querySelector ('.play_with_friend').addEventListener ('click', playWithFriend);

   // Set functions for hover effect for player's symbols
   const buttons = document.querySelectorAll ('p button');
   buttons.forEach (btn => {
      btn.addEventListener ('click', switchSymbol);
      btn.addEventListener ('mouseenter', hoverSymbolButton);
      btn.addEventListener ('mouseleave', unhoverSymbolButton);
   });

   // Disable editbox with a name of player2 (player1 initially invited to play with a computer)
   const elSecondPlayer = document.querySelector ('#player2');
   elSecondPlayer.value = 'Computer';
   elSecondPlayer.disabled = true;
   elSecondPlayer.style.color = '#32ADF0';
   elSecondPlayer.style.fontWeight = 'bold';

   // Bind function to start a game with a button
   document.querySelector ('.start').addEventListener ('click', startGame);

   // Bind function to disable highlight of inputboxes with false datas with each inputbox
   document.querySelectorAll ('form input')
           .forEach (elem => elem.addEventListener ('input', inputPlayerName));

   // Hide line through winning positions
   const line = document.querySelector ('.win_line');
   line.style.width = 0;
   line.style.height = 0;
};

// Entry point - initialize necesssary data and await of user's input
initialize ();