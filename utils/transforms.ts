import Tone from "tone";

const CANVAS_HEIGHT = 3000;
const CELL_HEIGHT = 50.0;
const FIRST_MIDI_NOTE = 36; // C2

export const pxToMidi = (px: number): number => {
  return (CANVAS_HEIGHT - px) / CELL_HEIGHT + FIRST_MIDI_NOTE;
};

export const midiToTuningSymbol = (midi: number): string | null => {
  let decimal = midi % 1;
  let base = midi - decimal;
  if (decimal > 0.5) {
    base = base + 1;
    decimal = -(1 - decimal);
  }
  if (decimal.toFixed(2) === "0.00") {
    return;
  } else if (decimal > 0) {
    if (decimal < 0.1666) {
      return "↑";
    } else if (decimal < 0.3333) {
      return "↑↑";
    } else {
      return "↑↑↑";
    }
  } else {
    if (decimal > -0.1666) {
      return "↓";
    } else if (decimal > -0.3333) {
      return "↓↓";
    } else {
      return "↓↓↓";
    }
  }
};

export const midiToName = (midi: number): string => {
  let decimal = midi % 1;
  let base = midi - decimal;
  if (decimal > 0.5) {
    base = base + 1;
    decimal = -(1 - decimal);
  }
  return Tone.Frequency(base, "midi").toNote();
};
