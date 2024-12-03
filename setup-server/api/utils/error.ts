class CustomError extends Error {
  constructor(errMessage: string, code?: number) {
    throw super(
      JSON.stringify({
        errMessage,
        code: code || 400,
      })
    );
  }
}

export default CustomError;
