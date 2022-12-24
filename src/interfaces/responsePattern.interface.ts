export interface ResponsePattern {
  statusCode: number;
  message: string;
  data?: Array<any>;
  error?: string;
}
