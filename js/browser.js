const minPhoneWidth = 320;
const minTabletWidth = 830;

const width = () => window.innerWidth;
const height = () => window.innerHeight;

const ScreenTypes = {
    DESKTOP: 0, // default
    TABLET: 1,
    PHONE: 2,
};


/**
 * 
 * @param {Function} width 
 * @returns {ScreenTypes}
 */
function getScreenType(width) {
    const w = width();
    if (minPhoneWidth > w) {
        return ScreenTypes.PHONE;
    } else if (minTabletWidth > w) {
        return ScreenTypes.TABLET;
    } else {
        return ScreenTypes.DESKTOP;
    }
}

/**
 * 
 * @returns {ScreenTypes}
 */
function getCurrentScreenType() {
    return getScreenType(width);
}


function chunkArray(array, chunkSize) {
    const res = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearGrid(grid) {
    Array.from(grid.children).forEach(c => c.remove());
    return grid;
}

function recalcChunkIteratorCurrentId(currentChunkId, oldSize, newSize) {
    // console.log(
    //     "MESSAGE FROM recalcId\n",

    //     {
    //         currentChunkId,
    //         oldSize,
    //         newSize,
    //         absoluteCurrentId: currentChunkId * oldSize,
    //         relativeChunkId: Math.floor(currentChunkId * oldSize / newSize)
    //     },

    //     "\nEND MESSAGE FROM recalcId\n"
    // );

    const absoluteCurrentId = currentChunkId * oldSize;
    const relativeChunkId = Math.floor(absoluteCurrentId / newSize);
    return relativeChunkId;
}

function calcMaxShowItems() {
    const screenType = getCurrentScreenType();
    switch (screenType) {
        case ScreenTypes.PHONE:
            return 1;
        case ScreenTypes.TABLET:
            return 4;
        case ScreenTypes.DESKTOP:
            return 6;
        default:
            throw new Error("Uncovered screen type: " + screenType);
    }
}

class ChunkIterator {
    constructor(chunksArray) {
        this.chunks = chunksArray;
        this.currentChunkId = 0;
        this.currentChunk = this.chunks[this.currentChunkId];
    }

    hasNext() {
        return this.currentChunkId + 1 < this.chunks.length;
    }

    next_mut() {
        return this.currentChunk = this.chunks[++this.currentChunkId];
    }

    next() {
        return this.chunks[this.currentChunkId + 1];
    }

    hasBack() {
        return this.currentChunkId - 1 >= 0;
    }

    back_mut() {
        return this.currentChunk = this.chunks[--this.currentChunkId];
    }

    back() {
        return this.chunks[this.currentChunkId - 1];
    }

    get length() {
        return this.chunks.length;
    }

    #reconstruct_mut(newIterator) {
        this.chunks = newIterator.chunks;
        this.currentChunk = newIterator.currentChunk;
        this.currentChunkId = newIterator.currentChunkId;
    }

    resize_mut(newSize) {
        const newIterator = this.resize(newSize);
        this.#reconstruct_mut(newIterator);
    }

    resize(newSize) {
        const iterator = new this.constructor(chunkArray(this.chunks.flat(), newSize));

        // console.log(
        //     `currentId: ${this.currentChunkId}`,
        //     `firstChunkLength: ${this.chunks[0].length}`,
        //     `newSize: ${newSize}`,
        //     `recalcId: ${recalcChunkIteratorCurrentId(this.currentChunkId, this.chunks[0].length, newSize)}`,
        // )

        iterator.currentChunkId = recalcChunkIteratorCurrentId(this.currentChunkId, this.chunks[0].length, newSize);
        iterator.currentChunk = iterator.chunks[iterator.currentChunkId];
        return iterator;
    }
}

// function test(size, chunkSize, lastChunkSize) {
//     const range = (chunkSize) => [...Array(chunkSize).keys()];
//     const chunkArray = range(chunkSize);
//     const res = new Array(size).fill(chunkArray);
//     Boolean(lastChunkSize) ? res.push(range(lastChunkSize)) : res;
//     return res;
// }

