const ngInlineAction = async (): Promise<void> => {
  'use server';
  await Promise.resolve();
};

async function okInlineAction(): Promise<void> {
  'use server';
  await verifySession();
}

export default function Page(): unknown {
  return [ngInlineAction, okInlineAction];
}
