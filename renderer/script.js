window.api.getMusicList().then(songs => {
    const listContainer = document.getElementById('music-list');
    let currentIndex = -1;
    let songsList = songs;


    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    repeatBtn.classList.add("active");
    let isShuffle = false;
    let isRepeat = true;

    const currentTitle = document.getElementById('current-title');
    const currentAutor = document.getElementById('current-title-autor');

    const contentViews = document.getElementsByClassName('music_background')
    const minuteContent = document.getElementById('minute-music');

    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");
    const audio = document.getElementById("audio");

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const numBars = 12;
        const barWidth = (canvas.width / numBars);
        let x = 0;
        const binsPerBar = Math.floor(bufferLength / numBars);

        for (let i = 0; i < numBars; i++) {
            let sum = 0;
            for (let j = 0; j < binsPerBar; j++) {
                sum += dataArray[(i * binsPerBar) + j];
            }
            const avg = sum / binsPerBar;
            const barHeight = avg / 2;
            const y = canvas.height - barHeight;
            const radius = Math.min(barWidth / 2, barHeight / 2);

            ctx.beginPath();
            roundedRect(ctx, x, y, barWidth, barHeight, radius);
            ctx.fillStyle = "#E886AC";
            ctx.fill();

            x += barWidth + 5;
        }
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    function loadSong(index, autoPlay = true) {
        if (index < 0 || index >= songsList.length) return;
        currentIndex = index;
        highlightCurrentSong();

        const song = songsList[currentIndex];
        const parts = song.title.split(" - ");
        if (parts.length >= 2) {
            currentAutor.textContent = parts[0].toLowerCase();
            currentTitle.textContent = parts.slice(1).join(" - ").toLowerCase();
        } else {
            currentAutor.textContent = "desconocido";
            currentTitle.textContent = song.title.toLowerCase();
        }

        // 🔥 Enviar autor + título al tray
        const traySongTitle = `${currentAutor.textContent} - ${currentTitle.textContent}`;
        window.electronAPI.updateCurrentSong(traySongTitle);
        
        // 🔥 Enviar carátula (si existe) al tray
        if (song.cover) {
            window.electronAPI.updateCurrentCover(song.cover);
        } else {
            window.electronAPI.updateCurrentCover(null); // si no hay carátula, volver al ícono por defecto
        }

        audio.src = song.path;

        if (autoPlay) {
            audio.play();
            audioContext.resume();
            togglePlayPause(true);
            draw();
        } else {
            togglePlayPause(false);
        }

        for (const contentView of contentViews) {
            if (song.cover) {
                contentView.style.backgroundImage = `url('${song.cover}')`;
                contentView.style.backgroundSize = '100% 100%';
            } else {
                contentView.style.backgroundImage = 'none';
                contentView.style.backgroundColor = '#181b2c';
            }
        }
    }

    function highlightCurrentSong() {
        const items = listContainer.querySelectorAll('.song-item');
        items.forEach((item, idx) => {
            item.classList.toggle('playing', idx === currentIndex);
            if (idx === currentIndex) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function togglePlayPause(isPlaying) {
        playBtn.style.display = isPlaying ? 'none' : 'inline-block';
        pauseBtn.style.display = isPlaying ? 'inline-block' : 'none';
    }

    function toggleShuffleRepeatButtons() {
        shuffleBtn.style.display = isRepeat ? 'none' : 'inline-block';
        repeatBtn.style.display = isShuffle ? 'none' : 'inline-block';
    }

    toggleShuffleRepeatButtons();

    function formatDuration(seconds) {
        const totalSeconds = Math.floor(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Render listado de canciones
    songsList.forEach((song, index) => {
        const item = document.createElement('div');
        item.classList.add('song-item');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const img = document.createElement('img');
        img.src = song.cover || '';
        img.alt = 'Cover';
        img.width = 60;
        imgContainer.appendChild(img);

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container');

        const parts = song.title.split(" - ");
        const autorText = parts.length >= 2 ? parts[0].trim() : "desconocido";
        const titleText = parts.length >= 2 ? parts.slice(1).join(" - ").trim() : song.title.trim();

        const title = document.createElement('div');
        title.classList.add('song-title');
        title.textContent = titleText.toLowerCase();

        const autor = document.createElement('div');
        autor.classList.add('song-autor');
        autor.textContent = autorText.toLowerCase();

        const duration = document.createElement('div');
        duration.classList.add('song-duration');
        duration.textContent = formatDuration(song.duration);

        infoContainer.appendChild(title);
        infoContainer.appendChild(autor);
        infoContainer.appendChild(duration);

        item.appendChild(imgContainer);
        item.appendChild(infoContainer);

        item.onclick = () => loadSong(index);

        listContainer.appendChild(item);
    });

    if (songsList.length > 0) {
        loadSong(0, false);
    }
    // Ocultar loader con animación
    loader.classList.add('loader-exit');

    // Después de la animación, sacarlo del DOM
    setTimeout(() => {
        loader.style.display = 'none';
    }, 2200); // mismo tiempo que la transición

    // Botones de control
    playBtn.onclick = () => {
        if (currentIndex === -1 && songsList.length > 0) {
            loadSong(0);
        } else {
            audio.play();
            audioContext.resume();
            togglePlayPause(true);
            draw();
        }
    };

    pauseBtn.onclick = () => {
        audio.pause();
        togglePlayPause(false);
    };

    nextBtn.onclick = () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songsList.length);
            loadSong(randomIndex);
        } else if (currentIndex + 1 < songsList.length) {
            loadSong(currentIndex + 1);
        } else if (isRepeat) {
            loadSong(0);
        }
    };

    prevBtn.onclick = () => {
        if (currentIndex - 1 >= 0) {
            loadSong(currentIndex - 1);
        }
    };

    shuffleBtn.onclick = () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle("active", isShuffle);
        if (isShuffle) {
            isRepeat = false;
            repeatBtn.classList.remove("active");
        } else {
            // Si apago shuffle, enciendo repeat
            isRepeat = true;
            repeatBtn.classList.add("active");
        }
        toggleShuffleRepeatButtons();
    };

    repeatBtn.onclick = () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle("active", isRepeat);
        if (isRepeat) {
            isShuffle = false;
            shuffleBtn.classList.remove("active");
        } else {
            // Si apago repeat, enciendo shuffle
            isShuffle = true;
            shuffleBtn.classList.add("active");
        }
        toggleShuffleRepeatButtons();
    };

    audio.addEventListener("ended", () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songsList.length);
            loadSong(randomIndex);
        } else if (currentIndex + 1 < songsList.length) {
            loadSong(currentIndex + 1);
        } else if (isRepeat) {
            loadSong(0);
        } else {
            togglePlayPause(false);
        }
    });

    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
            minuteContent.textContent = `${formatDuration(audio.currentTime)} / ${formatDuration(audio.duration)}`;
        } else {
            minuteContent.textContent = `${formatDuration(audio.currentTime)} / 0:00`;
        }
    });


});

window.electronAPI.onTrayControl((action) => {
    if (action === 'togglePlayPause') {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    } else if (action === 'next') {
        nextBtn.click();
    } else if (action === 'prev') {
        prevBtn.click();
    }
});
