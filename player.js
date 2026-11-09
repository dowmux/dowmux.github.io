// player.js
import { albumDatabase } from './db.js';

export const audio = document.getElementById('audio-element');
const playerView = document.querySelector('.player-view');
const playIcon = document.getElementById('play-icon');
const currentTrackTitleDrive = document.getElementById('current-track-title');
const trackListElement = document.getElementById('track-list');
const progressBar = document.getElementById('progress-bar');

export let state = {
    tracks: [],
    currentTrackIndex: 0,
    activeAlbumIndex: 0
};

// Передаем свежий массив треков в main.js
export function getActiveTracks() {
    return state.tracks;
}

// Загрузка релиза
export function loadRelease(index, shouldPlay = true) {
    state.activeAlbumIndex = index;
    const album = albumDatabase[index];

    document.querySelectorAll('.release-card').forEach((c, i) => c.classList.toggle('active', i === index));
    
    document.getElementById('release-cover').src = album.imageUrl;
    document.getElementById('bg-blur-image').src = album.imageUrl;
    document.getElementById('release-performer').innerText = album.performer;
    document.getElementById('release-title').innerText = album.albumName;
    
    audio.src = album.musicUrl;
    audio.load();

    state.tracks = [];
    state.currentTrackIndex = 0;
    trackListElement.innerHTML = '<li>Анализ дорожки...</li>';

    if (album.cueUrl && album.cueUrl.trim() !== "") {
        const targetUrl = encodeURI(album.cueUrl);
        
        // Попытка 1: Прямая загрузка .cue
        fetch(targetUrl)
            .then(res => { if (!res.ok) throw new Error(); return res.text(); })
            .then(text => processCue(text, shouldPlay))
            .catch(() => {
                // Попытка 2: Загрузка через CORS-прокси
                fetch(`https://allorigins.win{encodeURIComponent(targetUrl)}`)
                    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
                    .then(data => processCue(data.contents || '', shouldPlay))
                    .catch(() => {
                        console.warn("Файл .cue недоступен по сети. Включается автоматическая нарезка.");
                        fallbackToAutoSplit(shouldPlay);
                    });
            });
    } else {
        fallbackToAutoSplit(shouldPlay);
    }

    if (!shouldPlay) setPausedState();
}

function processCue(cueText, shouldPlay) {
    if (!cueText || cueText.trim() === "") {
        fallbackToAutoSplit(shouldPlay);
        return;
    }
    parseCue(cueText);
    if (shouldPlay) startPlayback();
}

function fallbackToAutoSplit(shouldPlay) {
    if (audio.duration) {
        generateFallbackTracks(audio.duration, shouldPlay);
    } else {
        const onMetadata = () => {
            generateFallbackTracks(audio.duration, shouldPlay);
            audio.removeEventListener('loadedmetadata', onMetadata);
        };
        audio.addEventListener('loadedmetadata', onMetadata);
    }
}

export function startPlayback() {
    audio.play().then(() => {
        playIcon.innerText = "⏸";
        playerView.classList.remove('paused');
        updateTrackDisplay();
    }).catch(err => console.warn("Воспроизведение заблокировано браузером до клика:", err));
}

export function setPausedState() {
    playIcon.innerText = "▶";
    playerView.classList.add('paused');
}

// Автонарезка альбома по 10 минут
function generateFallbackTracks(totalDuration, shouldPlay) {
    state.tracks = [];
    state.currentTrackIndex = 0;
    const segmentDuration = 10 * 60; // 600 секунд
    let startTime = 0;
    let trackNumber = 1;
    const defaultPerformer = document.getElementById('release-performer').innerText || "Unknown Artist";

    while (startTime < totalDuration) {
        let endTime = startTime + segmentDuration;
        if (endTime > totalDuration) endTime = totalDuration;
        
        state.tracks.push({
            indexStr: trackNumber.toString().padStart(2, '0'),
            performer: defaultPerformer,
            title: `Track ${trackNumber} (Auto Split)`,
            startTime: startTime,
            endTime: endTime
        });
        startTime += segmentDuration;
        trackNumber++;
    }
    
    renderPlaylist();
    if (shouldPlay) startPlayback();
    else updateTrackDisplay();
}

