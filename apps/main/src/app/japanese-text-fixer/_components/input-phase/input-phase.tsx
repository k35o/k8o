'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Card } from '@k8o/arte-odyssey/card';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Textarea } from '@k8o/arte-odyssey/form/textarea';
import { useToast } from '@k8o/arte-odyssey/toast';
import type { SubmitEventHandler } from 'react';
import { useProofreadDispatch, useProofreadState } from '../../_state/provider';
import { buildAnnotations } from '../../_utils/build-annotations';
import { checkJapaneseSyntax } from '../../_utils/japanese-syntax';

export const InputPhase = () => {
  const { inputText, isChecking } = useProofreadState();
  const dispatch = useProofreadDispatch();
  const { onOpen } = useToast();

  const handleSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();
    if (inputText === '') return;
    dispatch({ type: 'START_CHECK' });
    void checkJapaneseSyntax({ text: inputText })
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
        onOpen('error', '校正に失敗しました。時間をおいて再度お試しください。');
      });
  };

  return (
    <form className="flex h-full flex-col gap-4" onSubmit={handleSubmit}>
      <Card>
        <div className="flex flex-col gap-2 p-4">
          <div className="[&_textarea]:min-h-60">
            <FormControl
              label="校正したいテキスト"
              renderInput={({ labelId: _, ...props }) => (
                <Textarea
                  {...props}
                  isRequired
                  onChange={(e) => {
                    dispatch({
                      type: 'SET_INPUT_TEXT',
                      payload: e.target.value,
                    });
                  }}
                  placeholder="近来音楽は、著しき進歩発達をなし、歌曲の作世に顕はれたるもの少しとせず、然れども、是等多くは通常音楽の普及伝播を旨とせる学校唱歌にして、之より程度の高きものは極めて少し、其稍高尚なるものに至りては、皆西洋の歌曲を採り、之が歌詞に代ふるに我歌詞を以てし、単に字句の数を割当るに止まるが故に、多くは原曲の妙味を害ふに至る。中には頗る其原曲の声調に合へるものなきにしもあらずと雖も、素より変則の仕方なれば、これを以て完美したりと称し難き事は何人も承知する所なり。余や敢えて其欠を補ふの任に当るに足らずと雖も、常に此事を遺憾とするが故に、これ迄研究せし結果、即我歌詞に基きて作曲したるものゝ内二三を公にし、以て此道に資する所あらんとす。幸に先輩識者の是正を賜はるあらば、余の幸栄之に過ぎざるなり。（「四季」緒言 滝廉太郎）"
                  value={inputText}
                />
              )}
            />
          </div>
          <p className="text-right text-fg-mute text-sm">
            {inputText.length}文字
          </p>
        </div>
      </Card>
      <Button disabled={isChecking || inputText === ''} fullWidth type="submit">
        {isChecking ? '校正中...' : '校正する'}
      </Button>
    </form>
  );
};
