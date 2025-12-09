import { Card } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import Image from 'next/image';
import type { FC } from 'react';

export type UserProfileProps = {
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
};

export const UserProfile: FC<UserProfileProps> = ({
  name,
  email,
  avatarUrl,
  bio,
}) => {
  return (
    <Card>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              alt={`${name}のアバター`}
              className="size-16 rounded-full object-cover"
              height={64}
              src={avatarUrl}
              width={64}
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-bg-mute text-fg-subtle text-xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Heading type="h3">{name}</Heading>
            {email && <p className="text-fg-subtle text-sm">{email}</p>}
          </div>
        </div>
        {bio && <p className="text-fg-base text-sm">{bio}</p>}
      </div>
    </Card>
  );
};
