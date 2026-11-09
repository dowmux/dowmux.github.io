// main.js
import { albumDatabase } from './db.js';
import { audio, state, loadRelease, selectTrack, startPlayback, setPausedState, updateActiveTrackVisual, updateTrackDisplay, formatTime, getActiveTracks } from './player.js';

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipForwardBtn = document.getElementById('skip-forward-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const releasesGrid = document.getElementById('releases-grid');
const trackListElement = document.getElementById('track-list');
const volumeSlider = document.getElementById('volume-slider');

function init() {
    releasesGrid.innerHTML = '';
    albumDatabase.forEach((album, index) => {
        const card = document.createElement('div');
        card.className = `release-card ${index === 0 ? 'active' : ''}`;
        card.innerHTML = `<img src="${album.imageUrl}" alt="Cover"><div class="release-card-info"><h4>${album.albumName}</h4><p>${album.performer}</p></div>`;
        card.addEventListener('click', () => loadRelease(index));
        releasesGrid.appendChild(card);
    });

    loadRelease(0, false);
    setupEvents();
}

function setupEvents() {
    playBtn.addEventListener('click', () => {
        if (audio.paused) startPlayback();
        else { audio.pause(); setPausedState(); }
    });

    nextBtn.addEventListener('click', () => {
        const currentTracks = getActiveTracks();
        if (currentTracks.length === 0) return;
        if (state.currentTrackIndex < currentTracks.length - 1) selectTrack(state.currentTrackIndex + 1);
        else selectTrack(0);
    });

    prevBtn.addEventListener('click', () => {
        const currentTracks = getActiveTracks();
        if (currentTracks.length === 0) return;
        if (audio.currentTime - currentTracks[state.currentTrackIndex].startTime > 3) {
            audio.currentTime = currentTracks[state.currentTrackIndex].startTime;
        } else if (state.currentTrackIndex > 0) {
            selectTrack(state.currentTrackIndex - 1);
        } else {
            selectTrack(currentTracks.length - 1);
        }
    });

    skipForwardBtn.addEventListener('click', () => {
        const currentTracks = getActiveTracks();
        if (currentTracks.length === 0) return;
        
        // Определяем финальную точку для безопасной перемотки вперед
        let maxDuration = audio.duration;
        if (!maxDuration || maxDuration === Infinity || isNaN(maxDuration)) {
            maxDuration = currentTracks[currentTracks.length - 1].endTime;
        }

        const targetTime = audio.currentTime + 60;
        audio.currentTime = targetTime < maxDuration ? targetTime : maxDuration;
    });

    progressContainer.addEventListener('click', (e) => {
        let duration = audio.duration;
        const currentTracks = getActiveTracks();

        // ФИКС: Если сервер вернул Infinity, берем длительность из конца последнего трека CUE
        if ((!duration || duration === Infinity || isNaN(duration)) && currentTracks.length > 0) {
            duration = currentTracks[currentTracks.length - 1].endTime;
        }

        if (duration && duration > 0) {
            const clickPercent = e.offsetX / progressContainer.clientWidth;
            audio.currentTime = clickPercent * duration;
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
    audio.volume = volumeSlider.value;

    // Браузер получил метаданные аудио — выставляем точный конец альбома для последнего трека
    audio.addEventListener('loadedmetadata', () => {
        const currentTracks = getActiveTracks();
        if (currentTracks.length > 0 && audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            currentTracks[currentTracks.length - 1].endTime = audio.duration;
            console.log("Длительность аудиофайла успешно получена от сервера:", audio.duration);
        }
    });

    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        let duration = audio.duration || 0;
        const currentTracks = getActiveTracks();
        
        if (!currentTracks || currentTracks.length === 0) return;

        // Поиск играющего в данный момент трека
        const actualTrackIndex = currentTracks.findIndex(t => currentTime >= t.startTime && currentTime < t.endTime);
        
        if (actualTrackIndex !== -1 && actualTrackIndex !== state.currentTrackIndex) {
            state.currentTrackIndex = actualTrackIndex;
            updateActiveTrackVisual();
            updateTrackDisplay();
        }

        // ФИКС РАСЧЕТА ДЛИТЕЛЬНОСТИ: Если сервер не отдал длину релиза, подставляем конец CUE разметки
        if (!duration || duration === Infinity || isNaN(duration)) {
            duration = currentTracks[currentTracks.length - 1].endTime;
        }

        // Обновление главного прогресс-бара альбома
        if (duration > 0) {
            progressBar.style.width = `${Math.min((currentTime / duration) * 100, 100)}%`;
        }

        // Заполнение полоски мини-прогресса внутри строки текущего трека
        const currentTrack = currentTracks[state.currentTrackIndex];
        if (currentTrack) {
            const trackDuration = currentTrack.endTime - currentTrack.startTime;
            const trackElapsed = currentTime - currentTrack.startTime;
            if (trackDuration > 0 && trackElapsed >= 0) {
                const activeLi = trackListElement.querySelector(`li[data-index="${state.currentTrackIndex}"]`);
                if (activeLi) {
                    const miniBar = activeLi.querySelector('.track-mini-progress');
                    if (miniBar) {
                        const percent = Math.min((trackElapsed / trackDuration) * 100, 100);
                        miniBar.style.width = `${percent}%`;
                    }
                }
            }
        }

        // Расчет и вывод таймеров времени на экран (Apple Music стиль: справа пишется оставшееся время)
        const timeLeft = duration - currentTime;
        document.getElementById('current-time').innerText = formatTime(currentTime);
        document.getElementById('total-time').innerText = duration > 0 ? `-${formatTime(timeLeft)}` : "-0:00";
    });

    audio.addEventListener('ended', () => {
        if (state.activeAlbumIndex < albumDatabase.length - 1) loadRelease(state.activeAlbumIndex + 1);
        else { setPausedState(); selectTrack(0); audio.pause(); }
    });

    // Интеграция с мультирулем и магнитолой автомобиля (Media Session API)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            const currentTracks = getActiveTracks();
            if (currentTracks.length === 0) return;
            if (audio.currentTime - currentTracks[state.currentTrackIndex].startTime > 3) {
                audio.currentTime = currentTracks[state.currentTrackIndex].startTime;
            } else if (state.currentTrackIndex > 0) {
                selectTrack(state.currentTrackIndex - 1);
            } else {
                selectTrack(currentTracks.length - 1);
            }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const currentTracks = getActiveTracks();
            if (currentTracks.length === 0) return;
            if (state.currentTrackIndex < currentTracks.length - 1) selectTrack(state.currentTrackIndex + 1);
            else selectTrack(0);
        });

        navigator.mediaSession.setActionHandler('play', () => {
            if (audio.paused) startPlayback();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (!audio.paused) { audio.pause(); setPausedState(); }
        });
    }
}

// Запуск фонового сервис-воркера для PWA режима
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

init();
