import { createContext, useContext, useState, type ReactNode } from "react";

type Modal = null | "login" | "register" | "terms" | "privacy" | "journey" | "team" | "partner";

type UIState = {
  modal: Modal;
  modalData: any;
  openLogin: () => void;
  openRegister: () => void;
  openTerms: () => void;
  openPrivacy: () => void;
  openJourney: (data: any) => void;
  openTeam: (data: any) => void;
  openPartner: (data: any) => void;
  close: () => void;
};

const Ctx = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal>(null);
  const [modalData, setModalData] = useState<any>(null);

  const open = (m: Modal, data: any = null) => { setModal(m); setModalData(data); };

  return (
    <Ctx.Provider value={{
      modal, modalData,
      openLogin: () => open("login"),
      openRegister: () => open("register"),
      openTerms: () => open("terms"),
      openPrivacy: () => open("privacy"),
      openJourney: (d) => open("journey", d),
      openTeam: (d) => open("team", d),
      openPartner: (d) => open("partner", d),
      close: () => { setModal(null); setModalData(null); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUI() {
  const c = useContext(Ctx);
  if (!c) throw new Error("UIProvider missing");
  return c;
}
