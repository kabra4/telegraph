import i18n from "i18n";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

i18n.configure({
  locales: ["en", "ru", "uz"],
  defaultLocale: "en",
  queryParameter: "lang",
  directory: __dirname + "/locales",
  //   directory: path.join("./", "locales"),

  api: {
    __: "translate",

    __n: "translateN",
  },
});

export default i18n;
