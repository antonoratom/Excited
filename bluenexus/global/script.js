gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/* =========================================================
   DEFAULT CONFIG (Fallbacks)
========================================================= */
const DEFAULT_CONFIG = {
    paths: {
        duration: 2.5,
        delay: 0.1,
        stagger: 0.05,
        ease: 'power1.out'
    },
    sequences: {
        first: 500,
        second: 800,
        third: 1100,
        fourth: 1400
    },
    pulse: {
        duration: 1800,
        delayMin: 150,
        delayMax: 800,
        initialDelay: 500
    },
    dot: {
        speed: 140
    }
};

/* =========================================================
   CONFIG READER
========================================================= */
class ConfigReader {
    constructor(container) {
        this.container = container || document.querySelector('.svg-container');
    }

    get(key, element = null, defaultValue = null) {
        const el = element || this.container;
        const value = el?.dataset?.[key];
        
        if (value !== undefined) {
            return this._parseValue(value);
        }
        
        if (element && this.container) {
            const containerValue = this.container.dataset?.[key];
            if (containerValue !== undefined) {
                return this._parseValue(containerValue);
            }
        }
        
        return defaultValue;
    }

    _parseValue(value) {
        const num = Number(value);
        if (!isNaN(num)) return num;
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    }

    getSequenceDelays() {
        const delays = {};
        
        document.querySelectorAll('[sequence]').forEach(el => {
            const key = el.getAttribute('sequence');
            
            // Try to get from data attribute first, then fall back to default
            const delay = this.get('sequenceDelay', el, null) ?? DEFAULT_CONFIG.sequences[key];
            
            if (key && delay !== null && delay !== undefined) {
                delays[key] = delay;
            }
        });
        
        // If no sequences found at all, return defaults
        return Object.keys(delays).length > 0 ? delays : DEFAULT_CONFIG.sequences;
    }

    getPulseConfig() {
        return {
            duration: this.get('pulseDuration', null, DEFAULT_CONFIG.pulse.duration),
            delayMin: this.get('pulseDelayMin', null, DEFAULT_CONFIG.pulse.delayMin),
            delayMax: this.get('pulseDelayMax', null, DEFAULT_CONFIG.pulse.delayMax),
            initialDelay: this.get('pulseInitialDelay', null, DEFAULT_CONFIG.pulse.initialDelay)
        };
    }

    getDotSpeed(element = null) {
        return this.get('dotSpeed', element, DEFAULT_CONFIG.dot.speed);
    }
}


/* =========================================================
   UTILITIES
========================================================= */
const utils = {
    random: (min, max) => min + Math.random() * (max - min),
    
    getAvailableElements: (selector, excludeClass) => 
        Array.from(document.querySelectorAll(selector))
            .filter(el => !el.classList.contains(excludeClass)),
    
    randomFromArray: arr => arr[Math.floor(Math.random() * arr.length)]
};

/* =========================================================
   PATH DRAWING
========================================================= */
function drawPaths(selector, customOptions = {}) {
    const paths = gsap.utils.toArray(selector);
    if (!paths.length) return;

    const options = { ...DEFAULT_CONFIG.paths, ...customOptions };
    
    gsap.set(paths, { drawSVG: '0%' });
    gsap.to(paths, {
        drawSVG: '100%',
        ...options,
        stagger: { each: options.stagger, from: 'start' }
    });
}

/* =========================================================
   DOT ANIMATION CONTROLLER
========================================================= */
class DotAnimationController {
    constructor(configReader) {
        this.activeAnimations = new Map();
        this.config = configReader;
        this.randomDotsEnabled = this._checkRandomDotsEnabled();
        this.transformMonitors = new Map();
        this.grayDots = new Set();
        this.circleIndex = 0;
        this.pulseController = null;
        this.animatingLogos = new Set(); // 🔒 Track which logos are currently animating
        
        this.GRAY_PROBABILITY = 0.3;
        this.GRAY_CHECK_INTERVAL = 100;
    }

    _checkRandomDotsEnabled() {
        return document.querySelector('svg[random-dots]') !== null;
    }

    setPulseController(controller) {
        this.pulseController = controller;
    }