class ItemBrowserData {
    constructor(itemBrowserEl) {
        this.itemBrowser = itemBrowserEl;
        this.grid = this.itemBrowser.querySelector('.browser__grid');
        this.items = Array.from(this.grid.children);
        this.running = false;
        this.chunkIterator = new ChunkIterator(chunkArray(this.items, calcMaxShowItems())); // 2)); // calcMaxShowItems()));
        this.nextButton.onclick = this.nextAnimated.bind(this);
        this.prevButton.onclick = this.backAnimated.bind(this);
    }

    init() {
        clearGrid(this.grid);
        this.chunkIterator.currentChunk.forEach(c => this.grid.appendChild(c));

        window.addEventListener('resize', () => this.autoResize());
    }

    async nextAnimated(_, animDurationS = 1) {
        if (this.chunkIterator.hasNext() && !this.running) {
            this.running = true;
            this.grid.style.overflow = "hidden";
            const halfDurationS = animDurationS / 2;

            const currentItems = Array.from(this.grid.children);
            currentItems.forEach(
                i => {
                    i.style.animation = 'none';
                    i.offsetHeight;
                    i.style.animation = `grid-left ${halfDurationS}s ease forwards`;
                }
            );
            await timeout(halfDurationS * 1000);

            currentItems.forEach(
                i => i.remove()
            );

            const nextItems = Array.from(this.chunkIterator.next_mut());
            nextItems.forEach(
                i => {
                    this.grid.appendChild(i);
                    i.style.animation = `grid-right ${halfDurationS}s ease reverse `;
                }
            );

            // scroll to center
            const elementRect = this.prevButton.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            window.scrollTo(0, middle);

            await timeout(halfDurationS * 1000);

            this.grid.style.overflow = "visible";
            this.running = false;
        }
    }

    async backAnimated(_, animDurationS = 1) {
        if (this.chunkIterator.hasBack() && !this.running) {
            this.running = true;
            this.grid.style.overflow = "hidden";
            const halfDurationS = animDurationS / 2;

            const currentItems = Array.from(this.grid.children);
            currentItems.forEach(
                i => {
                    i.style.animation = 'none';
                    i.offsetHeight;
                    i.style.animation = `grid-right ${halfDurationS}s ease forwards`
                }
            );
            await timeout(halfDurationS * 1000);
            currentItems.forEach(
                i => i.remove()
            );

            const nextItems = Array.from(this.chunkIterator.back_mut());
            nextItems.forEach(
                i => {
                    this.grid.appendChild(i);
                    i.style.animation = `grid-left ${halfDurationS}s ease reverse `;
                }
            );

            // scroll to center
            const elementRect = this.prevButton.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            window.scrollTo(0, middle);

            await timeout(halfDurationS * 1000);

            this.grid.style.overflow = "visible";
            this.running = false;

        }
    }

    get prevButton() {
        if (Boolean(this._prevButton)) {
            return this._prevButton;
        }

        return this._prevButton = this.itemBrowser?.querySelector('[type="prev"]');
    }

    get nextButton() {
        if (Boolean(this._nextButton)) {
            return this._nextButton;
        }
        return this._nextButton = this.itemBrowser?.querySelector('[type="next"]');
    }

    autoResize() {
        if (!this.running) {
            this.chunkIterator.resize_mut(calcMaxShowItems());
            clearGrid(this.grid);
            this.chunkIterator.currentChunk.forEach(c => {
                c.style.animation = 'none';
                c.offsetHeight;
                this.grid.appendChild(c);
            });
        }
    }

    toggleButton(button, rule) {
        if (rule()) {
            button.style.visibility = 'visible';
        } else {
            button.style.visibility = "hidden";
        }
    }

    toggleButtons() {
        this.toggleButton(this.prevButton, this.chunkIterator.hasBack.bind(this.chunkIterator));
        this.toggleButton(this.nextButton, this.chunkIterator.hasNext.bind(this.chunkIterator));
    }
}


const itemBrowsers = Array.from(document.querySelectorAll('.browser__container'));

itemBrowsers.map(el => new ItemBrowserData(el))
            .forEach(br => br.init());