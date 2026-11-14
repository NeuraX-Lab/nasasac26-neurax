const Hardware = lazy(() =>
  import("../features/hardware/Hardware").then((m) => ({
    default: m.Hardware,
  })),
);
import { useEffect, Suspense, lazy } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../core/state";
import { Header } from "./layouts/Header";
import { Entry } from "../features/sample-selection/Entry";
import { Setup } from "../features/area-setup/Setup";
import { Workspace } from "./layouts/Workspace";
export default function App() {
  const { t, i18n } = useTranslation();
  const { storageError } = useApp();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      {storageError && (
        <div role="status" className="storage-notice">
          {t("storageError")}
        </div>
      )}
      <Suspense
        fallback={
          <div className="loading-state" role="status">
            {t("loading")}
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Entry />} />
          <Route path="/hardware" element={<Hardware />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/setup/:id" element={<Setup />} />
          <Route path="/w/:id/:mode" element={<Workspace />} />
          <Route
            path="*"
            element={
              <>
                <Header />
                <main id="main" className="center-message">
                  <h1>404</h1>
                  <Link to="/">{t("back")}</Link>
                </main>
              </>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