    animate(logo, options = {}) {
        const dot = logo.querySelector('[logo-dot]');
        const path = this._findNextPath(logo);
        
        if (!dot || !path) return null;

        // 🚫 PREVENT interruption: If this logo's dot is already animating, skip
        if (this.animatingLogos.has(logo)) {
            console.log(`⏭ Skipping ${logo.id} - dot already animating`);
            return null;
        }

        // Mark this logo as animating
        this.animatingLogos.add(logo);
        logo.setAttribute('dot-animating', 'true'); // Visual indicator

        // Decide if this dot should be gray
        if (this.randomDotsEnabled) {
            const shouldBeGray = Math.random() < this.GRAY_PROBABILITY;
            
            if (shouldBeGray) {
                this.grayDots.add(dot);
                this._startTransformMonitor(dot);
            } else {
                this.grayDots.delete(dot);
            }
        }

        const animation = this._createAnimation(logo, dot, path, options);
        this.activeAnimations.set(dot, animation);
        
        return animation;
    }

    _findNextPath(element) {
        let sibling = element.nextElementSibling;
        while (sibling && sibling.tagName !== 'path') {
            sibling = sibling.nextElementSibling;
        }
        return sibling;
    }

    _createAnimation(logo, dot, path, options = {}) {
        const pathLength = path.getTotalLength();
        const speed = options.speed ?? this.config.getDotSpeed(logo);
        const duration = options.duration ?? pathLength / speed;
        const strokeWidth = parseFloat(path.getAttribute('stroke-width')) || 1;
        const offset = strokeWidth / 2;

        console.log(`▶️ ${logo.id} started (${duration.toFixed(2)}s)`);

        gsap.set(dot, { x: 0, y: 0, clearProps: 'transform' });

        return gsap.to(dot, {
            duration,
            ease: 'none',
            motionPath: {
                path,
                start: 0,
                end: 1,
                align: path,
                alignOrigin: [0.5, 0.5],
                autoRotate: false
            },
            onComplete: () => {
                console.log(`✅ ${logo.id} completed (${duration.toFixed(2)}s)`);
                
                // Handle random-dots functionality
                if (this.randomDotsEnabled) {
                    const wasGray = this.grayDots.has(dot);
                    this._fillNextCircle(wasGray);
                    this.grayDots.delete(dot);
                }
                
                // 🔓 UNLOCK: Mark logo as available for new animation
                this.animatingLogos.delete(logo);
                logo.removeAttribute('dot-animating');
                
                // Clean up
                this.activeAnimations.delete(dot);
                gsap.set(dot, { x: 0, y: 0, clearProps: 'all' });
            },
            onInterrupt: () => {
                // If animation gets interrupted (shouldn't happen now)
                console.warn(`⚠️ ${logo.id} interrupted!`);
                this.animatingLogos.delete(logo);
                logo.removeAttribute('dot-animating');
            },
            ...options
        });
    }

    _fillNextCircle(wasGray) {
        const circles = document.querySelectorAll('[random-circle]');
        
        if (circles.length === 0) return;
        
        if (this.circleIndex >= circles.length) {
            return;
        }
        
        const targetCircle = circles[this.circleIndex];
        const className = wasGray ? 'for-gray' : 'for-blue';
        targetCircle.classList.add(className);
        
        console.log(`  → Circle ${this.circleIndex + 1}/${circles.length}: ${className}`);
        
        this.circleIndex++;
        
        if (this.circleIndex >= circles.length) {
            console.log('🎉 All 16 circles filled! Waiting for dots to finish...');
            this._pausePulseSystem();
            this._waitForAllAnimations().then(() => {
                console.log('✅ All dots completed! Starting circle sequence...');
                this._startCircleSequence();
            });
        }
    }

