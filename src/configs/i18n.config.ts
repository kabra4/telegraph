import i18n from "i18n";
// get root directory
import path from "path";
const __dirname = path.resolve();

i18n.configure({
  locales: ["en", "ru", "uz"],
  defaultLocale: "en",
  // queryParameter: "lang",
  directory: path.join(__dirname, "locales"),
  // directory: __dirname + "/locales",
  //   directory: path.join("./", "locales"),
  objectNotation: true,
  api: {
    __: "translate",

    __n: "translateN",
  },
});

export default i18n;
