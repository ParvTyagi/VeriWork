import { Outlet, useNavigate } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";
import { AppShell } from "../components/VeriWorkShell";
import { useVeriWork } from "../components/VeriWorkContext";

export default function VeriWorkLayout() {
  const navigate = useNavigate();
  const {
    account,
    isAdmin,
    toast,
    wrongNetwork,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useVeriWork();

  return (
    <AppShell
      account={account}
      isAdmin={isAdmin}
      onConnect={() => connectWallet(true, navigate)}
      onDisconnect={() => disconnectWallet(navigate)}
      themeToggle={<ThemeToggle />}
      wrongNetwork={wrongNetwork}
      onSwitchNetwork={switchToSepolia}
      toast={toast}
    >
      <Outlet />
    </AppShell>
  );
}
