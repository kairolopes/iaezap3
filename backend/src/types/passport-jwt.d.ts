declare module 'passport-jwt' {
  export function ExtractJwt(): any
  export class Strategy {
    constructor(options: any, verify: any)
  }
}
