import { useToast } from '@k8o/arte-odyssey/toast';
import { useCallback } from 'react';
import { buildAnnotations } from '../_utils/build-annotations';
import { checkJapaneseSyntax } from '../_utils/japanese-syntax';
import { useProofreadDispatch, useProofreadState } from './provider';

export const useReviewText = () => {
  const { reviewText } = useProofreadState();
  return reviewText;
};

export const useCheckJapaneseSyntax = () => {
  const dispatch = useProofreadDispatch();
  const { onOpen } = useToast();

  return useCallback(
    (text: string) => {
      if (text === '') return;
      dispatch({ type: 'START_CHECK' });
      void checkJapaneseSyntax({ text })
        .then((res) => {
          const annotations = buildAnnotations(res.msgs);
          if (annotations.length === 0) {
            dispatch({
              type: 'CHECK_NO_ERRORS',
              payload: { text: res.text },
            });
          } else {
            dispatch({
              type: 'CHECK_SUCCESS',
              payload: { text: res.text, annotations },
            });
          }
        })
        .catch(() => {
          dispatch({ type: 'CHECK_FAILURE' });
          onOpen(
            'error',
            '校正に失敗しました。時間をおいて再度お試しください。',
          );
        });
    },
    [dispatch, onOpen],
  );
};
