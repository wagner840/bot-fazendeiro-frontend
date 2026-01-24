declare module 'inputmask' {
  export default class Inputmask {
    constructor(mask: string | object);
    mask(selector: string | HTMLElement): void;
  }
}