// СТАБИЛЬНЫЙ СТРОКОВЫЙ ПАРСЕР .CUE — ПОЛНОСТЬЮ БЕЗ ОШИБОК И БЕЗ REGEX
function parseCue(cueText) {
    const lines = cueText.split('\n');
    let currentTrack = null;
    let albumPerformer = document.getElementById('release-performer').innerText || "Unknown Artist";
    state.tracks = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // 1. Извлекаем главного исполнителя альбома
        if (trimmed.startsWith('PERFORMER') && !currentTrack) {
            albumPerformer = trimmed.replace('PERFORMER', '').replace(/"/g, '').trim();
        } 
        // 2. Находим новую дорожку
        else if (trimmed.startsWith('TRACK')) {
            if (currentTrack) state.tracks.push(currentTrack);
            const parts = trimmed.split(/\s+/);
            const trackNum = parts[1] || (state.tracks.length + 1).toString().padStart(2, '0');
            
            currentTrack = { 
                indexStr: trackNum, 
                performer: albumPerformer, 
                title: 'Unknown Track', 
                startTime: 0, 
                endTime: Infinity 
            };
        } 
        // 3. Индивидуальный исполнитель трека
        else if (trimmed.startsWith('PERFORMER') && currentTrack) {
            currentTrack.performer = trimmed.replace('PERFORMER', '').replace(/"/g, '').trim();
        } 
        // 4. Название трека
        else if (trimmed.startsWith('TITLE') && currentTrack) {
            currentTrack.title = trimmed.replace('TITLE', '').replace(/"/g, '').trim();
        } 
        // 5. Расчет тайминга INDEX 01
        else if (trimmed.startsWith('INDEX 01') && currentTrack) {
            const cleanTime = trimmed.replace('INDEX 01', '').trim(); // Строка вида "MM:SS:FF"
            const timeParts = cleanTime.split(':');
            
            if (timeParts.length >= 2) {
                const minutes = parseInt(timeParts[0], 10) || 0;
                const seconds = parseInt(timeParts[1], 10) || 0;
                currentTrack.startTime = (minutes * 60) + seconds; // ЧИСТОЕ ЧИСЛО СЕКУНД
            }
        }
    });
    if (currentTrack) state.tracks.push(currentTrack);

    // Расчет временных рамок окончания треков
    for (let i = 0; i < state.tracks.length; i++) {
        if (i < state.tracks.length - 1) {
            state.tracks[i].endTime = state.tracks[i + 1].startTime;
        } else {
            // ФИКС ИНФИНИТИ: Если общая длина файла недоступна по сети, искусственно закрываем последний трек (+5 минут)
            if (!audio.duration || audio.duration === Infinity || isNaN(audio.duration)) {
                state.tracks[i].endTime = state.tracks[i].startTime + 300; 
            } else {
                state.tracks[i].endTime = audio.duration;
            }
        }
    }
    renderPlaylist();
}

// Отрисовка треклиста в формате Исполнитель – Название
function renderPlaylist() {
    trackListElement.innerHTML = '';
    state.tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-index', index);
        li.innerHTML = `
            <div class="track-meta">
                <span>${track.indexStr}. ${track.performer} – ${track.title}</span>
                <span>${formatTime(track.startTime)}</span>
            </div>
            <div class="track-mini-progress"></div>
        `;
        li.addEventListener('click', () => selectTrack(index));
        trackListElement.appendChild(li);
    });
    updateActiveTrackVisual();
}

// Принудительный клик по плейлисту
export function selectTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;
    state.currentTrackIndex = index;
    audio.currentTime = state.tracks[index].startTime;
    
    updateActiveTrackVisual();
    updateTrackDisplay();
    startPlayback();
}

// Обновление CSS подсветки
export function updateActiveTrackVisual() {
    const items = trackListElement.querySelectorAll('li');
    const targetLi = trackListElement.querySelector(`li[data-index="${state.currentTrackIndex}"]`);

    items.forEach((item) => {
        item.classList.remove('active');
        const miniBar = item.querySelector('.track-mini-progress');
        if (miniBar && item !== targetLi) miniBar.style.width = '0%';
    });

    if (targetLi) {
        targetLi.classList.add('active');
        targetLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Вывод на дисплей бегущей строки и экрана автомобиля
export function updateTrackDisplay() {
    if (state.tracks[state.currentTrackIndex]) {
        const currentTrack = state.tracks[state.currentTrackIndex];
        const fullTrackName = `${currentTrack.indexStr}. ${currentTrack.performer} – ${currentTrack.title}`;
        
        currentTrackTitleDrive.style.animation = 'none';
        currentTrackTitleDrive.offsetHeight; 
        currentTrackTitleDrive.innerText = fullTrackName;
        currentTrackTitleDrive.style.animation = 'appleMarquee 14s linear infinite';

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.performer,
                album: document.getElementById('release-title').innerText,
                artwork: [{ src: albumDatabase[state.activeAlbumIndex].imageUrl, sizes: '512x512', type: 'image/png' }]
            });
            navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
        }
    }
}

// Форматирование секунд в M:SS без багов
export function formatTime(secs) {
    if (isNaN(secs) || secs === Infinity || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
