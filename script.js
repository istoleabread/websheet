class Grid {
    static ctx; // Since ctx is going to be common for the whole class, made it static
    constructor(canvas) {
        this.canvas = canvas;
        Grid.ctx = this.canvas.getContext("2d");
    }

    init() {
        this.createGrid();
        this.addListeners();
    }

    createGrid() {
        Grid.ctx.beginPath();
        Grid.ctx.font = "13px Ubuntu";
        Grid.ctx.strokeStyle = "#CCC";
        for (let i = 0; i < this.canvas.height / 20; i++) {
            for (let j = 0; j < this.canvas.width / 100; j++) {
                Grid.ctx.save();
                Grid.ctx.translate(j * 100, i * 20);
                Grid.ctx.strokeRect(0, 0, 100, 20);
                Grid.ctx.restore();
            }
        }
    }

    addListeners() {
        this.canvas.addEventListener("click", this.editCanvas);
    }

    editCanvas(ev) {
        const column = Math.ceil((ev.clientX - this.getBoundingClientRect().x) / 100); // gets the column number (1,2,3...)
        const row = Math.ceil((ev.clientY - this.getBoundingClientRect().y) / 20); // gets the row number
        const inputBox = new CellInput(Grid.ctx, column, row);
        inputBox.createInputBox();
    }
}

class CellInput {
    constructor(ctx, column, row) {
        this.ctx = ctx;
        this.column = column;
        this.row = row;
    }

    createInputBox() {
        const inputBox = document.createElement("input");
        const cellLeft = (this.column - 1) * 100; // 100 being the width of one cell
        const cellTop = (this.row - 1) * 20;
        const cellValue = ManageCellData.getCellData(this.column, this.row); // Get cell's value if previously written
        inputBox.className = "cellInput";
        inputBox.style.top = `${cellTop + this.ctx.canvas.getBoundingClientRect().x}px`;
        inputBox.style.left = `${cellLeft + this.ctx.canvas.getBoundingClientRect().y}px`;
        inputBox.style.width = cellValue ? this.getCellSize(cellValue) : "100px";
        inputBox.value = cellValue;
        document.body.appendChild(inputBox);
        inputBox.focus();
        this.addListeners(inputBox);
    }

    addListeners(inputElem) {
        inputElem.addEventListener("input", () => {
            if (this.ctx.measureText(inputElem.value).width >= inputElem.style.width.slice(0, -2)) {
                inputElem.style.width = +inputElem.style.width.slice(0, -2) + 100 + "px";
            } else if (
                // if the text inside input cell takes 100px less space than cell's width, reduce cell's width
                this.ctx.measureText(inputElem.value).width <
                inputElem.style.width.slice(0, -2) - 100
            ) {
                inputElem.style.width = this.getCellSize(inputElem.value);
            }
        });
        inputElem.addEventListener("keyup", (ev) => {
            if (ev.code === "Enter") {
                this.addCellValue(inputElem);
                if ((this.row - 1) * 20 >= this.ctx.canvas.height - 20) {
                    this.row = 1;
                    this.column++;
                    this.createInputBox();
                    return;
                }
                this.row++;
                this.createInputBox();
            }
        });
        inputElem.addEventListener("focusout", () => {
            this.addCellValue(inputElem);
        });
    }

    sliceStringToCellSize(string) {
        for (let i = 0; i < string.length; i++) {
            const len = this.ctx.measureText(string.substring(0, i)).width;
            if (len >= 100) {
                return string.substring(0, i - 1);
            }
        }
        return string;
    }

    getCellSize(string) {
        if (!string) {
            return "100px";
        }
        const actualSize = this.ctx.measureText(string).width;
        const cellSize = Math.ceil(actualSize / 100) * 100;
        return cellSize + "px"; // Make the input box's width fit the text size and a multiple of 100
    }

    addCellValue(inputElem) {
        const cellLeft = (this.column - 1) * 100; // 100 being the width of one cell
        const cellTop = (this.row - 1) * 20;
        this.ctx.beginPath();
        this.ctx.clearRect(cellLeft, cellTop, 100, 20); // Remove previous text in the cell
        this.ctx.strokeRect(cellLeft, cellTop, 100, 20); // clearRect also removed the borders so add new rectangular border
        console.log(this.sliceStringToCellSize(inputElem.value));
        this.ctx.fillText(
            this.sliceStringToCellSize(inputElem.value), // Slice string to 100px (cell's width)
            cellLeft,
            cellTop + 15
        );
        ManageCellData.editData(this.column, this.row, inputElem.value);
        document.body.removeChild(inputElem);
    }
}

class ManageCellData {
    static data = {};

    static editData(column, row, value) {
        ManageCellData.data[column + "" + row] = value;
    }

    static getCellData(column, row) {
        if (ManageCellData.data[column + "" + row]) {
            return ManageCellData.data[column + "" + row];
        }
        return "";
    }
}

const sheet = new Grid(document.querySelector("canvas"));
sheet.init();
