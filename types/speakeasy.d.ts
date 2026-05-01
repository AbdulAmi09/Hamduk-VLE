declare module 'speakeasy' {
  export interface SecretResult {
    ascii: string
    hex: string
    base32: string
    qr_code_ascii: string
    qr_code_hex: string
    qr_code_url: string
    otpauth_url: string
  }

  export interface VerifyOptions {
    secret: string
    encoding?: string
    token: string
    window?: number
  }

  export function generateSecret(options?: {
    name?: string
    issuer?: string
    length?: number
  }): SecretResult

  export function totp(options: {
    secret: string
    encoding?: string
  }): string

  export function verify(options: VerifyOptions): boolean | null

  const speakeasy: {
    generateSecret(options?: {
      name?: string
      issuer?: string
      length?: number
    }): SecretResult
    totp(options: {
      secret: string
      encoding?: string
    }): string
    verify(options: VerifyOptions): boolean | null
  }

  export default speakeasy
}
