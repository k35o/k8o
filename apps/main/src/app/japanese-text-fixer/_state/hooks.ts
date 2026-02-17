import { useProofreadState } from './provider';

export const useReviewText = () => {
  const { reviewText } = useProofreadState();
  return reviewText;
};
