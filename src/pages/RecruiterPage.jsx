import RolePage from "./RolePage";
import { useVeriWork } from "../components/VeriWorkContext";

export default function RecruiterPage() {
  const state = useVeriWork();

  return <RolePage role="Recruiter" {...state} />;
}
