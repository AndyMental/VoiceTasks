export class AudioPlayer {
    private audioContext: AudioContext | null = null;
    private isPlaying = false;
    private queue: Float32Array[] = [];
    private nextStartTime = 0;
    private activeSources: AudioBufferSourceNode[] = [];

    constructor() {
        // Initialize lazily on first interaction if possible, or here
    }

    private init() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    play(pcm16: Int16Array) {
        this.init();
        if (!this.audioContext) return;

        // Convert Int16 -> Float32
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768;
        }

        const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        const currentTime = this.audioContext.currentTime;
        // Schedule slightly ahead to prevent gaps if we have a stream
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime + 0.05; // small buffer
        }

        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;

        this.activeSources.push(source);
        source.onended = () => {
            this.activeSources = this.activeSources.filter(s => s !== source);
        };
    }

    stop() {
        this.activeSources.forEach(s => {
            try {
                s.stop();
            } catch (e) {
                // ignore if already stopped
            }
        });
        this.activeSources = [];
        this.nextStartTime = 0;
    }

    reset() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
