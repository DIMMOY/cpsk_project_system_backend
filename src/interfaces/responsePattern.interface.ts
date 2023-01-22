export interface ResponsePattern {
  statusCode: number;
  message: string;
  data?: any;
  error?: string;
}
