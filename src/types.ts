export interface PriceAlert {
    userId: number;
    symbol: string;
    targetPrice: number;
    isAbove: boolean;
  }
  
  export interface CryptoPrice {
    symbol: string;
    price: number;
  }