    _waitForAllAnimations() {
        return new Promise((resolve) => {
            if (this.activeAnimations.size === 0) {
                resolve();
                return;
            }
            
            console.log(`  ↳ Waiting for ${this.activeAnimations.size} dots...`);
            
            const checkInterval = setInterval(() => {
                const remaining = this.activeAnimations.size;
                
                if (remaining > 0) {
                    console.log(`  ⏳ ${remaining} dot(s) still moving...`);
                }
                
                if (remaining === 0) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 8000);
        });
    }

    
    
    _startCircleSequence() {
        const allCircles = document.querySelectorAll('[random-circle]');
        const grayCircles = document.querySelectorAll('[random-circle].for-gray');
        const blueCircles = document.querySelectorAll('[random-circle].for-blue');
        const holder = document.querySelector('#circles-holder');
        const finalDot = document.querySelector('[final-dot]');
        const finalPath = document.querySelector('[final-path]');
        
        if (!holder || !finalDot || !finalPath) {
            console.warn('⚠ Required elements not found!');
            return;
        }
        
        console.log('🎬 Starting circle animation sequence...');
        
        // Store original positions BEFORE any animation
        const originalPositions = new Map();
        allCircles.forEach(circle => {
            originalPositions.set(circle, {
                cx: parseFloat(circle.getAttribute('cx')),
                cy: parseFloat(circle.getAttribute('cy'))
            });
        });
        
        // Get holder center
        const holderBBox = holder.getBBox();
        const centerX = holderBBox.x + holderBBox.width / 2;
        const centerY = holderBBox.y + holderBBox.height / 2;
        
        // Create timeline
        const tl = gsap.timeline();
        
        // Step 1: Hide gray circles immediately
        tl.call(() => {
            console.log('1️⃣ Hiding gray circles...');
            grayCircles.forEach(circle => circle.classList.add('to-hide'));
        });
        
        // Step 2: Wait 0.5s, then move blue circles to center
        tl.to(Array.from(blueCircles), {
            duration: 0.5,
            attr: { cx: centerX, cy: centerY },
            ease: 'power2.inOut',
            onStart: () => {
                console.log(`2️⃣ Moving ${blueCircles.length} blue circles to center...`);
            }
        }, '+=0.5');
        
        // Step 3: When blue circles reach center
        tl.call(() => {
            console.log('3️⃣ Blue circles at center - hiding them and showing final dot...');
            
            // Hide blue circles
            blueCircles.forEach(circle => circle.classList.add('to-hide'));
            
            // Show final dot
            finalDot.classList.add('to-show');
            
            console.log('✓ Final dot .to-show class added:', finalDot.classList.contains('to-show'));
        });
        
        // Step 4: Animate final dot along path
        tl.to(finalDot, {
            duration: 1.5,
            ease: 'none',
            motionPath: {
                path: finalPath,
                start: 0,
                end: 1,
                align: finalPath,
                alignOrigin: [0.5, 0.5],
                autoRotate: false
            },
            onStart: () => {
                console.log('4️⃣ Final dot moving along path...');
            },
            onUpdate: () => {
                // Reset circles during the animation (call once in the middle)
                if (!tl.circlesReset && tl.progress() > 0.3) {
                    this._resetAllCircles(allCircles, originalPositions);
                    tl.circlesReset = true;
                }
            },
            onComplete: () => {
                console.log('5️⃣ Final dot reached end');
                
                // Hide final dot
                finalDot.classList.remove('to-show');
                gsap.set(finalDot, { x: 0, y: 0 });
                
                // Resume pulse
                console.log('▶️ Resuming pulse system...');
                if (this.pulseController) {
                    this.pulseController.resume();
                }
                
                // Reset flag for next round
                delete tl.circlesReset;
            }
        });
    }
    
    _resetAllCircles(circles, originalPositions) {
        console.log('🔄 Resetting all circles...');
        
        circles.forEach(circle => {
            const original = originalPositions.get(circle);
            
            if (original) {
                // First: remove all animation classes cleanly
                circle.classList.remove('for-gray', 'for-blue', 'to-hide');
                
                // Then: reset position immediately (no animation)
                circle.setAttribute('cx', original.cx);
                circle.setAttribute('cy', original.cy);
                
                console.log(`  Reset circle to (${original.cx}, ${original.cy})`);
            }
        });
        
        // Reset index for next cycle
        this.circleIndex = 0;
        console.log('✅ All circles reset to original state');
    }
    
    
    

    _pausePulseSystem() {
        if (this.pulseController) {
            this.pulseController.pause();
            console.log('⏸ Pulse system paused');
        }
    }

    _startTransformMonitor(dot) {
        this._stopTransformMonitor(dot);
    
        const INITIAL_TRANSFORM = 'matrix(1,0,0,1,0,0)';
        let lastToggleTime = 0;
        let hasGrayClass = false;
    
        const checkTransform = () => {
            const currentTransform = dot.getAttribute('transform') || INITIAL_TRANSFORM;
            const isMoving = currentTransform !== INITIAL_TRANSFORM;
            const now = Date.now();
            const timeSinceLastToggle = now - lastToggleTime;
    
            if (isMoving) {
                if (!hasGrayClass && timeSinceLastToggle >= this.GRAY_CHECK_INTERVAL) { // ← Use setting
                    dot.classList.add('for-gray');
                    hasGrayClass = true;
                    lastToggleTime = now;
                }
            } else {
                if (hasGrayClass && timeSinceLastToggle >= this.GRAY_CHECK_INTERVAL) { // ← Use setting
                    dot.classList.remove('for-gray');
                    hasGrayClass = false;
                    lastToggleTime = now;
                    this._stopTransformMonitor(dot);
                }
            }
        };
    
        const intervalId = setInterval(checkTransform, this.GRAY_CHECK_INTERVAL); // ← Use setting
        this.transformMonitors.set(dot, intervalId);
    }
    

    _stopTransformMonitor(dot) {
        const intervalId = this.transformMonitors.get(dot);
        if (intervalId) {
            clearInterval(intervalId);
            this.transformMonitors.delete(dot);
        }
        dot.classList.remove('for-gray');
    }

    killAnimation(dot) {
        const existing = this.activeAnimations.get(dot);
        if (existing) {
            existing.kill();
            gsap.set(dot, { x: 0, y: 0 });
            this.activeAnimations.delete(dot);
        }
        
        if (this.randomDotsEnabled) {
            this._stopTransformMonitor(dot);
            this.grayDots.delete(dot);
        }
        
        // Clean up animating logos tracking
        const logo = dot.closest('.logo');
        if (logo) {
            this.animatingLogos.delete(logo);
            logo.removeAttribute('dot-animating');
        }
    }

    pauseAll() {
        // Don't pause animations, let them finish
        if (this.randomDotsEnabled) {
            this.transformMonitors.forEach((intervalId, dot) => {
                this._stopTransformMonitor(dot);
            });
        }
    }

    killAll() {
        this.activeAnimations.forEach((anim, dot) => {
            anim.kill();
            gsap.set(dot, { x: 0, y: 0 });
            
            if (this.randomDotsEnabled) {
                this._stopTransformMonitor(dot);
            }
        });
        this.activeAnimations.clear();
        
        if (this.randomDotsEnabled) {
            this.grayDots.clear();
        }
        
        // Clear all animating logos
        this.animatingLogos.clear();
        document.querySelectorAll('[dot-animating]').forEach(logo => {
            logo.removeAttribute('dot-animating');
        });
    }
}


/* =========================================================
   PULSE CONTROLLER
========================================================= */
class PulseController {
    constructor(configReader, customOptions = {}) {
        const pulseConfig = configReader.getPulseConfig();
        this.config = { ...pulseConfig, ...customOptions };
        
        this.timeoutId = null;
        this.isActive = false;
        this.isPaused = false;
        this.selector = customOptions.selector || '.logo.with-color';
        this.pulseClass = customOptions.pulseClass || 'to-pulse';
    }

