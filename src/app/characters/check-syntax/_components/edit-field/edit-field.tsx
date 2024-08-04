'use client';

import { Textarea } from '@/components/form/textarea';
import {
  ResultMessage,
  useSetResultMessages,
  useSetResultText,
  useSetText,
  useText,
} from '../../_state/text';
import { Button } from '@/components/button';
import { FormEventHandler, useState } from 'react';
import { checkJapaneseSyntax } from '../../_utils/japaneseSyntax';
import { FormControl } from '@/components/form/form-control';

export const EditField = () => {
  const text = useText();
  const setText = useSetText();
  const [isMutating, setIsMutating] = useState(false);
  const setResultText = useSetResultText();
  const setResultMessages = useSetResultMessages();

  const handleCheck: FormEventHandler = async (e) => {
    e.preventDefault();
    if (text === '') return;
    setIsMutating(true);
    checkJapaneseSyntax({ text })
      .then((res) => {
        setResultText(res.text.split('\n'));
        setResultMessages(
          res.msgs.reduce((acc: ResultMessage, cur) => {
            const line = cur.line;
            return {
              ...acc,
              [line]: [...(acc[line] ?? []), cur.message],
            };
          }, []),
        );
      })
      .finally(() => {
        setIsMutating(false);
      });
  };

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={handleCheck}
    >
      <div className="h-full *:h-full">
        <FormControl
          label="校正したいテキスト"
          renderInput={(props) => {
            return (
              <Textarea
                {...props}
                value={text}
                onChange={setText}
                placeholder="近来音楽は、著しき進歩発達をなし、歌曲の作世に顕はれたるもの少しとせず、然れども、是等多くは通常音楽の普及伝播を旨とせる学校唱歌にして、之より程度の高きものは極めて少し、其稍高尚なるものに至りては、皆西洋の歌曲を採り、之が歌詞に代ふるに我歌詞を以てし、単に字句の数を割当るに止まるが故に、多くは原曲の妙味を害ふに至る。中には頗る其原曲の声調に合へるものなきにしもあらずと雖も、素より変則の仕方なれば、これを以て完美したりと称し難き事は何人も承知する所なり。余や敢えて其欠を補ふの任に当るに足らずと雖も、常に此事を遺憾とするが故に、これ迄研究せし結果、即我歌詞に基きて作曲したるものゝ内二三を公にし、以て此道に資する所あらんとす。幸に先輩識者の是正を賜はるあらば、余の幸栄之に過ぎざるなり。（「四季」緒言 滝廉太郎）"
                fullHeight
                isRequired
              />
            );
          }}
        />
      </div>
      <Button
        type="submit"
        fullWidth
        disabled={isMutating || text === ''}
      >
        校正する
      </Button>
    </form>
  );
};
