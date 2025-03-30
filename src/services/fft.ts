"use strict";

interface Complex {
  re: number;
  im: number;
}

function addComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

function subtractComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re - b.re,
    im: a.im - b.im,
  };
}

function multiplyComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function expTerm(k: number, n: number): Complex {
  const angle = (-2 * Math.PI * k) / n;
  return { re: Math.cos(angle), im: Math.sin(angle) };
}

function fft(signal: Complex[]): Complex[] {
  const N = signal.length;
  if (N <= 1) return signal;

  if ((N & (N - 1)) !== 0) {
    throw new Error("Signal length must be a power of 2.");
  }

  const evens: Complex[] = [];
  const odds: Complex[] = [];
  for (let i = 0; i < N; i++) {
    if (i % 2 === 0) {
      evens.push(signal[i]);
    } else {
      odds.push(signal[i]);
    }
  }

  const fftEvens = fft(evens);
  const fftOdds = fft(odds);

  const combined: Complex[] = new Array(N);
  for (let k = 0; k < N / 2; k++) {
    const factor = expTerm(k, N);
    const t = multiplyComplex(factor, fftOdds[k]);
    combined[k] = addComplex(fftEvens[k], t);
    combined[k + N / 2] = subtractComplex(fftEvens[k], t);
  }
  return combined;
}

function computeFFT(samplingFrequency: number, magnitudes: number[]): { fft: Complex[]; frequencies: number[] } {
  const N = magnitudes.length;
  if ((N & (N - 1)) !== 0) {
    throw new Error("The length of magnitudes must be a power of 2.");
  }

  // Convert the real signal to an array of complex numbers.
  const complexSignal: Complex[] = magnitudes.map((m) => ({ re: m, im: 0 }));

  // Compute the FFT of the complex signal.
  const fftResult = fft(complexSignal);

  // Calculate frequency bins where for each index i, the frequency is (i * samplingFrequency) / N.
  const frequencies = fftResult.map((_, i) => (samplingFrequency * i) / N);

  return { fft: fftResult, frequencies };
}

export { computeFFT };
export type { Complex };