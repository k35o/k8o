import type { Meta, StoryObj } from '@storybook/react';
import { FC } from 'react';

import { Heading } from '@/app/_components/heading';

const Component: FC = () => {
  return (
    <div className="flex flex-wrap gap-6">
      <section>
        <Heading type="h1">primary color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-primary flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">hover</Heading>
            <div className="bg-primaryHover flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">active</Heading>
            <div className="bg-primaryActive flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">gray color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-gray flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">hover</Heading>
            <div className="bg-grayHover flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">active</Heading>
            <div className="bg-grayActive flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">text color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">primary</Heading>
            <div>
              <div className="border-border flex h-36 w-52 rounded-md border p-2">
                <p className="text-primary">
                  いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
                </p>
              </div>
            </div>
          </div>
          <div>
            <Heading type="h2">base</Heading>
            <div className="border-border flex h-36 w-52 rounded-md border p-2">
              <p>
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">gray</Heading>
            <div className="border-border flex h-36 w-52 rounded-md border p-2">
              <p className="text-textGray">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">white</Heading>
            <div className="bg-primary border-border flex h-36 w-52 rounded-md border p-2">
              <p className="text-white">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">link</Heading>
            <div className="border-border flex h-36 w-52 rounded-md border p-2">
              <p className="text-link">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">error color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-error flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-errorLight flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">info color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-info flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-infoLight flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">success color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-success flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-successLight flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">warning color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="bg-warning flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-warningLight flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">bg color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="bg-bgBase flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-bgLight flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">dark</Heading>
            <div className="bg-bgDark flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">border color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="bg-border flex h-36 w-52 rounded-md p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="bg-borderLight flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">focus ring color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="bg-focusRing flex h-36 w-52 rounded-md p-2" />
          </div>
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof Component> = {
  title: 'design/color',
  component: Component,
};

export default meta;

export const Default: StoryObj<typeof Component> = {};