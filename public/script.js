// Child-friendly music composer interface
class PochiPochiComposer {
  constructor() {
    this.gridNotes = new Set(); // Store active grid positions
    this.selectedStickers = new Set();
    this.currentTempo = 112;
    this.currentKey = 'C';
    this.audioElement = null;
    
    this.initializeGrid();
    this.initializeControls();
  }
  
  initializeGrid() {
    const grid = document.getElementById('musicGrid');
    
    // Create 8x8 grid (rows = pitch levels, cols = time)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Add click handler
        cell.addEventListener('click', () => this.toggleGridCell(row, col, cell));
        
        grid.appendChild(cell);
      }
    }
  }
  
  initializeControls() {
    // Sticker selection
    document.querySelectorAll('.sticker').forEach(sticker => {
      sticker.addEventListener('click', () => this.toggleSticker(sticker));
    });
    
    // Tempo controls
    document.querySelectorAll('[data-tempo]').forEach(btn => {
      btn.addEventListener('click', () => this.setTempo(btn));
    });
    
    // Key controls
    document.querySelectorAll('[data-key]').forEach(btn => {
      btn.addEventListener('click', () => this.setKey(btn));
    });
  }
  
  toggleGridCell(row, col, cell) {
    const pos = `${row}-${col}`;
    
    if (this.gridNotes.has(pos)) {
      // Remove note
      this.gridNotes.delete(pos);
      cell.classList.remove('active');
      cell.textContent = '';
    } else {
      // Add note
      this.gridNotes.add(pos);
      cell.classList.add('active');
      cell.textContent = '♪';
      
      // Play a brief sound feedback (visual feedback for now)
      this.playNotePreview(row);
    }
    
    this.updateNotesInfo();
  }
  
  playNotePreview(row) {
    // Visual feedback for note placement
    // In a real implementation, this would play actual note sounds
    const pitches = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ', 'ド'];
    const noteName = pitches[7 - row]; // Invert row for higher pitch at top
    
    // Show brief note name feedback
    this.showBriefMessage(`${noteName}♪`, 500);
  }
  
  showBriefMessage(message, duration) {
    const existing = document.querySelector('.brief-message');
    if (existing) existing.remove();
    
    const msg = document.createElement('div');
    msg.className = 'brief-message';
    msg.textContent = message;
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4ECDC4;
      color: white;
      padding: 20px 40px;
      border-radius: 20px;
      font-size: 24px;
      z-index: 1000;
      animation: fadeInOut ${duration}ms ease;
    `;
    
    // Add keyframe animation
    if (!document.querySelector('#briefMessageStyle')) {
      const style = document.createElement('style');
      style.id = 'briefMessageStyle';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), duration);
  }
  
  toggleSticker(sticker) {
    const tag = sticker.dataset.tag;
    
    if (this.selectedStickers.has(tag)) {
      // Remove sticker
      this.selectedStickers.delete(tag);
      sticker.classList.remove('selected');
    } else if (this.selectedStickers.size < 3) {
      // Add sticker (max 3)
      this.selectedStickers.add(tag);
      sticker.classList.add('selected');
    } else {
      // Max stickers reached
      this.showBriefMessage('3つまでだよ！', 1000);
    }
  }
  
  setTempo(btn) {
    document.querySelectorAll('[data-tempo]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.currentTempo = parseInt(btn.dataset.tempo);
  }
  
  setKey(btn) {
    document.querySelectorAll('[data-key]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.currentKey = btn.dataset.key;
  }
  
  updateNotesInfo() {
    const count = this.gridNotes.size;
    const info = document.getElementById('notesInfo');
    
    if (count === 0) {
      info.textContent = 'タップして おんぷを おいてね！';
    } else {
      info.textContent = `${count}この おんぷが あるよ！`;
    }
  }
  
  // Convert grid notes to melody format expected by backend
  createMelodyData() {
    const notes = [];
    const baseNote = this.currentKey === 'C' ? 60 : this.currentKey === 'G' ? 67 : 65; // C4, G4, F4
    
    for (const pos of this.gridNotes) {
      const [row, col] = pos.split('-').map(Number);
      const pitch = baseNote + (7 - row); // Higher row = higher pitch
      const start = col * 0.5; // Each column is 0.5 seconds
      const duration = 0.4; // Slightly shorter than grid timing
      
      notes.push({ pitch, start, duration, velocity: 96 });
    }
    
    // Sort by start time
    notes.sort((a, b) => a.start - b.start);
    
    return {
      ppq: 480,
      length: Math.max(4, Math.max(...notes.map(n => n.start + n.duration))),
      notes
    };
  }
  
  async createMusic() {
    if (this.gridNotes.size === 0) {
      this.showBriefMessage('おんぷを おいてね！', 1500);
      return;
    }
    
    // Show loading
    document.getElementById('compose-section').classList.add('hidden');
    document.getElementById('loading-section').classList.remove('hidden');
    
    try {
      const melody = this.createMelodyData();
      const tags = Array.from(this.selectedStickers);
      
      // Map tags to attributes
      const response = await fetch('/api/map-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create music');
      }
      
      const result = await response.json();
      
      // Simulate music generation time (3 second target from SRS)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success
      this.showPlaybackSection(result);
      
    } catch (error) {
      console.error('Error creating music:', error);
      this.showError();
    }
  }
  
  showPlaybackSection(musicData) {
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('playback-section').classList.remove('hidden');
    
    // Store music data for playback
    this.currentMusicData = musicData;
    
    // Show success message
    this.showBriefMessage('できた〜！', 1500);
  }
  
  showError() {
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('compose-section').classList.remove('hidden');
    this.showBriefMessage('ちょっと まってね〜', 2000);
  }
  
  playMusic() {
    // In a real implementation, this would play the generated audio
    this.showBriefMessage('♪ おんがく さいせいちゅう ♪', 3000);
    
    // Simulate playback
    setTimeout(() => {
      this.showBriefMessage('おわったよ〜！', 1000);
    }, 3000);
  }
  
  stopMusic() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.showBriefMessage('とまったよ！', 1000);
  }
  
  createAgain() {
    // Reset to composition interface
    document.getElementById('playback-section').classList.add('hidden');
    document.getElementById('compose-section').classList.remove('hidden');
    this.showBriefMessage('また つくろう！', 1000);
  }
}

// Global functions for button clicks
function createMusic() {
  composer.createMusic();
}

function playMusic() {
  composer.playMusic();
}

function stopMusic() {
  composer.stopMusic();
}

function createAgain() {
  composer.createAgain();
}

// Initialize when page loads
let composer;
document.addEventListener('DOMContentLoaded', () => {
  composer = new PochiPochiComposer();
});
