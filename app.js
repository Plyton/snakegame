'use strict'
class Settings {
    constructor(param) {
        this.rowCount = 21;
        this.colCount = 21;
        this.winlength = 5;
        this.speed = 2;
        this._init(param);
    }

    _init(param) {
        let defaultParams = { rowCount: 21, colCount: 21, winlength: 5, speed: 5, };
        Object.assign(defaultParams, param);

        if (defaultParams.rowCount > 30 || defaultParams.rowCount < 10) {
            throw new Error('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
        }
        this.rowCount = defaultParams.rowCount;

        if (defaultParams.colCount > 30 || defaultParams.colCount < 10) {
            throw new Error('Неверные настройки, значение colCount должно быть в диапазоне [10, 30].');
        }

        this.colCount = defaultParams.colCount;

        if (defaultParams.winlength > 30 || defaultParams.winlength < 2) {
            throw new Error('Неверные настройки, значение winlength должно быть в диапазоне [2, 32].');
        }

        this.winlength = defaultParams.winlength;

        if (defaultParams.speed > 10 || defaultParams.speed < 1) {
            throw new Error('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
        }

        this.speed = defaultParams.speed;

    }
}

class Status {
    constructor() {
        this.status = 'paused';
    }
    setPlaying() {
        this.status = 'playing';
    }
    setPaused() {
        this.status = 'paused';
    }
    isPlaying() {
        return this.status === 'playing';
    }
    isPaused() {
        return this.status === 'paused';
    }
}

class Snake {
    constructor(settings) {
        this.settings = settings;
        this.possibleDirection = ['down', 'up', 'left', 'right'];
        this.bodySnake = [
            {
                x: 1,
                y: 2,
            },
            {
                x: 1,
                y: 1,
            },
        ];
        this.direction = 'down';

    }

    performStep() {
        let currentHeadCoords = this.bodySnake[0];
        let newHeadCoords = {
            x: currentHeadCoords.x,
            y: currentHeadCoords.y,
        }
        switch (this.direction) {
            case 'down':
                newHeadCoords.y++;
                break;
            case 'up':
                newHeadCoords.y--;
                break;
            case 'left':
                newHeadCoords.x--;
                break;
            case 'right':
                newHeadCoords.x++;
                break;
        }
        this.isNextStepWall(newHeadCoords);
        this.bodySnake.unshift(newHeadCoords);
        this.bodySnake.pop();
    }

    isNextStepWall(newHeadCoords) {
        newHeadCoords.x = newHeadCoords.x > this.settings.colCount ? newHeadCoords.x = 1 : newHeadCoords.x < 1 ? newHeadCoords.x = this.settings.colCount : newHeadCoords.x;
        newHeadCoords.y = newHeadCoords.y > this.settings.rowCount ? newHeadCoords.y = 1 : newHeadCoords.y < 1 ? newHeadCoords.y = this.settings.rowCount : newHeadCoords.y;
    }

    increaseBody() {
        let bodyLastCell = this.bodySnake[0];
        let newBodyLastCell = {
            x: bodyLastCell.x,
            y: bodyLastCell.y,

        }
        this.bodySnake.push(newBodyLastCell);
    }

    changeDirection(newDirection) {
        if (!this.possibleDirection.includes(newDirection)) {
            throw new Error(`Передано неверное направление, вы передали: ${newDirection}`);
        }
        if (this.isPassedOppositeDirection(newDirection)) {
            return;
        }
        this.direction = newDirection;
    }

    isPassedOppositeDirection(newDirection) {
        if (this.direction == 'down' && newDirection == 'up') {
            return true;
        }
        if (this.direction == 'up' && newDirection == 'down') {
            return true;
        }
        if (this.direction == 'left' && newDirection == 'right') {
            return true;
        }
        if (this.direction == 'right' && newDirection == 'left') {
            return true;
        }
        return false;
    }
}

class Board {
    constructor(settings, snake) {
        this.boardEl = document.getElementById('game');
        this.parametersEl = document.getElementById('parameters');
        this.settings = settings;
        this.snake = snake;
        this._init();

    }
    _init() {
        this.renderBoard();
        this.renderChooseWindow();

    }
    renderBoard() {
        for (let i = 0; i < this.settings.rowCount; i++) {
            let tr = document.createElement('tr');
            this.boardEl.appendChild(tr);
            for (let i = 0; i < this.settings.colCount; i++) {
                let td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        return this.boardEl;
    }

    renderChooseWindow() {
        let ChooseWindowEl = `<h3 class="parameters__title">Добро пожаловать в игру Змейка!</h3>
        <div class="parameters__wrp1">
        <h4 class="parameters__header">Выберите скорость игры:</h4>
    <p class="parameters__speed"><input type="radio" class="input-speed" id="speedSlow" name="speed" value="3">
        <label for="speedSlow"> Медленная</label></p>
    <p class="parameters__speed"><input type="radio" class="input-speed" id="speedMiddle" name="speed" value="5">
        <label for="speedMiddle">Средняя</label></p>
    <p class="parameters__speed"><input type="radio" class="input-speed" id="speedFast" name="speed" value="8">
        <label for="speedFast">Быстрая</label></p>
    </div>
    <div class="parameters__wrp2">
        <h4 class="parameters__header">Выберите длинну змейки:</h4>
    <p class="parameters__winLength"><input type="radio" class="input-winLength" id="short" name="winLength" value="12">
        <label for="short"> 10</label></p>
    <p class="parameters__winLength"><input type="radio" class="input-winLength" id="middle" name="winLength" value="22">
        <label for="middle">20</label></p>
    <p class="parameters__winLength"><input type="radio" class="input-winLength" id="long" name="winLength" value="32">
        <label for="long">30</label></p>
    </div>`
        this.parametersEl.insertAdjacentHTML('afterbegin', ChooseWindowEl);
    }



    clearParametersWindowChoose() {
        this.parametersEl.remove();
    }

    renderSnake() {
        const snakeBodyElem = this.getSnakeBodyCoords(this.snake.bodySnake);
        if (snakeBodyElem) {
            snakeBodyElem.forEach(td => {
                td.classList.add('snakeBody');
            })
        }

    }

    renderFood(coords) {
        const foodEl = this.getCellEl(coords.x, coords.y);
        foodEl.classList.add('food');

    }

    renderBomb(coords) {
        let bodyElems = this.getBomsCoords(coords.bomb);
        bodyElems.forEach(td => {
            td.classList.add('bomb');
        })
    }

    clearboard() {
        let tdElems = document.querySelectorAll('td');
        tdElems.forEach(tdEl => {
            tdEl.className = '';
        })
    }

    getBomsCoords(bombCoords) {
        if (bombCoords.length > 0) {
            let coordsElems = [];
            for (let elem of bombCoords) {
                let tdEl = this.getCellEl(elem.x, elem.y);
                coordsElems.push(tdEl);
            }

            return coordsElems;
        }
    }

    getSnakeBodyCoords(boodyCoords) {
        if (boodyCoords.length > 0) {
            let bodyElem = [];
            for (let td of boodyCoords) {
                let tdEl = this.getCellEl(td.x, td.y);
                bodyElem.push(tdEl);
            }

            return bodyElem;
        }
    }

    getCellEl(x, y) {
        return this.boardEl.querySelector(`tr:nth-child(${y}) td:nth-child(${x})`);
    }

    isNextStepBody(nextCellCoords) {
        let nextCell = this.getCellEl(nextCellCoords.x, nextCellCoords.y);
        return nextCell.classList.contains('snakeBody');
        // let snakeCells = [];
        // this.boardEl.querySelectorAll('.snakeBody').forEach(tdEl => {
        //     snakeCells.push(tdEl);
        // })
        // return snakeCells.includes(nextCell) && snakeCells.indexOf(nextCell) !== snakeCells.length - 1;
    }

    isNextStepBomb(nextCellCoords) {
        let nextCell = this.getCellEl(nextCellCoords.x, nextCellCoords.y);
        return nextCell.classList.contains('bomb');
    }

    isHeadOnFood() {
        return this.boardEl.querySelector('.food').classList.contains('snakeBody');
    }

}

class Food {
    constructor(settings, snake, board) {
        this.x = null;
        this.y = null;
        this.settings = settings;
        this.snake = snake;
        this.board = board;

    }

    setNewFood() {
        const food = this.generateRandomCoordinates();
        this.board.renderFood(food);
    }

    setFood() {
        this.board.renderFood(this);
    }

    generateRandomCoordinates() {
        while (true) {
            this.x = Math.floor(Math.random() * this.settings.colCount) + 1;
            this.y = Math.floor(Math.random() * this.settings.rowCount) + 1;
            let cell = this.board.getCellEl(this.x, this.y)
            if (cell.classList.contains('snakeBody') || cell.classList.contains('bomb')) {
                continue;
            }
            return this;
        }
    }
}

class Bomb {
    constructor(settings, snake, board) {
        this.bomb = [];
        this.settings = settings;
        this.snake = snake;
        this.board = board;
    }

    setNewBomb() {
        const bomb = this.generateRandomCoordinates();
        this.board.renderBomb(bomb);
    }

    setBomb() {
        this.board.renderBomb(this);
    }

    generateRandomCoordinates() {
        while (true) {
            let bombCcoords = {
                x: Math.floor(Math.random() * this.settings.colCount) + 1,
                y: Math.floor(Math.random() * this.settings.rowCount) + 1,
            }

            let cell = this.board.getCellEl(bombCcoords.x, bombCcoords.y)
            if (cell.classList.contains('snakeBody') || cell.classList.contains('food') || cell.classList.contains('bomb')) {
                continue;
            }

            this.bomb.push(bombCcoords);
            return this;
        }
    }
}

class Menu {
    constructor() {
        this.startBtnEl = document.getElementById('startBtn');
        this.pauseBtnEl = document.getElementById('pauseBtn');
    }

    addButtonClickListener(addButtonHandlerStart, addButtonHandlerpause) {
        this.startBtnEl.addEventListener('click', addButtonHandlerStart);
        this.pauseBtnEl.addEventListener('click', addButtonHandlerpause);
    }
}

class Game {
    constructor(settings, board, status, snake, food, menu, bomb) {
        this.settings = settings;
        this.snake = snake;
        this.board = board;
        this.status = status;
        this.food = food;
        this.bomb = bomb;
        this.menu = menu;
        this.totalScore = 0;
        this.tickIdentifier = null;
        this.messageEl = document.getElementById('message');
        this.scoreEl = document.getElementById('score');
        this.inputSpeed = document.querySelectorAll('.input-speed');
        this.inputWinLength = document.querySelectorAll('.input-winLength');
        this._init();
    }
    _init() {
        this.gameParametersChoose();
        this.menu.addButtonClickListener(() => this.start(), () => this.pause());
        document.addEventListener('keydown', (event) => this.pressKeyHandler(event));
    }

    gameParametersChoose() {
        this.speedChose();
        this.winLengthChoose();
    }

    speedChose() {
        this.inputSpeed = document.querySelectorAll('.input-speed');
        this.inputSpeed.forEach(inputEl => {
            inputEl.addEventListener('change', (event) => {
                this.settings.speed = Number(event.target.value);
                if (event.target.checked) {
                    document.querySelector('.parameters__wrp2').classList.add('parameters--z-index');
                }
            })
        })
    }

    winLengthChoose() {
        this.inputWinLength = document.querySelectorAll('.input-winLength');
        this.inputWinLength.forEach(inputEl => {
            inputEl.addEventListener('change', (event) => {
                this.settings.winlength = Number(event.target.value);
                if (event.target.checked) {
                    this.board.renderSnake();
                    this.food.setNewFood();
                    this.bomb.setNewBomb();
                    this.board.clearParametersWindowChoose();
                }
            })
        })
    }

    start() {
        if (this.status.isPaused()) {
            this.status.setPlaying();
            this.tickIdentifier = setInterval(this.doTick.bind(this), 1000 / this.settings.speed);


        }

    }

    pause() {
        if (this.status.isPlaying()) {
            this.status.setPaused();
            clearInterval(this.tickIdentifier);
            clearInterval(this.stopBombIdentifier);
        }
    }

    pressKeyHandler(event) {
        switch (event.key) {
            case 'ArrowDown':
                this.snake.changeDirection('down');
                break;
            case 'ArrowUp':
                this.snake.changeDirection('up');
                break;
            case 'ArrowLeft':
                this.snake.changeDirection('left');
                break;
            case 'ArrowRight':
                this.snake.changeDirection('right');
                break;
        }
    }

    doTick() {
        this.snake.performStep();
        if (this.isGameLost()) {
            return;
        }
        if (this.isGameWin()) {
            return;
        }
        if (this.board.isHeadOnFood()) {
            this.snake.increaseBody();
            this.setScore();
            this.food.setNewFood();
            this.bomb.setNewBomb();
        }
        this.board.clearboard();
        this.food.setFood();
        this.bomb.setBomb();
        this.board.renderSnake();
    }

    setMessage(text) {
        this.messageEl.innerText = text;
    }

    setScore() {
        this.totalScore++
        this.scoreEl.innerText = `Счёт игры: ${this.totalScore}`;
    }

    isGameLost() {
        if (this.board.isNextStepBody(this.snake.bodySnake[0]) || this.board.isNextStepBomb(this.snake.bodySnake[0])) {
            clearInterval(this.tickIdentifier);
            this.setMessage('Вы проиграли');
            return true;
        }
        return false;
    }

    isGameWin() {
        if (this.snake.bodySnake.length === this.settings.winlength) {
            clearInterval(this.tickIdentifier);
            this.setMessage('Вы выиграли');
            return true;
        }
        return false;
    }

}

window.addEventListener('load', () => {
    const settings = new Settings({ rowCount: 16, winlength: 15, speed: 2 });
    const status = new Status();
    const snake = new Snake(settings);
    const board = new Board(settings, snake);
    const food = new Food(settings, snake, board);
    const bomb = new Bomb(settings, snake, board);
    const menu = new Menu();
    const game = new Game(settings, board, status, snake, food, menu, bomb);
})
