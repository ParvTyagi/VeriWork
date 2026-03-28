import RolePage from "./RolePage";
import { useVeriWork } from "../components/VeriWorkContext";

export default function AdminPage() {
  const state = useVeriWork();

  return <RolePage role="Admin" {...state} />;
}
