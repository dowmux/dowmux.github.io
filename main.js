// main.js
import { albumDatabase } from './db.js';
import { audio, state, loadRelease, selectTrack, startPlayback, setPausedState, updateActiveTrackVisual, updateTrackDisplay, formatTime, getActiveTracks } from './player.js';
import { setupAudioContext } from './visualizer.js';

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipForwardBtn = document.getElementById('skip-forward-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const releasesGrid = document.getElementById('releases-grid');
const trackListElement = document.getElementById('track-list');

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
        setupAudioContext(audio);
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
        if (!audio.duration) return;
        const targetTime = audio.currentTime + 60;
        audio.currentTime = targetTime < audio.duration ? targetTime : audio.duration;
    });

    progressContainer.addEventListener('click', (e) => {
        const duration = audio.duration;
        if (duration) audio.currentTime = (e.offsetX / progressContainer.clientWidth) * duration;
    });

    audio.addEventListener('loadedmetadata', () => {
        const currentTracks = getActiveTracks();
        if (currentTracks.length > 0) currentTracks[currentTracks.length - 1].endTime = audio.duration;
    });

    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration || 0;
        const currentTracks = getActiveTracks(); // Получаем СВЕЖИЙ массив треков
        
        if (!currentTracks || currentTracks.length === 0) return;

        // Поиск активного трека по текущей секунде
        const actualTrackIndex = currentTracks.findIndex(t => currentTime >= t.startTime && currentTime < t.endTime);
        
        if (actualTrackIndex !== -1 && actualTrackIndex !== state.currentTrackIndex) {
            state.currentTrackIndex = actualTrackIndex;
            updateActiveTrackVisual();
            updateTrackDisplay();
        }

        if (duration > 0) progressBar.style.width = `${(currentTime / duration) * 100}%`;

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

        document.getElementById('current-time').innerText = formatTime(currentTime);
        document.getElementById('total-time').innerText = duration > 0 ? `-${formatTime(duration - currentTime)}` : "-0:00";
    });

    audio.addEventListener('ended', () => {
        if (state.activeAlbumIndex < albumDatabase.length - 1) loadRelease(state.activeAlbumIndex + 1);
        else { setPausedState(); selectTrack(0); audio.pause(); }
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextBtn.click());
        navigator.mediaSession.setActionHandler('play', () => playBtn.click());
        navigator.mediaSession.setActionHandler('pause', () => playBtn.click());
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

init();