    start(delay = 0) {
        if (this.isActive && !this.isPaused) return this;
        
        this.isActive = true;
        this.isPaused = false;
        this._clearTimeout();
        
        setTimeout(() => this._pulse(), delay);
        return this;
    }

    pause() {
        this.isPaused = true;
        this._clearTimeout();
        return this;
    }

    resume(delay = this.config.delayMin + 100) {
        this.isPaused = false;
        this._clearPendingPulses();
        
        if (this.isActive) {
            this._clearTimeout();
            this.timeoutId = setTimeout(() => {
                if (!this.isPaused) this._pulse();
            }, delay);
        }
        return this;
    }

    stop() {
        this.isActive = false;
        this.isPaused = false;
        this._clearTimeout();
        this._clearPendingPulses();
        return this;
    }

    pulseElement(element) {
        if (this.isPaused || !element) return this;
        
        element.classList.add(this.pulseClass);
        setTimeout(() => {
            element.classList.remove(this.pulseClass);
        }, this.config.duration);
        
        return this;
    }

   // In PulseController._pulse() method:
_pulse() {
    if (this.isPaused) {
        this.timeoutId = setTimeout(() => this._pulse(), 200);
        return;
    }

    const available = utils.getAvailableElements(this.selector, this.pulseClass);
    
    // 🚫 Filter out logos that are currently animating
    const availableAndReady = available.filter(logo => 
        !logo.hasAttribute('dot-animating')
    );
    
    if (availableAndReady.length > 0) {
        const element = utils.randomFromArray(availableAndReady);
        this.pulseElement(element);
    } else {
        console.log('⏭ All logos busy, waiting...');
    }

    const nextDelay = utils.random(this.config.delayMin, this.config.delayMax);
    this.timeoutId = setTimeout(() => this._pulse(), nextDelay);
}


