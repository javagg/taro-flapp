import { create, Font } from 'fontkit';
import { Buffer } from 'buffer';
export * from  'fontkit'

export const loadFont = (data: ArrayBuffer | Uint8Array, familynameAlias?: string) => {
    const { familyName } = create(Buffer.from(data as ArrayBuffer)) as Font
    const font = new FontFace(familyName, data);
    font.load();
    document.fonts.add(font);
    return { familyName };
  };
  