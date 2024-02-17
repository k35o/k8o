export const TextTag = ({ text }: { text: string }) => {
  return (
    <span className="bg-gray inline-block rounded-full px-3 py-1 text-sm font-medium">
      {text}
    </span>
  );
};
