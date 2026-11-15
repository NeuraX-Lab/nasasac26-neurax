import { Navigate, useParams } from "react-router-dom";
import { Dashboard } from "../../features/dashboard/Dashboard";
export function Workspace() {
  const { id = "my-thanh", mode = "farmer" } = useParams();
  if (mode !== "farmer") return <Navigate to={`/w/${id}/farmer`} replace />;
  return <Dashboard key={id} id={id} />;
}
