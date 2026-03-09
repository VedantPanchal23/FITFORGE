import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Professional UI Sound Placeholders (Can be replaced with `require('../../assets/sounds/...')`)
const SOUND_FILES = {
    complete: 'https://cors-anywhere.herokuapp.com/https://actions.google.com/sounds/v1/ui/button_rollover.ogg',
    debt: 'https://cors-anywhere.herokuapp.com/https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
};

class SoundEngine {
    constructor() {
        this.enabled = true;
        this.isReady = false;
    }

    async init() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
            this.isReady = true;
            console.log('[SoundEngine] Init complete');
        } catch (error) {
            console.warn('[SoundEngine] Init failed', error);
        }
    }

    play(type) {
        if (!this.enabled) return;

        // 1. Zero-latency tactile feedback
        try {
            switch (type) {
                case 'complete':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'debt':
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                case 'streak':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                default:
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
            }
        } catch (e) {
            // Haptics failed on this device
        }

        // 2. Asynchronous Audio layering (fire-and-forget to prevent UI lag)
        if (this.isReady && SOUND_FILES[type]) {
            Audio.Sound.createAsync(
                { uri: SOUND_FILES[type] },
                { shouldPlay: true }
            ).then(({ sound }) => {
                sound.setOnPlaybackStatusUpdate(status => {
                    if (status.didJustFinish) {
                        sound.unloadAsync();
                    }
                });
            }).catch(e => {
                // Ignore audio fetch failures (e.g. offline, CORS) so we don't spam console
            });
        }
    }
}

export default new SoundEngine();
