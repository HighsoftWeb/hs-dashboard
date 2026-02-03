export function hsCriptografa(texto: string): string {
  let textoCriptografado = "";

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    const charCode = char.charCodeAt(0);
    const posicao = i + 1;

    if (posicao % 2 === 1) {
      textoCriptografado += String.fromCharCode(charCode - 13);
    } else {
      textoCriptografado += String.fromCharCode(charCode + 9);
    }
  }

  return textoCriptografado;
}

export function hsDesCriptografa(texto: string): string {
  let textoDesCriptografado = "";

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    const charCode = char.charCodeAt(0);
    const posicao = i + 1;

    if (posicao % 2 === 1) {
      textoDesCriptografado += String.fromCharCode(charCode + 13);
    } else {
      textoDesCriptografado += String.fromCharCode(charCode - 9);
    }
  }

  return textoDesCriptografado;
}
