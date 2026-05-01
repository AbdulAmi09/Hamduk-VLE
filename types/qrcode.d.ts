declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high'
    type?: 'image/png' | 'image/jpeg' | 'image/webp'
    quality?: number
    margin?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  export interface QRCodeToStringOptions extends QRCodeToDataURLOptions {
    type?: 'terminal' | 'svg'
  }

  export interface QRCodeToCanvasOptions extends QRCodeToDataURLOptions {
    width?: number
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
  export function toString(text: string, options?: QRCodeToStringOptions): Promise<string>
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeToCanvasOptions): Promise<void>
}
