import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setPublicDir(path.resolve(process.cwd(), "../commercial-assets"));
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
