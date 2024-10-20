import { Route } from 'next';
import Link from 'next/link';
import { Heading } from '@/components/heading';
import { InteractiveCard } from '@/components/card';

export const AppCard = ({
  link,
  emotion,
  title,
  description,
}: {
  link: Route;
  emotion: string;
  title: string;
  description: string;
}) => {
  return (
    <InteractiveCard variant="secondary" animation="low">
      <Link href={link} className="block w-full">
        <div className="flex flex-col gap-6 p-4">
          <Heading type="h3">
            {emotion}&nbsp;
            {title}
          </Heading>
          <p className="line-clamp-3">{description}</p>
        </div>
      </Link>
    </InteractiveCard>
  );
};
