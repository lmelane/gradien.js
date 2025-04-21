/**
 * Quantum Fluid Gradient - Ultra Sophisticated Version
 * Advanced particle-based fluid simulation with vortex dynamics
 */

// Utility functions
function normalizeColor(hexCode) {
  if (typeof hexCode === 'string' && hexCode.startsWith('0x')) {
    hexCode = parseInt(hexCode.substring(2), 16);
  }
  return [
    (hexCode >> 16 & 255) / 255,
    (hexCode >> 8 & 255) / 255,
    (255 & hexCode) / 255
  ];
}

function hexToRgb(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r/255, g/255, b/255];
}

function lerpColor(color1, color2, t) {
  return [
    color1[0] + (color2[0] - color1[0]) * t,
    color1[1] + (color2[1] - color1[1]) * t,
    color1[2] + (color2[2] - color1[2]) * t
  ];
}

class QuantumFluidGradient {
  constructor(options = {}) {
    // Canvas element
    this.el = null;
    this.ctx = null;
    
    // Animation properties
    this.animationId = null;
    this.time = 0;
    this.lastTime = 0;
    this.isPlaying = true;
    this.mousePosition = { x: 0, y: 0 };
    this.isMouseActive = false;
    
    // Fluid simulation properties
    this.particles = [];
    this.vortices = [];
    this.flowField = [];
    
    // Gradient properties
    this.sectionColors = [
      '0x5820FF',
      '0x89CFF5',
      '0x49B5EF',
      '0x6B39FF'
    ].map(normalizeColor);
    
    // Configuration
    this.config = {
      particleCount: 1000,
      particleSize: 2,
      particleOpacity: 0.6,
      vortexCount: 5,
      vortexStrength: 50,
      vortexRadius: 150,
      flowFieldResolution: 20,
      velocityDamping: 0.98,
      noiseScale: 0.003,
      noiseSpeed: 0.0005,
      blurAmount: 15,
      colorCycleSpeed: 0.0002,
      interactionRadius: 200,
      interactionStrength: 100,
      usePerlin: true,
      useVortexDynamics: true,
      useColorDiffusion: true,
      ...options
    };
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.resize = this.resize.bind(this);
  }
  
  // Initialize the gradient
  initGradient(selector) {
    // Get canvas element
    this.el = document.querySelector(selector);
    if (!this.el) {
      console.error(`Element not found: ${selector}`);
      return this;
    }
    
    // Set up canvas
    this.ctx = this.el.getContext('2d');
    
    // Add event listeners
    window.addEventListener('resize', this.resize);
    this.el.addEventListener('mousemove', this.handleMouseMove);
    this.el.addEventListener('mouseenter', this.handleMouseEnter);
    this.el.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Initialize
    this.resize();
    this.initFluidSimulation();
    
    // Start animation
    this.animate(0);
    
    return this;
  }
  
