/* ============================================
   ANIME CSS STUDIO - MAIN APPLICATION
   Three.js + GSAP + Custom Animations
   ============================================ */

// ==========================================
// LOADING SCREEN
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initAllAnimations();
    }, 2500);
});

// ==========================================
// PARTICLE BACKGROUND (Canvas)
// ==========================================
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = ['#ff2d75', '#7b2dff', '#00f0ff', '#00ff88'][Math.floor(Math.random() * 4)];
            this.life = Math.random() * 300 + 100;
            this.maxLife = this.life;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;

            // Mouse interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
                this.opacity = Math.min(this.opacity + 0.02, 0.8);
            }

            if (this.life <= 0 || this.x < -50 || this.x > canvas.width + 50 ||
                this.y < -50 || this.y > canvas.height + 50) {
                this.reset();
            }
        }
        draw() {
            const fadeRatio = this.life / this.maxLife;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity * fadeRatio;
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity * fadeRatio * 0.1;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Draw connections
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = '#00f0ff';
                    ctx.globalAlpha = (1 - dist / 120) * 0.08;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================
// CURSOR TRAIL
// ==========================================
function initCursorTrail() {
    const trail = document.getElementById('cursor-trail');
    let trailDots = [];

    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: ${12 - i * 1.2}px;
            height: ${12 - i * 1.2}px;
            border-radius: 50%;
            background: rgba(0, 240, 255, ${0.3 - i * 0.03});
            pointer-events: none;
            z-index: 9998;
            transition: transform ${0.1 + i * 0.03}s ease;
        `;
        document.body.appendChild(dot);
        trailDots.push(dot);
    }

    document.addEventListener('mousemove', (e) => {
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';

        trailDots.forEach((dot, i) => {
            setTimeout(() => {
                dot.style.left = e.clientX - parseFloat(dot.style.width) / 2 + 'px';
                dot.style.top = e.clientY - parseFloat(dot.style.height) / 2 + 'px';
            }, i * 40);
        });
    });

    // Scale cursor on hover
    document.querySelectorAll('a, button, .product-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            trail.style.transform = 'translate(-50%, -50%) scale(2)';
            trail.style.borderColor = '#ff2d75';
        });
        el.addEventListener('mouseleave', () => {
            trail.style.transform = 'translate(-50%, -50%) scale(1)';
            trail.style.borderColor = '#00f0ff';
        });
    });
}

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll detection
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const top = section.offsetTop - 200;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (window.scrollY >= top && window.scrollY < bottom) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // Mobile menu
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                navLinks.classList.remove('active');
            }
        });
    });
}

// ==========================================
// STAT COUNTER ANIMATION
// ==========================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        el.textContent = target + (target === 100 ? '%' : '+');
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current);
                    }
                }, 30);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ==========================================
// CHARACTER ANIMATION ON SCROLL
// ==========================================
function initCharAnimations() {
    const chars = document.querySelectorAll('.char-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const allChars = entry.target.parentElement.querySelectorAll('.char-animate');
                allChars.forEach((char, i) => {
                    setTimeout(() => {
                        char.classList.add('animate');
                    }, i * 50);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (chars.length > 0) {
        observer.observe(chars[0]);
    }
}

// ==========================================
// THREE.JS - Hero 3D Object
// ==========================================
function initHero3D() {
    const container = document.getElementById('hero-3d');
    if (!container || !window.THREE) return;
    // Skip if container already has iframe content
    if (container.querySelector('iframe')) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(400, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create album-like 3D object
    const group = new THREE.Group();

    // Album body
    const albumGeo = new THREE.BoxGeometry(3, 4, 0.4);
    const albumMat = new THREE.MeshPhongMaterial({
        color: 0x1a0a2a,
        specular: 0xff2d75,
        shininess: 80,
    });
    const album = new THREE.Mesh(albumGeo, albumMat);
    group.add(album);

    // Cover decoration
    const coverGeo = new THREE.PlaneGeometry(2.5, 3.5);
    const coverMat = new THREE.MeshPhongMaterial({
        color: 0x2a1a3a,
        transparent: true,
        opacity: 0.8,
    });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.z = 0.21;
    group.add(cover);

    // Spine
    const spineGeo = new THREE.BoxGeometry(0.15, 4, 0.45);
    const spineMat = new THREE.MeshPhongMaterial({
        color: 0xff2d75,
        emissive: 0xff2d75,
        emissiveIntensity: 0.2,
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.x = -1.575;
    group.add(spine);

    // Glowing edges
    const edgesGeo = new THREE.EdgesGeometry(albumGeo);
    const edgesMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.4,
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edges);

    // Floating particles around album
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    group.add(particlesMesh);

    scene.add(group);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff2d75, 1, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00f0ff, 0.8, 20);
    pointLight2.position.set(-5, -3, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x7b2dff, 0.5, 20);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    camera.position.z = 6;
    camera.position.y = 1;

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.005;
        group.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        group.position.y = Math.sin(Date.now() * 0.002) * 0.2;
        particlesMesh.rotation.y -= 0.002;
        particlesMesh.rotation.x += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

// ==========================================
// THREE.JS - Interactive Gallery Viewer
// ==========================================
function initGalleryViewer() {
    const canvas = document.getElementById('three-canvas');
    const container = document.getElementById('three-viewer');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Create models
    let currentModel = null;
    const models = {};

    function createAlbumModel() {
        const group = new THREE.Group();

        // Main body
        const body = new THREE.BoxGeometry(3.5, 4.5, 0.5);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: 0x2a1040,
            specular: 0xff2d75,
            shininess: 60,
        });
        const bodyMesh = new THREE.Mesh(body, bodyMat);
        group.add(bodyMesh);

        // Pages
        for (let i = 0; i < 8; i++) {
            const pageGeo = new THREE.PlaneGeometry(3.2, 4.2);
            const pageMat = new THREE.MeshPhongMaterial({
                color: 0xf5f0e8,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
            });
            const page = new THREE.Mesh(pageGeo, pageMat);
            page.position.z = -0.2 + i * 0.03;
            group.add(page);
        }

        // Spine
        const spineGeo = new THREE.BoxGeometry(0.2, 4.5, 0.55);
        const spineMat = new THREE.MeshPhongMaterial({
            color: 0xff2d75,
            emissive: 0xff2d75,
            emissiveIntensity: 0.3,
        });
        const spineMesh = new THREE.Mesh(spineGeo, spineMat);
        spineMesh.position.x = -1.85;
        group.add(spineMesh);

        // Edges
        const edgesGeo = new THREE.EdgesGeometry(body);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
        const edgesMesh = new THREE.LineSegments(edgesGeo, edgesMat);
        group.add(edgesMesh);

        return group;
    }

    function createBoxModel() {
        const group = new THREE.Group();

        // Box body
        const boxGeo = new THREE.BoxGeometry(4, 1.5, 4);
        const boxMat = new THREE.MeshPhongMaterial({
            color: 0x1a2a3a,
            specular: 0x00f0ff,
            shininess: 40,
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);

        // Lid
        const lidGeo = new THREE.BoxGeometry(4.1, 0.3, 4.1);
        const lidMat = new THREE.MeshPhongMaterial({
            color: 0x1a2a3a,
            specular: 0x00f0ff,
            shininess: 60,
        });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.9;
        group.add(lid);

        // Ribbon
        const ribbonGeo = new THREE.BoxGeometry(4.2, 0.1, 0.3);
        const ribbonMat = new THREE.MeshPhongMaterial({
            color: 0xff2d75,
            emissive: 0xff2d75,
            emissiveIntensity: 0.3,
        });
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.position.y = 1.1;
        group.add(ribbon);

        const ribbon2 = ribbon.clone();
        ribbon2.rotation.y = Math.PI / 2;
        group.add(ribbon2);

        // Edges
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
        group.add(new THREE.LineSegments(edgesGeo, edgesMat));

        return group;
    }

    function createUSBModel() {
        const group = new THREE.Group();

        // USB body
        const bodyGeo = new THREE.BoxGeometry(1, 0.5, 3);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: 0x3a3a4a,
            specular: 0xffffff,
            shininess: 80,
            metalness: 0.8,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Connector
        const connGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
        const connMat = new THREE.MeshPhongMaterial({
            color: 0xb0b0c0,
            specular: 0xffffff,
            shininess: 100,
        });
        const conn = new THREE.Mesh(connGeo, connMat);
        conn.position.z = 1.9;
        group.add(conn);

        // LED indicator
        const ledGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const ledMat = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 1,
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0.35, 0.26, -1);
        group.add(led);

        // Logo area
        const logoGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const logoMat = new THREE.MeshPhongMaterial({
            color: 0xff2d75,
            emissive: 0xff2d75,
            emissiveIntensity: 0.3,
        });
        const logo = new THREE.Mesh(logoGeo, logoMat);
        logo.position.set(0, 0.26, 0);
        logo.rotation.x = -Math.PI / 2;
        group.add(logo);

        // Edges
        const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
        group.add(new THREE.LineSegments(edgesGeo, edgesMat));

        return group;
    }

    function createUSBBoxModel() {
        const group = new THREE.Group();

        // Box
        const boxGeo = new THREE.BoxGeometry(3, 1.2, 3);
        const boxMat = new THREE.MeshPhongMaterial({
            color: 0x3a2a1a,
            specular: 0x8a6a3a,
            shininess: 30,
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);

        // Lid
        const lidGeo = new THREE.BoxGeometry(3.1, 0.2, 3.1);
        const lidMat = new THREE.MeshPhongMaterial({
            color: 0x4a3a2a,
            specular: 0x8a6a3a,
            shininess: 40,
        });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.7;
        group.add(lid);

        // Cushion indent
        const indentGeo = new THREE.BoxGeometry(1.5, 0.3, 0.8);
        const indentMat = new THREE.MeshPhongMaterial({
            color: 0x1a0a00,
            specular: 0x000000,
        });
        const indent = new THREE.Mesh(indentGeo, indentMat);
        indent.position.y = 0.3;
        group.add(indent);

        // Mini USB inside
        const usbGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
        const usbMat = new THREE.MeshPhongMaterial({
            color: 0x5a5a6a,
            specular: 0xffffff,
            shininess: 80,
        });
        const usb = new THREE.Mesh(usbGeo, usbMat);
        usb.position.y = 0.35;
        group.add(usb);

        // Logo on lid
        const logoGeo = new THREE.CircleGeometry(0.4, 32);
        const logoMat = new THREE.MeshPhongMaterial({
            color: 0xff2d75,
            emissive: 0xff2d75,
            emissiveIntensity: 0.2,
        });
        const logo = new THREE.Mesh(logoGeo, logoMat);
        logo.position.y = 0.81;
        logo.rotation.x = -Math.PI / 2;
        group.add(logo);

        // Edges
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
        group.add(new THREE.LineSegments(edgesGeo, edgesMat));

        return group;
    }

    function createPrintsModel() {
        const group = new THREE.Group();

        // Stack of photos
        for (let i = 0; i < 5; i++) {
            const photoGeo = new THREE.BoxGeometry(3, 2.2, 0.03);
            const photoMat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x888888,
                shininess: 20,
            });
            const photo = new THREE.Mesh(photoGeo, photoMat);
            photo.position.y = i * 0.04;
            photo.rotation.z = (Math.random() - 0.5) * 0.1;
            photo.rotation.y = (Math.random() - 0.5) * 0.05;
            group.add(photo);

            // Photo image area
            const imageGeo = new THREE.PlaneGeometry(2.7, 1.9);
            const colors = [0xddd0f0, 0xd0e0f0, 0xf0d0d0, 0xd0f0d0, 0xf0e0d0];
            const imageMat = new THREE.MeshPhongMaterial({
                color: colors[i],
            });
            const image = new THREE.Mesh(imageGeo, imageMat);
            image.position.y = i * 0.04;
            image.position.z = 0.016;
            image.rotation.z = photo.rotation.z;
            image.rotation.y = photo.rotation.y;
            group.add(image);
        }

        return group;
    }

    // Initialize models
    models['album-3d'] = createAlbumModel();
    models['box-3d'] = createBoxModel();
    models['usb-3d'] = createUSBModel();
    models['usbbox-3d'] = createUSBBoxModel();
    models['prints-3d'] = createPrintsModel();

    // Show first model
    currentModel = models['album-3d'];
    scene.add(currentModel);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xff2d75, 1.2, 30);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x00f0ff, 0.8, 30);
    fillLight.position.set(-5, -2, 5);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0x7b2dff, 0.5, 30);
    backLight.position.set(0, 3, -5);
    scene.add(backLight);

    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    // Mouse rotation
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let rotationX = 0;
    let rotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        targetRotationX = Math.max(-1, Math.min(1, targetRotationX));
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaX = e.touches[0].clientX - previousMouseX;
        const deltaY = e.touches[0].clientY - previousMouseY;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        targetRotationX = Math.max(-1, Math.min(1, targetRotationX));
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Auto-rotation
    let autoRotate = true;

    // Model switching
    const controlBtns = document.querySelectorAll('.control-btn');
    const detailData = {
        'album-3d': {
            title: 'Album Fotografico Premium',
            desc: 'Nuestro album insignia con pasta dura, 30 paginas de papel fotografico premium y acabado en piel sintetica. Cada pagina esta cuidadosamente impresa en alta resolucion.',
            specs: [
                { label: 'Material', value: 'Piel Sintetica' },
                { label: 'Paginas', value: '20-60' },
                { label: 'Tamano', value: '30x30 cm' },
                { label: 'Acabado', value: 'Premium Mate' },
            ]
        },
        'box-3d': {
            title: 'Caja de Fotolibro Premium',
            desc: 'Caja elegante con compartimentos para organizar tus fotos impresas. Incluye separadores tematicos y acabado en textura premium.',
            specs: [
                { label: 'Capacidad', value: '50-100 Fotos' },
                { label: 'Material', value: 'Cartulina Rigida' },
                { label: 'Acabado', value: 'Mate Texturizado' },
                { label: 'Extras', value: 'Divisores' },
            ]
        },
        'usb-3d': {
            title: 'USB Personalizada',
            desc: 'Memoria USB grabada con laser con tu nombre y fecha. Almacena todas tus fotos y videos en alta definicion con transferencia rapida.',
            specs: [
                { label: 'Capacidad', value: '16/32/64 GB' },
                { label: 'Tipo', value: 'USB 3.0' },
                { label: 'Grabado', value: 'Laser' },
                { label: 'Material', value: 'Metal/Madera' },
            ]
        },
        'usbbox-3d': {
            title: 'Caja USB Premium',
            desc: 'Estuche elegante de madera o acrilico con espuma moldeada para presentar tu USB personalizada con maximo estilo.',
            specs: [
                { label: 'Material', value: 'Madera/Acrilico' },
                { label: 'Interior', value: 'Espuma Moldeada' },
                { label: 'Cierre', value: 'Magnetico' },
                { label: 'Grabado', value: 'Tapa Personalizada' },
            ]
        },
        'prints-3d': {
            title: 'Fotos Impresas Clasicas',
            desc: 'Impresiones fotograficas en papel premium de 300 DPI. Disponibles en acabado mate o brillante en multiples tamanos.',
            specs: [
                { label: 'Resolucion', value: '300 DPI' },
                { label: 'Papel', value: 'Premium Photo' },
                { label: 'Acabado', value: 'Mate/Brillo' },
                { label: 'Tamanos', value: '4x6 a 11x14' },
            ]
        }
    };

    // Iframe overlay for album/box real previews
    const iframeUrls = {
        'album-3d': 'https://fotolibro.invitados.org/',
        'box-3d': 'https://caja-fotolibro.invitados.org/',
        'usb-3d': 'https://usb-3d.invitados.org/',
        'usbbox-3d': 'https://caja-usb.invitados.org/',
        'prints-3d': 'https://fotos-impresas.invitados.org/'
    };

    let galleryIframe = document.createElement('iframe');
    galleryIframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:12px;z-index:5;display:none;background:#0a0a0f;';
    container.style.position = 'relative';
    container.appendChild(galleryIframe);

    controlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modelKey = btn.dataset.model;

            controlBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Check if this model has a real iframe preview
            if (iframeUrls[modelKey]) {
                // Hide Three.js canvas, show iframe
                canvas.style.display = 'none';
                if (currentModel) scene.remove(currentModel);
                currentModel = null;
                galleryIframe.src = iframeUrls[modelKey];
                galleryIframe.dataset.url = iframeUrls[modelKey];
                galleryIframe.style.display = 'block';
            } else {
                // Show Three.js canvas, hide iframe
                galleryIframe.style.display = 'none';
                galleryIframe.src = 'about:blank';
                canvas.style.display = 'block';
                if (currentModel) scene.remove(currentModel);
                currentModel = models[modelKey];
                scene.add(currentModel);
            }

            targetRotationX = 0;
            targetRotationY = 0;

            // Update details
            const data = detailData[modelKey];
            document.getElementById('detail-title').textContent = data.title;
            document.getElementById('detail-desc').textContent = data.desc;
            document.getElementById('viewer-label').textContent = data.title;

            const specsContainer = document.getElementById('detail-specs');
            specsContainer.innerHTML = data.specs.map(s => `
                <div class="spec">
                    <span class="spec-label">${s.label}</span>
                    <span class="spec-value">${s.value}</span>
                </div>
            `).join('');
        });
    });

    // Start with album iframe by default
    canvas.style.display = 'none';
    if (currentModel) scene.remove(currentModel);
    currentModel = null;
    galleryIframe.src = iframeUrls['album-3d'];
    galleryIframe.dataset.url = iframeUrls['album-3d'];
    galleryIframe.style.display = 'block';

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging && autoRotate) {
            targetRotationY += 0.003;
        }

        rotationX += (targetRotationX - rotationX) * 0.05;
        rotationY += (targetRotationY - rotationY) * 0.05;

        if (currentModel) {
            currentModel.rotation.x = rotationX;
            currentModel.rotation.y = rotationY;
            currentModel.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        }

        // Update angle display
        const angleX = document.getElementById('angle-x');
        const angleY = document.getElementById('angle-y');
        if (angleX && angleY) {
            angleX.textContent = Math.round((rotationX * 180 / Math.PI) % 360);
            angleY.textContent = Math.round((rotationY * 180 / Math.PI) % 360);
        }

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

// ==========================================
// PRODUCT CARD 3D INTERACTION
// ==========================================
function initProductCards() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const cube = card.querySelector('.product-cube');
        if (!cube) return;

        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;

        card.addEventListener('mouseenter', () => {
            isHovering = true;
        });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
            cube.style.transform = '';
        });

        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            const rect = card.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            cube.style.animation = 'none';
            cube.style.transform = `rotateY(${mouseX * 40}deg) rotateX(${-mouseY * 20}deg)`;
        });
    });

    // View 3D buttons
    document.querySelectorAll('.btn-view-3d').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.dataset.target;
            const modelMap = {
                'album': 'album-3d',
                'photobox': 'box-3d',
                'usb': 'usb-3d',
                'usbbox': 'usbbox-3d',
                'prints': 'prints-3d',
                'package': 'album-3d'
            };

            // Scroll to 3D gallery and activate model
            document.getElementById('gallery-3d').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const controlBtn = document.querySelector(`[data-model="${modelMap[target]}"]`);
                if (controlBtn) controlBtn.click();
            }, 500);
        });
    });
}

// ==========================================
// SCROLL ANIMATIONS WITH GSAP
// ==========================================
function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Product cards stagger entrance
    gsap.utils.toArray('.product-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 80,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
        });
    });

    // Package cards
    gsap.utils.toArray('.package-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            y: 60,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'power2.out',
        });
    });

    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
        });
    });

    // Contact cards
    gsap.utils.toArray('.contact-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            x: -50,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power2.out',
        });
    });

    // Gallery viewer
    gsap.from('.three-js-viewer', {
        scrollTrigger: {
            trigger: '.three-js-viewer',
            start: 'top 80%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
    });
}

// ==========================================
// FORM HANDLING
// ==========================================
function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        btn.innerHTML = '<span class="btn-text">Enviado! &#10003;</span>';
        btn.style.background = 'linear-gradient(135deg, #00ff88, #00f0ff)';

        setTimeout(() => {
            btn.innerHTML = '<span class="btn-text">Enviar Mensaje</span><span class="btn-icon-send">&#10148;</span>';
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

// ==========================================
// SMOOTH SCROLL FOR ANCHORS
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==========================================
// TILT EFFECT ON CARDS
// ==========================================
function initTiltEffect() {
    document.querySelectorAll('.product-card, .package-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * -8;
            const tiltY = (x - 0.5) * 8;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ==========================================
// PARALLAX ON SCROLL
// ==========================================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const shapes = document.querySelectorAll('.floating-shape');
        shapes.forEach((shape, i) => {
            const speed = 0.05 + i * 0.02;
            shape.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

// ==========================================
// INITIALIZE EVERYTHING
// ==========================================
function initAllAnimations() {
    initParticles();
    initCursorTrail();
    initNavigation();
    initCounters();
    initCharAnimations();
    initHero3D();
    initGalleryViewer();
    initProductCards();
    initScrollAnimations();
    initForm();
    initSmoothScroll();
    initTiltEffect();
    initParallax();
}

// Fallback if load event already fired
if (document.readyState === 'complete') {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initAllAnimations();
    }, 2500);
}
