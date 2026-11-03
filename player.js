// player.js
import { albumDatabase } from './db.js';
import { setupAudioContext } from './visualizer.js';

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
        
        // Попытка 1: Прямой запрос
        fetch(targetUrl)
            .then(res => { if (!res.ok) throw new Error(); return res.text(); })
            .then(text => processCue(text, shouldPlay))
            .catch(() => {
                // Попытка 2: Запрос через CORS-прокси
                fetch(`https://allorigins.win{encodeURIComponent(targetUrl)}`)
                    .then(res => res.json())
                    .then(data => processCue(data.contents || '', shouldPlay))
                    .catch(() => {
                        console.warn("Файл .cue недоступен по сети. Включается авторазбивка.");
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
        // Если длительность еще не подгрузилась, вешаем одноразовый слушатель
        const onMetadata = () => {
            generateFallbackTracks(audio.duration, shouldPlay);
            audio.removeEventListener('loadedmetadata', onMetadata);
        };
        audio.addEventListener('loadedmetadata', onMetadata);
    }
}

export function startPlayback() {
    setupAudioContext(audio);
    audio.play().then(() => {
        playIcon.innerText = "⏸";
        playerView.classList.remove('paused');
        updateTrackDisplay();
    }).catch(err => console.log("Старт заблокирован браузером до клика:", err));
}

export function setPausedState() {
    playIcon.innerText = "▶";
    playerView.classList.add('paused');
}

// Автоматическая нарезка аудиофайла на куски по 10 минут
function generateFallbackTracks(totalDuration, shouldPlay) {
    state.tracks = [];
    state.currentTrackIndex = 0;
    const segmentDuration = 5 * 60; // 600 секунд
    let startTime = 0;
    let trackNumber = 1;

    while (startTime < totalDuration) {
        let endTime = startTime + segmentDuration;
        if (endTime > totalDuration) endTime = totalDuration;
        
        state.tracks.push({
            indexStr: trackNumber.toString().padStart(2, '0'),
            title: `Track ${trackNumber} (Auto)`,
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

// Надежный парсер CUE разметки, защищенный от регулярных ошибок
function parseCue(cueText) {
    const lines = cueText.split('\n');
    let currentTrack = null;
    let globalPerformer = 'Unknown Performer'; // На случай, если PERFORMER указан один раз в начале файла
    state.tracks = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Ищем исполнителя (может быть как глобальным, так и внутри TRACK)
        if (trimmed.startsWith('PERFORMER')) {
            const performerMatch = trimmed.match(/"([^"]+)"/);
            if (performerMatch) {
                if (currentTrack) {
                    currentTrack.performer = performerMatch[1];
                } else {
                    globalPerformer = performerMatch[1]; // Запоминаем глобального исполнителя для всего диска
                }
            }
        }
        else if (trimmed.startsWith('TRACK')) {
            // Перед переходом к новому треку, сохраняем предыдущий и собираем его имя
            if (currentTrack) {
                const trackPerformer = currentTrack.performer || globalPerformer;
                currentTrack.title = `${trackPerformer} - ${currentTrack.rawTitle}`;
                state.tracks.push(currentTrack);
            }
            
            const parts = trimmed.split(/\s+/);
            const trackNum = parts[1] || (state.tracks.length + 1).toString().padStart(2, '0');
            
            // Создаем объект трека (храним временное название в rawTitle)
            currentTrack = { 
                indexStr: trackNum, 
                rawTitle: 'Unknown Track', 
                performer: null, 
                startTime: 0, 
                endTime: Infinity 
            };
        } else if (trimmed.startsWith('TITLE') && currentTrack) {
            const titleMatch = trimmed.match(/"([^"]+)"/);
            if (titleMatch) currentTrack.rawTitle = titleMatch[1];
        } else if (trimmed.startsWith('INDEX 01') && currentTrack) {
            const timeMatch = trimmed.match(/(\d+):(\d+):(\d+)/);
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1], 10) || 0;
                const seconds = parseInt(timeMatch[2], 10) || 0;
                currentTrack.startTime = (minutes * 60) + seconds;
            }
        }
    });

    // Не забываем сохранить самый последний трек после выхода из цикла
    if (currentTrack) {
        const trackPerformer = currentTrack.performer || globalPerformer;
        currentTrack.title = `${trackPerformer} - ${currentTrack.rawTitle}`;
        state.tracks.push(currentTrack);
    }
}

    if (currentTrack) state.tracks.push(currentTrack);

    // Точный расчет интервалов окончания каждого трека
    for (let i = 0; i < state.tracks.length; i++) {
        if (i < state.tracks.length - 1) {
            state.tracks[i].endTime = state.tracks[i + 1].startTime;
        } else {
            state.tracks[i].endTime = audio.duration || Infinity;
        }
    }
    renderPlaylist();
}

function renderPlaylist() {
    trackListElement.innerHTML = '';
    state.tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-index', index);
        li.innerHTML = `
            <div class="track-meta">
                <span>${track.indexStr}. ${track.title}</span>
                <span>${formatTime(track.startTime)}</span>
            </div>
            <div class="track-mini-progress"></div>
        `;
        li.addEventListener('click', () => selectTrack(index));
        trackListElement.appendChild(li);
    });
    updateActiveTrackVisual();
}

// Принудительный выбор трека при клике
export function selectTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;
    state.currentTrackIndex = index;
    audio.currentTime = state.tracks[index].startTime;
    
    updateActiveTrackVisual();
    updateTrackDisplay();
    startPlayback();
}

// Обновление стилей подсветки
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

export function updateTrackDisplay() {
    if (state.tracks[state.currentTrackIndex]) {
        const currentTrack = state.tracks[state.currentTrackIndex];
        const text = `${currentTrack.indexStr}. ${currentTrack.title}`;
        
        currentTrackTitleDrive.style.animation = 'none';
        currentTrackTitleDrive.offsetHeight; 
        currentTrackTitleDrive.innerText = text;
        currentTrackTitleDrive.style.animation = 'appleMarquee 14s linear infinite';

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: document.getElementById('release-performer').innerText,
                album: document.getElementById('release-title').innerText,
                artwork: [{ src: albumDatabase[state.activeAlbumIndex].imageUrl, sizes: '512x512', type: 'image/png' }]
            });
        }
    }
}

// Конвертация секунд в MM:SS
export function formatTime(secs) {
    if (isNaN(secs) || secs === Infinity || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Добавьте это в самый конец файла player.js
export function getActiveTracks() {
    return state.tracks;
}

