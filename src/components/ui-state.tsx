import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Modal = null | "login" | "register" | "terms" | "privacy" | "journey" | "team" | "partner";
type ModalData = unknown;

type UIState = {
  modal: Modal;
  modalData: ModalData;
  openLogin: () => void;
  openRegister: () => void;
  openTerms: () => void;
  openPrivacy: () => void;
  openJourney: (data: ModalData) => void;
  openTeam: (data: ModalData) => void;
  openPartner: (data: ModalData) => void;
  close: () => void;
};

const Ctx = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal>(null);
  const [modalData, setModalData] = useState<ModalData>(null);

  const open = useCallback((m: Modal, data: ModalData = null) => {
    setModal(m);
    setModalData(data);
  }, []);

  const close = useCallback(() => {
    setModal(null);
    setModalData(null);
  }, []);

  const value = useMemo<UIState>(
    () => ({
      modal,
      modalData,
      openLogin: () => open("login"),
      openRegister: () => open("register"),
      openTerms: () => open("terms"),
      openPrivacy: () => open("privacy"),
      openJourney: (data) => open("journey", data),
      openTeam: (data) => open("team", data),
      openPartner: (data) => open("partner", data),
      close,
    }),
    [close, modal, modalData, open],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useUI() {
  const c = useContext(Ctx);
  if (!c) throw new Error("UIProvider missing");
  return c;
}
