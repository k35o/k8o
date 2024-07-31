export const TextTag = ({ text }: { text: string }) => {
  return (
    <span className="inline-block rounded-full bg-bgBase px-3 py-1 text-sm font-medium">
      {text}
    </span>
  );
};
