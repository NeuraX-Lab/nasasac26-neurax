import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Sprout, Globe2 } from "lucide-react";
export function Header() {
  const { t, i18n } = useTranslation();
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="brand-symbol">
          <Sprout size={24} />
        </span>
        Agro<span>Twin</span>
      </Link>
      <span className="header-divider" />
      <nav className="product-nav" aria-label="AgroTwin">
        <Link to="/fieldshift-v2">FieldShift v2</Link>
        <Link to="/">{t("fields")}</Link>
        <Link to="/hardware">{t("hardware")}</Link>
      </nav>
      <div className="header-right">
        <span className="demo-indicator">
          <span />
          {t("demo")}
        </span>
        <button
          className="language-switch"
          onClick={() => {
            const lng = i18n.language === "en" ? "vi" : "en";
            void i18n.changeLanguage(lng);
            document.documentElement.lang = lng;
            try {
              localStorage.setItem("agrotwin-language", lng);
            } catch {
              /* session only */
            }
          }}
          aria-label="English / Tiếng Việt"
        >
          <Globe2 size={15} />
          English<span>/ Tiếng Việt</span>
        </button>
      </div>
    </header>
  );
}
