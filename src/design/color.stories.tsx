import type { Meta, StoryObj } from '@storybook/react';
import { FC } from 'react';

import { Heading } from '@/components/heading';

const Component: FC = () => {
  return (
    <div className="flex flex-wrap gap-6">
      <section>
        <Heading type="h1">primary color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="flex h-36 w-52 rounded-md bg-primary p-2" />
          </div>
          <div>
            <Heading type="h2">hover</Heading>
            <div className="flex h-36 w-52 rounded-md bg-primaryHover p-2" />
          </div>
          <div>
            <Heading type="h2">active</Heading>
            <div className="flex h-36 w-52 rounded-md bg-primaryActive p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">gray color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="flex h-36 w-52 rounded-md bg-gray p-2" />
          </div>
          <div>
            <Heading type="h2">hover</Heading>
            <div className="flex h-36 w-52 rounded-md bg-grayHover p-2" />
          </div>
          <div>
            <Heading type="h2">active</Heading>
            <div className="flex h-36 w-52 rounded-md bg-grayActive p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">text color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">primary</Heading>
            <div>
              <div className="flex h-36 w-52 rounded-md border border-border p-2">
                <p className="text-primary">
                  いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
                </p>
              </div>
            </div>
          </div>
          <div>
            <Heading type="h2">base</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p>
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">gray</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-textGray">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">white</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border bg-primary p-2">
              <p className="text-white">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">link</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-link">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">info</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-info">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">success</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-success">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">warning</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-warning">
                いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
              </p>
            </div>
          </div>
          <div>
            <Heading type="h2">info</Heading>
            <div className="flex h-36 w-52 rounded-md border border-border p-2">
              <p className="text-error">
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
            <div className="flex h-36 w-52 rounded-md bg-error p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-errorLight p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">info color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="flex h-36 w-52 rounded-md bg-info p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-infoLight p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">success color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="flex h-36 w-52 rounded-md bg-success p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-successLight p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">warning color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">main</Heading>
            <div className="flex h-36 w-52 rounded-md bg-warning p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-warningLight p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">bg color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="flex h-36 w-52 rounded-md bg-bgBase p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-bgLight p-2" />
          </div>
          <div>
            <Heading type="h2">dark</Heading>
            <div className="flex h-36 w-52 rounded-md bg-bgDark p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">border color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="flex h-36 w-52 rounded-md bg-border p-2" />
          </div>
          <div>
            <Heading type="h2">light</Heading>
            <div className="flex h-36 w-52 rounded-md bg-borderLight p-2" />
          </div>
        </div>
      </section>
      <section>
        <Heading type="h1">focus ring color</Heading>
        <div className="grid w-full grid-cols-3 gap-4">
          <div>
            <Heading type="h2">base</Heading>
            <div className="flex h-36 w-52 rounded-md bg-focusRing p-2" />
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
