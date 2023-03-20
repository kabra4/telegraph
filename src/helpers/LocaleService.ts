/**

 * LocaleService

 */

// import i18n from "i18n";
import { I18n } from "i18n";
import i18n from "../configs/i18n.config";

export class LocaleService {
    private static _instance: LocaleService;

    public static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this(i18n));
    }
    i18nProvider: I18n;
    /**
   
     *
  
     * @param i18nProvider The i18n provider
  
     */

    constructor(i18nProvider: I18n) {
        this.i18nProvider = i18nProvider;
    }

    /**
  
     *
  
     * @returns {string} The current locale code
  
     */

    getCurrentLocale() {
        return this.i18nProvider.getLocale();
    }

    /**
  
     *
  
     * @returns string[] The list of available locale codes
  
     */

    getLocales() {
        return this.i18nProvider.getLocales();
    }

    /**
  
     *
  
     * @param locale The locale to set. Must be from the list of available locales.
  
     */

    setLocale(locale: string) {
        if (this.getLocales().indexOf(locale) !== -1) {
            this.i18nProvider.setLocale(locale);
        }
    }

    /**
  
     *
  
     * @param string String to translate
  
     * @param args Extra parameters
  
     * @returns {string} Translated string
  
     */

    __(text: string, args: any | undefined = undefined) {
        return this.i18nProvider.__(text, args);
    }

    /**
  
     *
  
     * @param phrase Object to translate
  
     * @param count The plural number
  
     * @returns {string} Translated string
  
     */

    __n(phrase: string, count: number) {
        return this.i18nProvider.__n(phrase, count);
    }
}
