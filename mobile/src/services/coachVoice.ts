import * as Speech from "expo-speech";

// Prefer the best installed voice (Enhanced/Premium) for the locale; the default one sounds robotic.
export async function pickVoice(locale: string): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Known male voices first (iOS names), then quality, then exact locale.
    const male = /rishi|daniel|aaron|arthur|alex|fred|oliver|gordon|reed|eddy|ene|ive|iod/i;
    const rank = (v: Speech.Voice) =>
      (male.test(v.name + v.identifier) ? 4 : 0) + (v.quality === Speech.VoiceQuality.Enhanced ? 2 : 0) + (v.language === locale ? 1 : 0);
    return voices
      .filter((v) => v.language.replace("_", "-").startsWith(locale.slice(0, 2)))
      .sort((x, y) => rank(y) - rank(x))[0]?.identifier;
  } catch {
    return undefined;
  }
}

/** Speaks one short coaching line in the deeper coach voice, replacing anything still being said. */
export async function sayCoach(text: string, hinglish = false): Promise<void> {
  const locale = hinglish ? "en-IN" : "en-US";  // Hinglish is Hindi written in English letters; the Indian-English voice reads it best
  const voice = await pickVoice(locale);
  Speech.stop();
  Speech.speak(text, { language: locale, voice, rate: 0.92, pitch: 0.75 });
}
