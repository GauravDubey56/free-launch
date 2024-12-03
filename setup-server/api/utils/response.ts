import { Response } from "express";
const sendResponse = (res: Response, response: apiResponse) => {
  if (response.redirectUrl && process.env.REDIRECT_GITHUB) {
    res.redirect(response.redirectUrl);
  } else {
    res.status(response.statusCode).json({
      message: response.message || "",
      redirectTo: response.redirectUrl,
      data: response.data || null,
      ...(response.error && {
        exception: response.error,
      }),
    });
  }
};
export default sendResponse;