  // Initialize fluid simulation
  initFluidSimulation() {
    const { width, height } = this;
    const { particleCount, vortexCount, flowFieldResolution } = this.config;
    
    // Create particles
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        color: this.sectionColors[Math.floor(Math.random() * this.sectionColors.length)],
        size: this.config.particleSize * (0.5 + Math.random()),
        age: Math.random() * 100
      });
    }
    
    // Create vortices
    this.vortices = [];
    for (let i = 0; i < vortexCount; i++) {
      this.vortices.push({
        x: Math.random() * width,
        y: Math.random() * height,
        strength: (Math.random() * 2 - 1) * this.config.vortexStrength,
        radius: this.config.vortexRadius * (0.5 + Math.random()),
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25
      });
    }
    
    // Create flow field
    const cols = Math.ceil(width / flowFieldResolution);
    const rows = Math.ceil(height / flowFieldResolution);
    this.flowField = new Array(cols * rows);
  }
  
  // Handle window resize
  resize() {
    const { el } = this;
    
    // Set canvas dimensions
    this.width = el.width = window.innerWidth;
    this.height = el.height = window.innerHeight;
    
    // Reinitialize fluid simulation on resize
    this.initFluidSimulation();
  }
  
  // Handle mouse movement
  handleMouseMove(e) {
    const rect = this.el.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  // Handle mouse enter
  handleMouseEnter() {
    this.isMouseActive = true;
  }
  
  // Handle mouse leave
  handleMouseLeave() {
    this.isMouseActive = false;
  }
  
  // Perlin noise function (simplified)
  noise(x, y, z) {
    return (Math.sin(x * 10 + z) * Math.cos(y * 10 - z) * 0.5 + 0.5) * 
           (Math.sin(x * 5 - z * 0.3) * Math.cos(y * 7 + z * 0.2) * 0.5 + 0.5);
  }
  
  // Update flow field
  updateFlowField() {
    const { width, height, config, time } = this;
    const { flowFieldResolution, noiseScale, noiseSpeed, usePerlin } = config;
    
    const cols = Math.ceil(width / flowFieldResolution);
    const rows = Math.ceil(height / flowFieldResolution);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        
        if (usePerlin) {
          // Use perlin-like noise for organic flow
          const angle = this.noise(
            x * noiseScale, 
            y * noiseScale, 
            time * noiseSpeed
          ) * Math.PI * 4;
          
          this.flowField[index] = {
            x: Math.cos(angle),
            y: Math.sin(angle)
          };
        } else {
          // Use simpler sine waves
          const angle = 
            Math.sin(x * 0.1 + time * 0.001) * 
            Math.cos(y * 0.1 + time * 0.002) * Math.PI;
          
          this.flowField[index] = {
            x: Math.cos(angle),
            y: Math.sin(angle)
          };
        }
      }
    }
  }
  
  // Update vortices
  updateVortices() {
    const { width, height, config, time } = this;
    const { useVortexDynamics } = config;
    
    if (!useVortexDynamics) return;
    
    this.vortices.forEach(vortex => {
      // Move vortices
      vortex.x += vortex.vx;
      vortex.y += vortex.vy;
      
      // Bounce off edges
      if (vortex.x < 0 || vortex.x > width) vortex.vx *= -1;
      if (vortex.y < 0 || vortex.y > height) vortex.vy *= -1;
      
      // Slowly change vortex properties for organic movement
      vortex.strength = vortex.strength * 0.99 + 
                        (Math.random() * 2 - 1) * config.vortexStrength * 0.01;
      
      vortex.radius = vortex.radius * 0.99 + 
                     config.vortexRadius * (0.5 + Math.random() * 0.5) * 0.01;
    });
    
    // Add mouse interaction as a vortex
    if (this.isMouseActive) {
      this.vortices[0] = {
        x: this.mousePosition.x,
        y: this.mousePosition.y,
        strength: config.interactionStrength,
        radius: config.interactionRadius,
        vx: 0,
        vy: 0
      };
    }
  }
  
  // Update particles
  updateParticles() {
    const { width, height, config, flowField, vortices } = this;
    const { flowFieldResolution, velocityDamping } = config;
    
    const cols = Math.ceil(width / flowFieldResolution);
    
    this.particles.forEach(particle => {
      // Age particles
      particle.age += 0.01;
      
      // Get flow field influence
      const col = Math.floor(particle.x / flowFieldResolution);
      const row = Math.floor(particle.y / flowFieldResolution);
      const index = col + row * cols;
      
      if (flowField[index]) {
        particle.vx += flowField[index].x * 0.1;
        particle.vy += flowField[index].y * 0.1;
      }
      
      // Add vortex influence
      vortices.forEach(vortex => {
        const dx = particle.x - vortex.x;
        const dy = particle.y - vortex.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < vortex.radius) {
          const influence = (1 - distance / vortex.radius) * vortex.strength;
          
          // Perpendicular force for rotation
          particle.vx += -dy / distance * influence * 0.01;
          particle.vy += dx / distance * influence * 0.01;
        }
      });
      
      // Apply velocity
      particle.vx *= velocityDamping;
      particle.vy *= velocityDamping;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;
      
      // Cycle colors
      if (config.useColorDiffusion && Math.random() < 0.01) {
        const nextColorIndex = (this.sectionColors.indexOf(particle.color) + 1) % this.sectionColors.length;
        particle.color = this.sectionColors[nextColorIndex];
      }
    });
  }
  
  // Render particles
  renderParticles() {
    const { ctx, particles, config, time } = this;
    const { particleOpacity, colorCycleSpeed } = config;
    
    // Clear canvas with blur for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw particles
    particles.forEach(particle => {
      // Cycle base colors over time for extra dimension
      const colorCycle = (time * colorCycleSpeed + particle.age * 0.01) % this.sectionColors.length;
      const colorIndex = Math.floor(colorCycle);
      const nextColorIndex = (colorIndex + 1) % this.sectionColors.length;
      const colorT = colorCycle - colorIndex;
      
      const color = lerpColor(
        this.sectionColors[colorIndex],
        this.sectionColors[nextColorIndex],
        colorT
      );
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)}, ${particleOpacity})`;
      ctx.fill();
    });
    
    // Apply blur if enabled
    if (config.blurAmount > 0) {
      ctx.filter = `blur(${config.blurAmount}px)`;
      ctx.drawImage(this.el, 0, 0);
      ctx.filter = 'none';
    }
  }
  
  // Animation loop
  animate(timestamp) {
    if (!this.isPlaying) return;
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.time += deltaTime;
    
    // Update simulation
    this.updateFlowField();
    this.updateVortices();
    this.updateParticles();
    
    // Render
    this.renderParticles();
    
    // Continue animation loop
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  // Play animation
  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.animate(this.lastTime);
    }
  }
  
  // Pause animation
  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  // Clean up resources
  destroy() {
    this.pause();
    window.removeEventListener('resize', this.resize);
    this.el.removeEventListener('mousemove', this.handleMouseMove);
    this.el.removeEventListener('mouseenter', this.handleMouseEnter);
    this.el.removeEventListener('mouseleave', this.handleMouseLeave);
  }
  
  // Get CSS variables from the element
  getCssVariables() {
    if (!this.el) return false;
    
    const style = getComputedStyle(this.el);
    const colors = [];
    
    for (let i = 1; i <= 4; i++) {
      const color = style.getPropertyValue(`--gradient-color-${i}`).trim();
      if (color && color.indexOf('#') !== -1) {
        colors.push(hexToRgb(color));
      }
    }
    
    if (colors.length === 4) {
      this.sectionColors = colors;
      return true;
    }
    
    return false;
  }
  
  // Initialize with CSS variables or default colors
  initWithCssVars(selector) {
    this.el = document.querySelector(selector);
    
    if (this.getCssVariables()) {
      this.initGradient(selector);
    } else {
      // Use default colors
      this.sectionColors = [
        '0x5820FF',
        '0x89CFF5',
        '0x49B5EF',
        '0x6B39FF'
      ].map(normalizeColor);
      
      this.initGradient(selector);
    }
    
    return this;
  }
}

// Export for use in browser and module environments
if (typeof window !== 'undefined') {
  window.QuantumFluidGradient = QuantumFluidGradient;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumFluidGradient;
}