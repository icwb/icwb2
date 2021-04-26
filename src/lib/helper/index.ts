export namespace Random {

  export function Floor(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  export function Ceil(min: number, max: number) {
    return Math.ceil(Math.random() * (max - min)) + min;
  }

  export function Round(min: number, max: number) {
    return Math.round(Math.random() * (max - min)) + min;
  }
  
}