    _clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    _clearPendingPulses() {
        document.querySelectorAll(`.${this.pulseClass}`).forEach(el => {
            el.classList.remove(this.pulseClass);
        });
    }
}

/* =========================================================
   LOGO SYSTEM
========================================================= */
class LogoAnimationSystem {
    constructor(container = null) {
        this.configReader = new ConfigReader(container);
        this.dotController = new DotAnimationController(this.configReader);
        this.pulseController = new PulseController(this.configReader);
        this.observers = [];
        
        // Connect controllers
        this.dotController.setPulseController(this.pulseController);
    }

    initSequences(customSequences = null) {
        const sequences = customSequences || this.configReader.getSequenceDelays();
        
        document.querySelectorAll('.logo[sequence]').forEach(logo => {
            const key = logo.getAttribute('sequence');
            const delay = sequences[key];

            if (delay != null) {
                setTimeout(() => logo.classList.add('with-color'), delay);
            }
        });

        return this;
    }

    connectPulseToAnimation(selector = '.logo') {
        document.querySelectorAll(selector).forEach(logo => {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(m => {
                    if (m.attributeName === 'class' && 
                        logo.classList.contains('to-pulse') &&
                        !this.pulseController.isPaused) {
                        this.dotController.animate(logo);
                    }
                });
            });

            observer.observe(logo, { attributes: true });
            this.observers.push(observer);
        });

        return this;
    }

    animateDot(logoSelector, options) {
        const logo = typeof logoSelector === 'string' 
            ? document.querySelector(logoSelector) 
            : logoSelector;
        
        return this.dotController.animate(logo, options);
    }

    pulseElement(logoSelector) {
        const logo = typeof logoSelector === 'string'
            ? document.querySelector(logoSelector)
            : logoSelector;
        
        return this.pulseController.pulseElement(logo);
    }

    updateConfig(updates) {
        if (updates.pulse) {
            Object.assign(this.pulseController.config, updates.pulse);
        }
        return this;
    }

    pause() {
        this.pulseController.pause();
        this.dotController.pauseAll();
        return this;
    }

    resume() {
        this.pulseController.resume();
        // DON'T kill animations on resume
        // this.dotController.killAll(); // ← REMOVE THIS
        return this;
    }

    destroy() {
        this.pulseController.stop();
        this.dotController.killAll();
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];
    }
}

/* =========================================================
   INITIALIZATION
========================================================= */
const logoSystem = new LogoAnimationSystem();

window.addEventListener('load', () => {
    // Draw paths
    ['[left-side-path]', '[right-side-path]'].forEach(selector => {
        drawPaths(selector);
    });

    // Initialize sequences and pulse system
    const sequences = logoSystem.configReader.getSequenceDelays();
    const maxSequenceDelay = Math.max(...Object.values(sequences), 0);
    const pulseConfig = logoSystem.configReader.getPulseConfig();
    
    logoSystem
        .initSequences()
        .connectPulseToAnimation()
        .pulseController.start(maxSequenceDelay + pulseConfig.initialDelay);
});
