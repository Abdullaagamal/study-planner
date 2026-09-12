import { dirname } from "path";
import { fileURLToPath } from "url";
import eslintConfigNext from "eslint-config-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default eslintConfigNext;