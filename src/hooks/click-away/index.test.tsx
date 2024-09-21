import { fireEvent, render } from '@testing-library/react';
import { useClickAway } from '.';
import { FC } from 'react';

const OutsideClicker: FC<{
  callback: () => void;
}> = ({ callback }: { callback: () => void }) => {
  const ref = useClickAway<HTMLDivElement>(callback);
  return (
    <>
      <div ref={ref}>Element</div>
      <div>Outside</div>
    </>
  );
};

describe('useClickAway', () => {
  it('領域外を触るとcallbackが呼び出される', () => {
    const fn = vi.fn();

    const { getByText } = render(<OutsideClicker callback={fn} />);
    const element = getByText('Element');
    const outsideElement = getByText('Outside');

    const click = (el: Node) => {
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
    };

    expect(fn).not.toHaveBeenCalled();

    click(element);
    expect(fn).not.toHaveBeenCalled();

    click(outsideElement);
    expect(fn).toHaveBeenCalledOnce();

    click(document.body);
    expect(fn).toHaveBeenCalledTimes(2);

    click(document);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
