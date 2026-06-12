
// OFFICIAL WHO DATA - HEAD CIRCUMFERENCE (Perímetro Cefálico)
// Z-Scores -2 (Microcefalia) and +2 (Macrocefalia)
// Valores em centímetros (cm)
export const WHO_HEAD_DATA = {
  // FEMALE (Meninas)
  F: {
    '0-2': [
      { age: 0, zNeg2: 31.5, zPos2: 36.2 }, // Ao nascer
      { age: 0.5, zNeg2: 39.5, zPos2: 43.0 }, // 6 meses
      { age: 1.0, zNeg2: 43.4, zPos2: 47.3 }, // 1 ano
      { age: 1.5, zNeg2: 44.6, zPos2: 48.9 }, // 1 ano e 6 meses
      { age: 2.0, zNeg2: 45.4, zPos2: 50.0 }  // 2 anos
    ],
    '2-5': [
      { age: 2, zNeg2: 45.4, zPos2: 50.0 }, // 2 anos
      { age: 3, zNeg2: 46.4, zPos2: 51.4 }, // 3 anos
      { age: 4, zNeg2: 47.0, zPos2: 52.3 }, // 4 anos
      { age: 5, zNeg2: 47.4, zPos2: 52.8 }  // 5 anos
    ]
  },
  // MASCULINE (Meninos)
  M: {
    '0-2': [
      { age: 0, zNeg2: 31.9, zPos2: 37.0 }, // Ao nascer
      { age: 0.5, zNeg2: 40.5, zPos2: 44.3 }, // 6 meses
      { age: 1.0, zNeg2: 44.5, zPos2: 48.7 }, // 1 ano
      { age: 1.5, zNeg2: 45.8, zPos2: 50.3 }, // 1 ano e 6 meses
      { age: 2.0, zNeg2: 46.5, zPos2: 51.2 }  // 2 anos
    ],
    '2-5': [
      { age: 2, zNeg2: 46.5, zPos2: 51.2 }, // 2 anos
      { age: 3, zNeg2: 47.5, zPos2: 52.5 }, // 3 anos
      { age: 4, zNeg2: 48.1, zPos2: 53.4 }, // 4 anos
      { age: 5, zNeg2: 48.5, zPos2: 53.9 }  // 5 anos
    ]
  }
};
