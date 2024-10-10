import { throttle } from "lodash";

class ScreenshotService {
  private captureFunction: (() => string) | null = null;

  setCaptureFunction(func: () => string) {
    this.captureFunction = func;
  }

  captureScreenshot = throttle(() => {
    if (this.captureFunction) {
      return this.captureFunction();
    }
    return null;
  }, 1000); // Throttle to once per second
}

export const screenshotService = new ScreenshotService();
