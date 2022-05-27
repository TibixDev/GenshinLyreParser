/**
 * Saves a song to localStorage
 * @param {String} title 
 * @param {Array} notes 
 */
function saveSong(title, notes) {
    const song = {
        title,
        notes
    };
    const songs = getSongs();
    songs.push(song);
    localStorage.setItem('songs', JSON.stringify(songs));
}

/**
 * Gets all the songs from localStorage
 * @returns {Array}
 */
function getSongs() {
    const songs = localStorage.getItem('songs');
    if (songs === '' || songs === null || songs === undefined) {
        return [];
    }
    return JSON.parse(localStorage.getItem('songs'));
}

/**
 * Deletes the saved song from localStorage
 * found at a specific index
 * @param {Number} songIndex 
 */
function deleteSong(songIndex) {
    console.log(`[SongStorage] Deleting song at index ${songIndex} (${getSongs()[songIndex].title})`);
    let songs = getSongs();
    songs.splice(songIndex, 1);
    localStorage.setItem('songs', JSON.stringify(songs));
}

export {
    saveSong,
    getSongs,
    deleteSong
}