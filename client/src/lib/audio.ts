import * as Tone from 'tone';

export class AudioEngine {
  private static instance: AudioEngine;
  private initialized = false;
  private players: Map<string, Tone.Player> = new Map();
  private tracks: Map<number, Tone.Channel> = new Map();
  public transport = Tone.getTransport();
  public masterVolume = new Tone.Volume(0).toDestination();

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await Tone.start();
      this.transport.bpm.value = 128;
      this.initialized = true;
      console.log('Audio engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  async loadSample(sampleId: string, url: string): Promise<Tone.Player> {
    try {
      const player = new Tone.Player(url).connect(this.masterVolume);
      await player.load();
      this.players.set(sampleId, player);
      return player;
    } catch (error) {
      console.error(`Failed to load sample ${sampleId}:`, error);
      throw error;
    }
  }

  async previewSample(sampleId: string, url?: string) {
    try {
      let player = this.players.get(sampleId);
      
      if (!player && url) {
        player = await this.loadSample(sampleId, url);
      }
      
      if (player) {
        player.start();
      }
    } catch (error) {
      console.error(`Failed to preview sample ${sampleId}:`, error);
    }
  }

  createTrackChannel(trackId: number): Tone.Channel {
    const channel = new Tone.Channel().connect(this.masterVolume);
    this.tracks.set(trackId, channel);
    return channel;
  }

  getTrackChannel(trackId: number): Tone.Channel | undefined {
    return this.tracks.get(trackId);
  }

  updateTrackVolume(trackId: number, volume: number) {
    const channel = this.tracks.get(trackId);
    if (channel) {
      // Convert 0-100 to -60dB to 0dB
      const dbValue = volume === 0 ? -Infinity : (volume - 100) * 0.6;
      channel.volume.value = dbValue;
    }
  }

  updateTrackPan(trackId: number, pan: number) {
    const channel = this.tracks.get(trackId);
    if (channel) {
      // Convert 0-100 to -1 to 1
      const panValue = (pan - 50) / 50;
      channel.pan.value = panValue;
    }
  }

  muteTrack(trackId: number, muted: boolean) {
    const channel = this.tracks.get(trackId);
    if (channel) {
      channel.mute = muted;
    }
  }

  soloTrack(trackId: number, soloed: boolean) {
    const channel = this.tracks.get(trackId);
    if (channel) {
      channel.solo = soloed;
    }
  }

  play() {
    this.transport.start();
  }

  pause() {
    this.transport.pause();
  }

  stop() {
    this.transport.stop();
    this.transport.position = 0;
  }

  setBPM(bpm: number) {
    this.transport.bpm.value = bpm;
  }

  scheduleStep(time: string, callback: () => void) {
    this.transport.schedule(callback, time);
  }

  dispose() {
    this.players.forEach(player => player.dispose());
    this.tracks.forEach(channel => channel.dispose());
    this.players.clear();
    this.tracks.clear();
  }
}

export const audioEngine = AudioEngine.getInstance();
