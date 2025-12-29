export class AudioRecorder {
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private onAudioData: ((data: Int16Array) => void) | null = null;

    constructor(onAudioData: (data: Int16Array) => void) {
        this.onAudioData = onAudioData;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 24000, // Try to ask for 24kHz
                    echoCancellation: true
                }
            });

            this.audioContext = new AudioContext({ sampleRate: 24000 });
            this.source = this.audioContext.createMediaStreamSource(this.stream);

            // Buffer size 4096 is a good balance
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 to Int16
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                if (this.onAudioData) {
                    this.onAudioData(pcm16);
                }
            };

            this.source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    }

    stop() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor.onaudioprocess = null;
        }
        if (this.source) {
            this.source.disconnect();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }

        this.processor = null;
        this.source = null;
        this.stream = null;
        this.audioContext = null;
    }
}
