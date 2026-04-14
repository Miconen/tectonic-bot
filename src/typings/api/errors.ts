// Domain error from TectonicError
export type TectonicError = {
  code: number;
  message: string;
};

// RFC 7807 Problem Details (Huma validation errors)
export type RFC7807Error = {
  $schema?: string;
  status: number;
  title: string;
  detail: string;
  errors?: RFC7807ErrorDetail[];
};

export type RFC7807ErrorDetail = {
  message: string;
  location: string;
  value: unknown;
};

export type ErrorResponse = {
  error: true;
  status: number;
} & TectonicError;

export type SuccessResponse<T> = {
  error: false;
  status: number;
  data: T;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
