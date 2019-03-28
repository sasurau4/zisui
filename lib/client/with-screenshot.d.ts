import { ScreenShotOptions } from "./types";
export interface WithScreenshot {
    <T = Function>(options?: Partial<ScreenShotOptions>): T;
}
declare let withScreenshot: WithScreenshot;
export { withScreenshot };
