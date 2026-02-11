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

        // — GR Yaris Track — built from vertices for accurate shape —
        const carGroup = new THREE.Group();

        // Build car from BufferGeometry with manually placed vertices
        // GR Yaris proportions: short wheelbase, wide stance, aggressive hatch
        function buildCarBody() {
            const g = new THREE.Group();

            // Helper: create mesh from vertices array (quads as triangles)
            function makePanelMesh(vertices, indices) {
                const geom = new THREE.BufferGeometry();
                geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
                geom.setIndex(indices);
                geom.computeVertexNormals();
                // Wireframe
                const wire = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({
                    color: 0xE63946, wireframe: true, transparent: true, opacity: 0.35
                }));
                // Solid
                const solid = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({
                    color: 0xE63946, transparent: true, opacity: 0.12, side: THREE.DoubleSide
                }));
                // Edges
                const edgeGeom = new THREE.EdgesGeometry(geom, 20);
                const edgeLine = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({
                    color: 0xFF6B6B, transparent: true, opacity: 0.7
                }));
                g.add(wire, solid, edgeLine);
            }

            // ---- Lower body / chassis ----
            // L = left(+z), R = right(-z), F = front(-x), B = back(+x)
            const W = 0.75; // half-width
            const bv = [
                // 0-3: front bumper bottom
                [-1.7, 0.0, W], [-1.7, 0.0, -W], [-1.8, 0.2, -W], [-1.8, 0.2, W],
                // 4-7: front bumper top / hood start
                [-1.65, 0.45, W], [-1.65, 0.45, -W], [-1.7, 0.35, -W], [-1.7, 0.35, W],
                // 8-11: hood middle
                [-0.9, 0.52, W*0.95], [-0.9, 0.52, -W*0.95], [-0.9, 0.52, -W*0.95], [-0.9, 0.52, W*0.95],
                // 12-13: windshield base
                [-0.7, 0.55, W*0.9], [-0.7, 0.55, -W*0.9],
                // 14-15: roof front
                [-0.2, 1.1, W*0.7], [-0.2, 1.1, -W*0.7],
                // 16-17: roof middle/peak
                [0.3, 1.12, W*0.68], [0.3, 1.12, -W*0.68],
                // 18-19: roof rear
                [0.7, 1.08, W*0.66], [0.7, 1.08, -W*0.66],
                // 20-21: rear glass top
                [1.0, 0.90, W*0.7], [1.0, 0.90, -W*0.7],
                // 22-23: rear hatch bottom / spoiler
                [1.3, 0.75, W*0.75], [1.3, 0.75, -W*0.75],
                // 24-25: rear bumper top
                [1.45, 0.50, W*0.8], [1.45, 0.50, -W*0.8],
                // 26-27: rear bumper bottom
                [1.5, 0.15, W*0.78], [1.5, 0.15, -W*0.78],
                // 28-29: rear floor
                [1.45, 0.0, W*0.75], [1.45, 0.0, -W*0.75],
                // 30-31: sill line front
                [-1.5, 0.15, W*1.0], [-1.5, 0.15, -W*1.0],
                // 32-33: sill line middle
                [0.0, 0.15, W*1.02], [0.0, 0.15, -W*1.02],
                // 34-35: sill line rear
                [1.2, 0.15, W*0.98], [1.2, 0.15, -W*0.98],
                // 36-37: shoulder line front
                [-1.5, 0.45, W*1.0], [-1.5, 0.45, -W*1.0],
                // 38-39: shoulder line mid
                [0.0, 0.55, W*0.95], [0.0, 0.55, -W*0.95],
                // 40-41: shoulder line rear
                [1.2, 0.55, W*0.88], [1.2, 0.55, -W*0.88],
                // 42-43: front floor
                [-1.65, 0.0, W*0.9], [-1.65, 0.0, -W*0.9],
            ];

            // Side panels (left side, +Z)
            makePanelMesh(bv, [
                // Left side lower
                30,32,36, 32,38,36,
                32,34,38, 34,40,38,
                // Left side upper
                36,38,4, 38,12,4, 4,12,8,
                38,40,14, 40,20,18, 38,14,16, 38,16,18, 38,18,40,
                40,22,20, 40,24,22,
                // Right side lower
                31,37,33, 33,37,39,
                33,39,35, 35,39,41,
                // Right side upper
                37,5,39, 39,5,13, 5,9,13,
                39,15,41, 41,21,19, 39,17,15, 39,19,17, 39,41,19,
                41,21,23, 41,23,25,
                // Hood
                4,5,8, 5,9,8, 8,9,12, 9,13,12,
                // Windshield
                12,13,14, 13,15,14,
                // Roof
                14,15,16, 15,17,16, 16,17,18, 17,19,18,
                // Rear glass
                18,19,20, 19,21,20,
                // Rear hatch
                20,21,22, 21,23,22,
                // Rear face
                22,23,24, 23,25,24, 24,25,26, 25,27,26,
                // Floor
                42,43,28, 43,29,28,
                // Front face
                42,43,3, 43,2,3, 3,2,7, 2,6,7, 7,6,4, 6,5,4,
                // Rear bottom
                26,27,28, 27,29,28,
                // Bottom
                30,31,32, 31,33,32, 32,33,34, 33,35,34, 34,35,28, 35,29,28,
            ]);

            return g;
        }

        const carBody = buildCarBody();
        carGroup.add(carBody);

        // ---- Spoiler (GR Yaris signature large rear spoiler) ----
        const spoilerGeom = new THREE.BoxGeometry(0.35, 0.04, 1.5);
        const spoilerMat = new THREE.MeshPhongMaterial({ color: 0xE63946, wireframe: true, transparent: true, opacity: 0.4 });
        const spoiler = new THREE.Mesh(spoilerGeom, spoilerMat);
        spoiler.position.set(1.15, 0.92, 0);
        carGroup.add(spoiler);
        // Spoiler stands
        const standGeom = new THREE.BoxGeometry(0.04, 0.12, 0.04);
        [[1.15, 0.85, 0.45], [1.15, 0.85, -0.45]].forEach(pos => {
            const stand = new THREE.Mesh(standGeom, spoilerMat);
            stand.position.set(...pos);
            carGroup.add(stand);
        });

        // ---- Roof scoop (GR Yaris functional intake) ----
        const scoopGeom = new THREE.BoxGeometry(0.2, 0.06, 0.25);
        const scoopMat = new THREE.MeshPhongMaterial({ color: 0x222222, wireframe: true, transparent: true, opacity: 0.5 });
        const scoop = new THREE.Mesh(scoopGeom, scoopMat);
        scoop.position.set(-0.05, 1.16, 0);
        carGroup.add(scoop);

        // ---- Wheels with multi-spoke rims ----
        const wheels = [];
        function createWheel() {
            const wg = new THREE.Group();
            // Tire
            const tire = new THREE.Mesh(
                new THREE.TorusGeometry(0.3, 0.1, 16, 32),
                new THREE.MeshPhongMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.6 })
            );
            tire.rotation.y = Math.PI / 2;
            wg.add(tire);
            // Rim outer
            const rimOuter = new THREE.Mesh(
                new THREE.TorusGeometry(0.22, 0.025, 8, 32),
                new THREE.MeshPhongMaterial({ color: 0xCCCCCC, wireframe: true, transparent: true, opacity: 0.6 })
            );
            rimOuter.rotation.y = Math.PI / 2;
            wg.add(rimOuter);
            // Rim center
            const rimCenter = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6),
                new THREE.MeshPhongMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 0.5 })
            );
            rimCenter.rotation.x = Math.PI / 2;
            wg.add(rimCenter);
            // Spokes (6 spokes)
            for (let i = 0; i < 6; i++) {
                const spoke = new THREE.Mesh(
                    new THREE.BoxGeometry(0.16, 0.015, 0.015),
                    new THREE.MeshPhongMaterial({ color: 0xDDDDDD, wireframe: true, transparent: true, opacity: 0.5 })
                );
                const angle = (i / 6) * Math.PI * 2;
                spoke.position.set(Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0);
                spoke.rotation.z = angle;
                wg.add(spoke);
            }
            // Brake caliper (red, visible through rim)
            const caliper = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.04, 0.04),
                new THREE.MeshPhongMaterial({ color: 0xE63946, emissive: 0xE63946, emissiveIntensity: 0.3, transparent: true, opacity: 0.7 })
            );
            caliper.position.set(0.12, 0, 0.02);
            wg.add(caliper);
            // Brake disc
            const disc = new THREE.Mesh(
                new THREE.RingGeometry(0.1, 0.2, 24),
                new THREE.MeshPhongMaterial({ color: 0x555555, wireframe: true, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
            );
            disc.rotation.y = Math.PI / 2;
            wg.add(disc);
            return wg;
        }

        const wheelPositions = [
            [-1.15, -0.05, 0.82], [-1.15, -0.05, -0.82],
            [1.0, -0.05, 0.82], [1.0, -0.05, -0.82]
        ];
        wheelPositions.forEach(pos => {
            const w = createWheel();
            w.position.set(...pos);
            carGroup.add(w);
            wheels.push(w);
        });

        // ---- Headlights (sharp LED style) ----
        const hlGeom = new THREE.BoxGeometry(0.04, 0.06, 0.2);
        const hlMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.8, transparent: true, opacity: 0.8 });
        [[-1.78, 0.45, 0.55], [-1.78, 0.45, -0.55]].forEach(pos => {
            const hl = new THREE.Mesh(hlGeom, hlMat);
            hl.position.set(...pos);
            carGroup.add(hl);
        });
        // DRL strip
        const drlGeom = new THREE.BoxGeometry(0.02, 0.02, 0.3);
        const drlMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.5, transparent: true, opacity: 0.6 });
        [[-1.80, 0.38, 0.50], [-1.80, 0.38, -0.50]].forEach(pos => {
            const drl = new THREE.Mesh(drlGeom, drlMat);
            drl.position.set(...pos);
            carGroup.add(drl);
        });

        // ---- Taillights (wide LED bar style) ----
        const tlGeom = new THREE.BoxGeometry(0.04, 0.08, 0.25);
        const tlMat = new THREE.MeshPhongMaterial({ color: 0xE63946, emissive: 0xE63946, emissiveIntensity: 0.6, transparent: true, opacity: 0.8 });
        [[1.48, 0.55, 0.5], [1.48, 0.55, -0.5]].forEach(pos => {
            const tl = new THREE.Mesh(tlGeom, tlMat);
            tl.position.set(...pos);
            carGroup.add(tl);
        });

        // ---- Front grille (large GR Yaris intake) ----
        const grilleGeom = new THREE.PlaneGeometry(0.25, 0.8);
        const grilleMat = new THREE.MeshPhongMaterial({ color: 0x111111, wireframe: true, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
        const grille = new THREE.Mesh(grilleGeom, grilleMat);
        grille.position.set(-1.82, 0.25, 0);
        grille.rotation.y = Math.PI / 2;
        carGroup.add(grille);

        // ---- Side mirrors ----
        const mirrorGeom = new THREE.BoxGeometry(0.08, 0.05, 0.06);
        const mirrorMat = new THREE.MeshPhongMaterial({ color: 0xE63946, wireframe: true, transparent: true, opacity: 0.4 });
        [[-0.5, 0.7, 0.85], [-0.5, 0.7, -0.85]].forEach(pos => {
            const m = new THREE.Mesh(mirrorGeom, mirrorMat);
            m.position.set(...pos);
            carGroup.add(m);
        });

        // ---- Exhaust tips ----
        const exhaustGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12);
        const exhaustMat = new THREE.MeshPhongMaterial({ color: 0x888888, wireframe: true, transparent: true, opacity: 0.5 });
        [[1.52, 0.1, 0.3], [1.52, 0.1, -0.3]].forEach(pos => {
            const ex = new THREE.Mesh(exhaustGeom, exhaustMat);
            ex.rotation.x = Math.PI / 2;
            ex.position.set(...pos);
            carGroup.add(ex);
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

            // Spin wheels
            if (typeof wheels !== 'undefined') {
                wheels.forEach(w => { w.rotation.z = t * 2; });
            }

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
