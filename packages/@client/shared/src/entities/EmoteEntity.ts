export interface EmoteEntity {
  src: {
    '1.0x': string;
    '2.0x': string;
    '3.0x'?: string;
    '4.0x'?: string;
  };
  isZeroWidth?: boolean;
  width?: number;
  height?: number;
}
