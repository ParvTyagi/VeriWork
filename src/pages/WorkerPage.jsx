import RolePage from "./RolePage";
import { useVeriWork } from "../components/VeriWorkContext";

export default function WorkerPage() {
  const state = useVeriWork();

  return <RolePage role="Worker" {...state} />;
}
