import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';

const openContext = createContext(false);

type ToggleOpen = () => void;
const toggleOpenContext = createContext<ToggleOpen | undefined>(
  undefined,
);
const itemIdContext = createContext<string | undefined>(undefined);

export const useOpen = (): boolean => useContext(openContext);

export const useToggleOpen = (): ToggleOpen => {
  const toggleOpen = useContext(toggleOpenContext);
  if (!toggleOpen) {
    throw new Error(
      'useToggleOpen must be used within AccordionProvider',
    );
  }
  return toggleOpen;
};

export const useItemId = (): string => {
  const id = useContext(itemIdContext);
  if (!id) {
    throw new Error(
      'useItemId must be used within AccordionProvider',
    );
  }
  return id;
};

export const AccordionItemProvider: FC<
  PropsWithChildren<{
    defaultOpen?: boolean;
    id: string;
  }>
> = ({ defaultOpen = false, id, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  const toggleOpen = useCallback(() => {
    setOpen((open) => !open);
  }, []);

  return (
    <openContext.Provider value={open}>
      <toggleOpenContext.Provider value={toggleOpen}>
        <itemIdContext.Provider value={id}>
          {children}
        </itemIdContext.Provider>
      </toggleOpenContext.Provider>
    </openContext.Provider>
  );
};
