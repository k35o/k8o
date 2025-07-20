import { Accordion } from './accordion';
import { AccordionButton } from './accordion-button';
import { AccordionItem } from './accordion-item';
import { AccordionPanel } from './accordion-panel';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Accordion> = {
  title: 'components/accordion',
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Primary: Story = {
  args: {},
  render: () => {
    return (
      <Accordion>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <p className="text-lg">雨ニモマケズ</p>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <p>雨ニモマケズ</p>
            <p>風ニモマケズ</p>
            <p>雪ニモ夏ノ暑サニモマケヌ</p>
            <p>丈夫ナカラダヲモチ</p>
            <p>慾ハナク</p>
            <p>決シテ瞋ラズ</p>
            <p>イツモシヅカニワラッテヰル</p>
            <p>一日ニ玄米四合ト</p>
            <p>味噌ト少シノ野菜ヲタベ</p>
            <p>アラユルコトヲ</p>
            <p>ジブンヲカンジョウニ入レズニ</p>
            <p>ヨクミキキシワカリ</p>
            <p>ソシテワスレズ</p>
            <p>野原ノ松ノ林ノ</p>
            <p>小サナ萓ブキノ小屋ニヰテ</p>
            <p>東ニ病気ノコドモアレバ</p>
            <p>行ッテ看病シテヤリ</p>
            <p>西ニツカレタ母アレバ</p>
            <p>行ッテソノ稲ノ朿ヲ［＃「朿ヲ」はママ］負ヒ</p>
            <p>南ニ死ニサウナ人アレバ</p>
            <p>行ッテコハガラナクテモイヽトイヒ</p>
            <p>北ニケンクヮヤソショウガアレバ</p>
            <p>ツマラナイカラヤメロトイヒ</p>
            <p>ヒドリノトキハナミダヲナガシ</p>
            <p>サムサノナツハオロオロアルキ</p>
            <p>ミンナニデクノボートヨバレ</p>
            <p>ホメラレモセズ</p>
            <p>クニモサレズ</p>
            <p>サウイフモノニ</p>
            <p>ワタシハナリタイ</p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <p className="text-lg">あどけない話</p>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <p>智恵子は東京に空が無いといふ、</p>
            <p>ほんとの空が見たいといふ。</p>
            <p>私は驚いて空を見る。</p>
            <p>桜若葉の間に在るのは、</p>
            <p>切つても切れない</p>
            <p>むかしなじみのきれいな空だ。</p>
            <p>どんよりけむる地平のぼかしは</p>
            <p>うすもも色の朝のしめりだ。</p>
            <p>智恵子は遠くを見ながら言ふ。</p>
            <p>阿多多羅山あたたらやまの山の上に</p>
            <p>毎日出てゐる青い空が</p>
            <p>智恵子のほんとの空だといふ。</p>
            <p>あどけない空の話である。</p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>
              <p className="text-lg">かなしみ</p>
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <div className="space-y-4">
              <div>
                <p>あの青い空の波の音が聞えるあたりに</p>
                <p>何かとんでもないおとし物を</p>
                <p>僕はしてきてしまったらしい</p>
              </div>
              <div>
                <p>透明な過去の駅で</p>
                <p>遺失物係の前に立ったら</p>
                <p>僕は余計に悲しくなってしまった</p>
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  },
};
