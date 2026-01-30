export interface RespostaApi<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, string | number | boolean>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string | number | boolean>;
  };
}

export interface RespostaErro {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string | number | boolean>;
  };
}

export interface RespostaSucesso<T> {
  success: true;
  data: T;
  meta?: Record<string, string | number | boolean>;
}
