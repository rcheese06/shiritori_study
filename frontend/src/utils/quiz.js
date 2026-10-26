function shuffler(array) { //randomise cards, and options within cards
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function buildOptions(answer) { //create multiple options for MCQ
    // sort pool to same JLPT level
    // mix in 3 random words from pool
    const options = [answer];
    /*while (options.length < 4) {
        const randomWord = pool[Math.floor(Math.random() * pool.length)];
        if (!options.includes(randomWord)) {
            options.push(randomWord);
        }
    }*/
    return shuffler(options);
}