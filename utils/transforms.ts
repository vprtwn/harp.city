import Tone from "tone";
import chroma from "chroma-js";

export const CANVAS_HEIGHT = 1800;
export const CANVAS_WIDTH = 2000;
export const CELL_HEIGHT = 100;
export const CELL_WIDTH = 50;
const FIRST_MIDI_NOTE = 52; // F3

export const yToM = (y: number): number => {
  return (CANVAS_HEIGHT - y) / CELL_HEIGHT + FIRST_MIDI_NOTE;
};

export const yToStringY = (y: number): number => {
  return y + 0.5 * CELL_HEIGHT - 5;
};

export const yToFreq = (y: number): number => {
  const midi = yToM(y);
  return Tone.Frequency(midi, "midi").toFrequency();
};

export const xToSep = (x: number): number => {
  return (x / CANVAS_HEIGHT) * 500 + 10;
};

export const xToS = (x: number): number => {
  return x / 100.0 + 0.5;
};

export const mToNote = (midi: number): string => {
  let decimal = midi % 1;
  let base = midi - decimal;
  if (decimal > 0.5) {
    base = base + 1;
    decimal = -(1 - decimal);
  }
  return Tone.Frequency(base, "midi").toNote();
};

export const mToMicroSym = (midi: number): string | null => {
  let decimal = midi % 1;
  let base = midi - decimal;
  if (decimal > 0.5) {
    base = base + 1;
    decimal = -(1 - decimal);
  }
  if (decimal.toFixed(2) === "0.00") {
    return;
  } else if (decimal > 0) {
    if (decimal < 0.16667) {
      return "↑";
    } else if (decimal < 0.33333) {
      return "↑↑";
    } else {
      return "↑↑↑";
    }
  } else {
    if (decimal > -0.16667) {
      return "↓";
    } else if (decimal > -0.33333) {
      return "↓↓";
    } else {
      return "↓↓↓";
    }
  }
};

export const mToColor = (midi: number): string => {
  // synth wave palette: https://www.color-hex.com/color-palette/57266
  const scale = chroma.scale(["#ffd319", "#ff901f", "#ff2975", "#f222ff", "#8c1eff"]);
  const hex = scale((midi % 12) / 12).hex();
  return hex;
};
