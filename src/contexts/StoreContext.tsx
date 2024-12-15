import React, { useMemo, useState } from "react";
import Registration from "@/models/RegistrationModel";

const StoreContext = React.createContext<{
  registration: Registration | undefined;
  setRegistration: (registration: Registration) => void;
  setStep: (step: number) => void;
  step: number;
}>({
  registration: undefined,
  setRegistration: () => false,
  setStep: () => false,
  step: 1,
});

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<Registration>();
  const [step, setStep] = useState(1);

  const providerValue = useMemo(
    () => ({
      setRegistration,
      registration,
      step,
      setStep,
    }),
    [setRegistration, setStep, step, registration]
  );

  return <StoreContext.Provider value={providerValue}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return React.useContext(StoreContext);
}
