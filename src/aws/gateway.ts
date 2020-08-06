// export type AsResponse<T> = {
//   [P in keyof T]?: T[P];
// } & {
//   statusCode: number;
//   headers?: Record<string, any>;
//   body: string;
// };

export type AsResponse<T> = {
  statusCode: number;
  headers?: Record<string, any>;
  body: string;
};

export type PreResponse<T> = {
  statusCode: number;
  headers?: Record<string, any>;
  body: T;
};

export const asJson = <T>(params: T): AsResponse<T> => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(params),
});

export const asSuccess = (message: string) => () => ({
  statusCode: 200,
  body: JSON.stringify({
    message,
  }),
});

export const asError = (scope: string) => (e: any) => {
  const { message = "Unknown error", statusCode = 500 } = e;
  console.log(`${scope} error:`, e);
  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

export const response = <T>(params: AsResponse<T>) => ({
  ...params,
  body: JSON.stringify(params.body),
});

export const pipeFail = (
  statusCode: number,
  message: string,
  error: any = { message: "" },
  ...context: any[]
) => {
  console.log(statusCode, message, error, context);
  return {
    ...error,
    message: `${message} ${error && error.message}`.trim(),
    statusCode: statusCode,
  };
};
