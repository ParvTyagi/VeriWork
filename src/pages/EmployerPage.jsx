import RolePage from "./RolePage";
import { useVeriWork } from "../components/VeriWorkContext";

export default function EmployerPage() {
  const state = useVeriWork();

  return <RolePage role="Employer" {...state} />;
}
