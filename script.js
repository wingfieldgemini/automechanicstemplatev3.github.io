/* ============================================
   APEX AUTO — Premium 3D Script
   ============================================ */

(function () {
    'use strict';

    // ======== MOUSE TRACKING ========
    const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ======== CUSTOM CURSOR ========
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (cursor && follower) {
        let cx = 0, cy = 0, fx = 0, fy = 0;
        function animateCursor() {
            cx += (mouse.x - cx) * 0.2;
            cy += (mouse.y - cy) * 0.2;
            fx += (mouse.x - fx) * 0.08;
            fy += (mouse.y - fy) * 0.08;
            cursor.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
            follower.style.transform = `translate(${fx - 18}px, ${fy - 18}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.querySelectorAll('a, button, .service-card, .gallery-card, .why-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                follower.style.width = '56px';
                follower.style.height = '56px';
                follower.style.borderColor = 'rgba(230,57,70,.8)';
            });
            el.addEventListener('mouseleave', () => {
                follower.style.width = '36px';
                follower.style.height = '36px';
                follower.style.borderColor = 'rgba(230,57,70,.5)';
            });
        });
    }

    // ======== LOADER ========
    const loader = document.getElementById('loader');
    const rpmFill = document.querySelector('.rpm-fill');
    const rpmText = document.querySelector('.rpm-text');

    if (loader && rpmFill && rpmText) {
        let rpmVal = 0;
        const rpmInterval = setInterval(() => {
            rpmVal += 120;
            if (rpmVal > 8000) rpmVal = 8000;
            const pct = rpmVal / 8000;
            rpmFill.style.strokeDashoffset = 565 - (565 * pct);
            rpmText.textContent = Math.round(rpmVal / 1000);
        }, 40);

        window.addEventListener('load', () => {
            setTimeout(() => {
                clearInterval(rpmInterval);
                rpmVal = 8000;
                rpmFill.style.strokeDashoffset = '0';
                rpmText.textContent = '8';
                setTimeout(() => loader.classList.add('hidden'), 400);
            }, 1800);
        });
    }

    // ======== NAVIGATION ========
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // ======== SCROLL REVEALS ========
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ======== COUNTER ANIMATION ========
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const duration = 2000;
                const start = performance.now();
                function updateCounter(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(target * eased).toLocaleString();
                    if (progress < 1) requestAnimationFrame(updateCounter);
                }
                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));

    // ======== THREE.JS — HERO 3D SCENE ========
    function initHeroScene() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // — Procedural low-poly car —
        const carGroup = new THREE.Group();

        // Car body
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(-2, 0);
        bodyShape.lineTo(-2, 0.5);
        bodyShape.lineTo(-1.5, 0.5);
        bodyShape.lineTo(-1.1, 1.1);
        bodyShape.lineTo(0.5, 1.1);
        bodyShape.lineTo(1.0, 0.7);
        bodyShape.lineTo(2, 0.6);
        bodyShape.lineTo(2, 0.3);
        bodyShape.lineTo(2, 0);
        bodyShape.lineTo(-2, 0);

        const extrudeSettings = { depth: 1.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 };
        const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        bodyGeom.center();
        const bodyMat = new THREE.MeshPhongMaterial({
            color: 0xE63946,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        carGroup.add(bodyMesh);

        // Solid subtle body
        const bodySolid = new THREE.Mesh(bodyGeom, new THREE.MeshPhongMaterial({
            color: 0xE63946,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        }));
        carGroup.add(bodySolid);

        // Wheels
        const wheelGeom = new THREE.TorusGeometry(0.25, 0.08, 8, 16);
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 0.4 });
        const wheelPositions = [
            [-1.2, -0.35, 0.7], [-1.2, -0.35, -0.7],
            [1.2, -0.35, 0.7], [1.2, -0.35, -0.7]
        ];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.position.set(...pos);
            wheel.rotation.y = Math.PI / 2;
            carGroup.add(wheel);
        });

        carGroup.position.set(1.5, -0.2, 0);
        carGroup.rotation.y = -0.3;
        scene.add(carGroup);

        // — Floating gear objects —
        const gearGroup = new THREE.Group();
        function createGear(radius, inner, teeth) {
            const shape = new THREE.Shape();
            const toothH = 0.15;
            for (let i = 0; i < teeth; i++) {
                const a1 = (i / teeth) * Math.PI * 2;
                const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
                const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
                const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
                const r1 = radius;
                const r2 = radius + toothH;
                if (i === 0) shape.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
                else shape.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
                shape.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
                shape.lineTo(Math.cos(a3) * r2, Math.sin(a3) * r2);
                shape.lineTo(Math.cos(a4) * r1, Math.sin(a4) * r1);
            }
            const hole = new THREE.Path();
            for (let i = 0; i <= 32; i++) {
                const a = (i / 32) * Math.PI * 2;
                if (i === 0) hole.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
                else hole.lineTo(Math.cos(a) * inner, Math.sin(a) * inner);
            }
            shape.holes.push(hole);
            const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
            return geom;
        }

        const gearMat = new THREE.MeshPhongMaterial({ color: 0xE63946, wireframe: true, transparent: true, opacity: 0.2 });

        const gear1 = new THREE.Mesh(createGear(0.5, 0.2, 12), gearMat);
        gear1.position.set(-3, 1.5, -2);
        gearGroup.add(gear1);

        const gear2 = new THREE.Mesh(createGear(0.35, 0.12, 8), gearMat.clone());
        gear2.material.color.setHex(0xFFFFFF);
        gear2.material.opacity = 0.12;
        gear2.position.set(3.5, -1, -1);
        gearGroup.add(gear2);

        const gear3 = new THREE.Mesh(createGear(0.4, 0.15, 10), gearMat.clone());
        gear3.material.opacity = 0.15;
        gear3.position.set(-2.5, -1.5, -3);
        gearGroup.add(gear3);

        scene.add(gearGroup);

        // — Particle field —
        const particleCount = 600;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
        }
        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0xE63946, size: 0.02, transparent: true, opacity: 0.5 });
        const particles = new THREE.Points(particleGeom, particleMat);
        scene.add(particles);

        // — Grid floor —
        const gridHelper = new THREE.GridHelper(30, 40, 0x222222, 0x1a1a1a);
        gridHelper.position.y = -2;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        scene.add(gridHelper);

        // — Lighting —
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xE63946, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        const dirLight2 = new THREE.DirectionalLight(0x4488ff, 0.3);
        dirLight2.position.set(-5, 3, -5);
        scene.add(dirLight2);

        // — Animation —
        let scrollY = 0;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; });

        function animate() {
            requestAnimationFrame(animate);

            const t = performance.now() * 0.001;

            // Car rotation + mouse response
            carGroup.rotation.y = -0.3 + Math.sin(t * 0.3) * 0.15 + mouse.nx * 0.2;
            carGroup.rotation.x = mouse.ny * 0.1;
            carGroup.position.y = -0.2 + Math.sin(t * 0.5) * 0.08;

            // Gears
            gear1.rotation.z = t * 0.3;
            gear2.rotation.z = -t * 0.4;
            gear3.rotation.z = t * 0.25;
            gearGroup.children.forEach((g, i) => {
                g.position.y += Math.sin(t + i * 2) * 0.001;
            });

            // Particles respond to scroll
            particles.rotation.y = t * 0.02 + scrollY * 0.0002;
            particles.rotation.x = scrollY * 0.0001;

            // Grid parallax
            gridHelper.position.z = -scrollY * 0.002;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ======== THREE.JS — STATS PARTICLE BG ========
    function initStatsScene() {
        const canvas = document.getElementById('statsCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const section = canvas.parentElement;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, section.offsetWidth / section.offsetHeight, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(section.offsetWidth, section.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Grid of dots
        const gridSize = 20;
        const spacing = 0.6;
        const dotsGeom = new THREE.BufferGeometry();
        const dPos = [];
        for (let x = -gridSize / 2; x < gridSize / 2; x++) {
            for (let y = -gridSize / 2; y < gridSize / 2; y++) {
                dPos.push(x * spacing, y * spacing, 0);
            }
        }
        dotsGeom.setAttribute('position', new THREE.Float32BufferAttribute(dPos, 3));
        const dotsMat = new THREE.PointsMaterial({ color: 0xE63946, size: 0.04, transparent: true, opacity: 0.4 });
        const dots = new THREE.Points(dotsGeom, dotsMat);
        scene.add(dots);

        function animate() {
            requestAnimationFrame(animate);
            const t = performance.now() * 0.001;
            dots.rotation.x = Math.sin(t * 0.1) * 0.2 + mouse.ny * 0.1;
            dots.rotation.y = Math.cos(t * 0.15) * 0.2 + mouse.nx * 0.1;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = section.offsetWidth / section.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(section.offsetWidth, section.offsetHeight);
        });
    }

    // ======== FORM ========
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'SENT ✓';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.textContent = 'Send Request';
                btn.style.background = '';
                form.reset();
            }, 3000);
        });
    }

    // ======== INIT ========
    window.addEventListener('load', () => {
        initHeroScene();
        initStatsScene();
    });

})();
