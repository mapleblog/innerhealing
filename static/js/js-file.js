document.addEventListener('DOMContentLoaded', () => {
    const breathCircle = document.querySelector('.breath-circle');
    const circleInner = document.querySelector('.circle-inner');
    const instruction = document.querySelector('.instruction');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const refreshQuoteBtn = document.getElementById('refresh-quote-btn');
    const musicSelector = document.getElementById('music-selector');
    const volumeSlider = document.getElementById('volume-slider');
    const backgroundMusic = document.getElementById('background-music');
    const navItems = document.querySelectorAll('.nav-item');
    const moodOptions = document.querySelectorAll('.mood-option');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const shareBtn = document.querySelector('.share-btn');

    const timerEl = document.querySelector('.timer');
    
    let isBreathing = false;
    let currentPhase = 0;
    let interval;
    let startTime = null;
    let elapsedTime = 0;
    let timerInterval;
    let selectedMood = null;
    
    // 导航菜单激活状态
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 滚动到目标区域
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            window.scrollTo({
                top: targetElement.offsetTop - 60,
                behavior: 'smooth'
            });
        });
    });
    
    // 监听滚动以更新导航菜单激活状态
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionTop + sectionHeight - 100) {
                const id = section.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    });
    
    // 心情选择器
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    // 过滤器按钮
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // 这里可以添加过滤功能的实现
        });
    });
    
    // 分享按钮
    shareBtn.addEventListener('click', function() {
        const textarea = document.querySelector('.share-form textarea');
        const content = textarea.value.trim();
        
        if (!selectedMood) {
            alert('请选择一个心情');
            return;
        }
        
        if (!content) {
            alert('请写点什么...');
            return;
        }
        
        // 保存到本地存储（模拟数据库）
        saveMoodJournal(selectedMood, content);
        
        alert('分享成功！');
        textarea.value = '';
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        selectedMood = null;
    });
    
    // 保存心情日记到本地存储
    function saveMoodJournal(mood, content) {
        // 获取现有日记
        let journals = JSON.parse(localStorage.getItem('moodJournals') || '[]');
        
        // 创建新日记对象
        const newJournal = {
            id: Date.now(), // 使用时间戳作为唯一ID
            userId: 'user_' + Math.floor(Math.random() * 1000), // 模拟用户ID
            username: '用户' + Math.floor(Math.random() * 1000), // 模拟用户名
            mood: mood,
            moodEmoji: getMoodEmoji(mood),
            content: content,
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * 30), // 模拟点赞数
            comments: Math.floor(Math.random() * 10), // 模拟评论数
        };
        
        // 添加到数组顶部
        journals.unshift(newJournal);
        
        // 限制存储数量，防止过多
        if (journals.length > 100) {
            journals = journals.slice(0, 100);
        }
        
        // 保存回本地存储
        localStorage.setItem('moodJournals', JSON.stringify(journals));
    }
    
    // 获取心情对应的表情符号
    function getMoodEmoji(mood) {
        const emojiMap = {
            'happy': '😊',
            'calm': '😌',
            'sad': '😔',
            'angry': '😠',
            'anxious': '😰'
        };
        return emojiMap[mood] || '😐';
    }
    
    // 呼吸配置
    const breathingPhases = [
        { name: '吸气', duration: 4000, color: '#e8f2fa', scale: 1.15, bgColor: 'linear-gradient(135deg, #f0e0ff 0%, #e0e8ff 50%, #d8ecff 100%)', boxShadow: '0 5px 35px rgba(150, 180, 255, 0.4), 0 0 50px rgba(150, 180, 255, 0.3)' },
        { name: '屏息', duration: 4000, color: '#e0eefa', scale: 1.15, bgColor: 'linear-gradient(135deg, #efe4ff 0%, #e4ecff 50%, #dcefff 100%)', boxShadow: '0 5px 35px rgba(150, 180, 255, 0.35), 0 0 50px rgba(150, 180, 255, 0.25)' },
        { name: '呼气', duration: 4000, color: '#d8eafa', scale: 1, bgColor: 'linear-gradient(135deg, #f4ebff 0%, #eaf1ff 50%, #e6f5ff 100%)', boxShadow: '0 5px 25px rgba(150, 180, 255, 0.25), 0 0 40px rgba(150, 180, 255, 0.2)' },
        { name: '屏息', duration: 4000, color: '#e0eefa', scale: 1, bgColor: 'linear-gradient(135deg, #efe4ff 0%, #e4ecff 50%, #dcefff 100%)', boxShadow: '0 5px 25px rgba(150, 180, 255, 0.2), 0 0 40px rgba(150, 180, 255, 0.15)' }
    ];
    
    // 每日一言名言列表
    const quotes = [
        { text: "呼吸是连接身体与心灵的桥梁，深呼吸是走向内心宁静的第一步。", author: "佚名" },
        { text: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "佚名" },
        { text: "内心的平静，源于与自己的和解。", author: "老子" },
        { text: "如果你想要内心的平和，尝试着改变自己而不是他人。", author: "佛陀" },
        { text: "放下是一种智慧，静心是一种境界。", author: "禅语" },
        { text: "静坐常思己过，闲谈莫论人非。", author: "陈寿" },
        { text: "心若简单，世界则简单。", author: "禅语" },
        { text: "时时慎独，心扉自清。", author: "王阳明" },
        { text: "心静自然凉，止念即菩提。", author: "禅语" },
        { text: "无论何时，保持一颗平静的心，是通往幸福的必经之路。", author: "王阳明" },
        { text: "学会和自己相处，是一生的必修课。", author: "佚名" },
        { text: "不必等待特别的一天，每一天都可以变得特别。", author: "佚名" },
        { text: "最好的关系，是懂得彼此的沉默。", author: "禅语" },
        { text: "心中有阳光，脚下自然有力量。", author: "佚名" },
        { text: "慢一点，再慢一点，给心灵一个栖息的空间。", author: "佚名" }
    ];
    
    // 加载每日一言
    function loadDailyQuote() {
        // 获取一个随机名言
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        // 更新显示
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = "—— " + quote.author;
    }
    
    // 刷新名言按钮事件
    refreshQuoteBtn.addEventListener('click', loadDailyQuote);
    
    // 定时器函数
    function updateTimer() {
        if (!startTime) return;
        
        const currentTime = Date.now();
        const totalSeconds = Math.floor((currentTime - startTime + elapsedTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        
        timerEl.textContent = `${minutes}:${seconds}`;
    }
    
    // 开始呼吸引导
    function startBreathing() {
        if (isBreathing) return;
        
        isBreathing = true;
        startBtn.disabled = true;
        
        if (!startTime) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
        }
        
        breathePhase();
    }
    
    // 呼吸阶段
    function breathePhase() {
        if (!isBreathing) return;
        
        const phase = breathingPhases[currentPhase];
        
        // 更新指示和动画
        instruction.textContent = phase.name;
        circleInner.style.backgroundColor = phase.color;
        document.querySelector('.breathing-section').style.background = phase.bgColor;
        
        // 圆圈动画
        breathCircle.style.transform = `scale(${phase.scale})`;
        breathCircle.style.boxShadow = phase.boxShadow;
        circleInner.style.transform = `scale(${phase.scale > 1 ? 0.9 : 1.1})`;
        
        // 添加脉动效果
        if (phase.name === '吸气') {
            breathCircle.style.animation = 'pulse 4s infinite';
        } else {
            breathCircle.style.animation = 'none';
        }
        
        // 设置下一个阶段
        interval = setTimeout(() => {
            currentPhase = (currentPhase + 1) % breathingPhases.length;
            breathePhase();
        }, phase.duration);
    }
    
    // 暂停
    function pauseBreathing() {
        isBreathing = false;
        startBtn.disabled = false;
        clearTimeout(interval);
        
        if (startTime) {
            elapsedTime += Date.now() - startTime;
            startTime = null;
            clearInterval(timerInterval);
        }
    }
    
    // 重置
    function resetBreathing() {
        pauseBreathing();
        currentPhase = 0;
        instruction.textContent = '准备';
        breathCircle.style.transform = 'scale(1)';
        circleInner.style.transform = 'scale(1)';
        circleInner.style.backgroundColor = '#e8f4f8';
        document.querySelector('.breathing-section').style.background = 'linear-gradient(135deg, #f0e6ff 0%, #e6eeff 50%, #e0f0ff 100%)';
        
        elapsedTime = 0;
        timerEl.textContent = '00:00';
    }
    
    // 事件监听
    startBtn.addEventListener('click', startBreathing);
    pauseBtn.addEventListener('click', pauseBreathing);
    resetBtn.addEventListener('click', resetBreathing);
    
    // 背景音乐设置
    const musicUrls = {
        forest: 'audio/forest_music.mp3',
        rain: 'audio/_music.mp3',
        waves: 'audio/waves_music.mp3',
        meditation: 'audio/_music.mp3',
        piano: 'audio/piano_music.mp3'
    };
    
    // 设置初始音乐源
    backgroundMusic.src = musicUrls[musicSelector.value];
    backgroundMusic.volume = volumeSlider.value / 100;
    
    const playMusicBtn = document.getElementById('play-music-btn');
    
    // 播放音乐按钮事件
    playMusicBtn.addEventListener('click', function(e) {
        // 创建波纹效果
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        // 计算波纹位置
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 设置波纹位置和大小
        ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
        ripple.style.left = x - ripple.offsetWidth / 2 + 'px';
        ripple.style.top = y - ripple.offsetHeight / 2 + 'px';
        
        // 播放音乐 (无论当前状态如何)
        backgroundMusic.currentTime = 0; // 从头开始播放
        backgroundMusic.play();
        
        // 创建音符动画
        createMusicNotes(this);
        
        // 移除波纹效果
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
    
    // 创建音符动画
    function createMusicNotes(button) {
        const notes = ['♪', '♫', '♬', '♩'];
        const rect = button.getBoundingClientRect();
        
        // 创建2-4个音符
        const count = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const note = document.createElement('span');
                note.classList.add('music-note');
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                
                // 随机位置和旋转
                const x = Math.random() * 40 - 20;
                const r = Math.random() * 40 - 20;
                note.style.setProperty('--x', x + 'px');
                note.style.setProperty('--r', r + 'deg');
                
                // 设置初始位置
                note.style.left = rect.width / 2 + 'px';
                note.style.top = '0px';
                
                button.appendChild(note);
                
                // 移除音符
                setTimeout(() => {
                    note.remove();
                }, 2000);
            }, i * 150);
        }
    }
    
    // 音乐选择事件
    musicSelector.addEventListener('change', () => {
        const wasPlaying = !backgroundMusic.paused;
        backgroundMusic.src = musicUrls[musicSelector.value];
        // 只有在之前正在播放时才自动继续播放
        if (wasPlaying) {
            backgroundMusic.play();
        }
    });
    
    // 音量控制事件
    volumeSlider.addEventListener('input', () => {
        backgroundMusic.volume = volumeSlider.value / 100;
    });
    
    // 初始化
    resetBreathing();
    
    // 加载初始化的每日一言
    loadDailyQuote();
});