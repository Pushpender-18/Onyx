import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MasterModule", (m) => {
  const master = m.contract("Master");
  return { master };
});