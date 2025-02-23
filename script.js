// script.js
const IMAGES = [
    './images/qinqin.png',
    './images/thx.png',
    './images/sese.png'
];
const SCRATCH_AREA = {
    x: 212,
    y: 571,
    width: 382,
    height: 141
};
const SCRATCH_RADIUS = 35;

let isDrawing = false;
let totalTimes = 0;
let currentImage = '';
let hasScratched = false;

function getCanvasPosition(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    return {
        x: (clientX - rect.left) * scale,
        y: (clientY - rect.top) * scale
    };
}

async function init() {
    const canvas = document.getElementById('scratch-canvas');
    const img = document.getElementById('prize-img');
    const btn = document.getElementById('action-btn');
    const loading = document.getElementById('loading');

    canvas.width = 794;
    canvas.height = 794;
    img.style.display = 'block';

    try {
        loading.style.display = 'block';
        
        currentImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error(`图片加载失败: ${currentImage}`));
            img.src = currentImage;
        });

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(SCRATCH_AREA.x, SCRATCH_AREA.y, SCRATCH_AREA.width, SCRATCH_AREA.height);

        // 事件绑定
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        btn.addEventListener('click', handleButtonClick);

    } catch (error) {
        alert(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const pos = getCanvasPosition(canvas, clientX, clientY);

    if (pos.x < SCRATCH_AREA.x || 
        pos.x > SCRATCH_AREA.x + SCRATCH_AREA.width ||
        pos.y < SCRATCH_AREA.y ||
        pos.y > SCRATCH_AREA.y + SCRATCH_AREA.height) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(SCRATCH_AREA.x, SCRATCH_AREA.y, SCRATCH_AREA.width, SCRATCH_AREA.height);
    ctx.clip();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!hasScratched) {
        hasScratched = true;
        updateButtonState();
    }
}

function stopDrawing() {
    isDrawing = false;
}

function updateButtonState() {
    const btn = document.getElementById('action-btn');
    btn.disabled = false;
    btn.classList.add('active');
    
    if (currentImage.includes('sese.png')) {
        btn.textContent = '点击结账';
    } else {
        btn.textContent = '再刮一次';
    }
}

async function handleButtonClick() {
    if (this.textContent === '再刮一次') {
        totalTimes++;
        await resetScratch();
    } else if (this.textContent === '点击结账') {
        showResult();
    }
}

async function resetScratch() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const btn = document.getElementById('action-btn');
    const img = document.getElementById('prize-img');

    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(SCRATCH_AREA.x, SCRATCH_AREA.y, SCRATCH_AREA.width, SCRATCH_AREA.height);

    currentImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    
    await new Promise((resolve, reject) => {
        img.onload = () => {
            img.onload = null;
            resolve();
        };
        img.onerror = () => {
            reject(new Error(`图片加载失败: ${currentImage}`));
        };
        img.src = currentImage;
    }).catch(error => alert(error.message));

    hasScratched = false;
    btn.disabled = true;
    btn.classList.remove('active');
    btn.textContent = '五元一次';
}

function showResult() {
    const total = totalTimes * 5;
    document.getElementById('result').innerHTML = `！！！共计消费${total+5}元！！！`;
    document.getElementById('action-btn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', init);
