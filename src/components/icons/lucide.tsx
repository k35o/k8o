import { Direction, StatusType } from '@/types';
import { cn } from '@/utils/cn';
import {
  Bell,
  Blend,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  ClipboardPenLine,
  Clock,
  Contrast,
  Eye,
  History,
  Info,
  Link,
  List,
  ListMinus,
  Mail,
  Minus,
  MoonStar,
  PaintBucket,
  Plus,
  Rocket,
  Rss,
  Send,
  Sun,
  Table2,
  TriangleAlert,
  X,
} from 'lucide-react';
import { FC, ReactNode } from 'react';

type IconProps = {
  size: 'sm' | 'md' | 'lg';
};

const BaseIcon: FC<
  IconProps & {
    renderItem: (arg: { className: string }) => ReactNode;
  }
> = ({ size, renderItem }) => {
  return renderItem({
    className: cn(
      size === 'sm' && 'size-4',
      size === 'md' && 'size-6',
      size === 'lg' && 'size-8',
    ),
  });
};

export const ChevronIcon: FC<
  Partial<IconProps> & { direction: Direction }
> = ({ direction, size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        switch (direction) {
          case 'up':
            return <ChevronUp {...props} />;
          case 'down':
            return <ChevronDown {...props} />;
          case 'left':
            return <ChevronLeft {...props} />;
          case 'right':
            return <ChevronRight {...props} />;
        }
      }}
    />
  );
};

export const CloseIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <X {...props} />;
      }}
    />
  );
};

export const CheckIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Check {...props} />;
      }}
    />
  );
};

export const AlertIcon: FC<
  Partial<IconProps> & { status: StatusType }
> = ({ status, size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        switch (status) {
          case 'success':
            return <CircleCheck {...props} />;
          case 'info':
            return <Info {...props} />;
          case 'warning':
            return <TriangleAlert {...props} />;
          case 'error':
            return <CircleAlert {...props} />;
        }
      }}
    />
  );
};

export const LinkIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Link {...props} />;
      }}
    />
  );
};

export const FormIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ListMinus {...props} />;
      }}
    />
  );
};

export const TableIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Table2 {...props} />;
      }}
    />
  );
};

export const CopyIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ClipboardPenLine {...props} />;
      }}
    />
  );
};

export const PublishDateIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Calendar {...props} />;
      }}
    />
  );
};

export const UpdateDateIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Clock {...props} />;
      }}
    />
  );
};

export const MixedColorIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Blend {...props} />;
      }}
    />
  );
};

export const ColorInfoIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <PaintBucket {...props} />;
      }}
    />
  );
};

export const ColorContrastIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Contrast {...props} />;
      }}
    />
  );
};

export const NewsIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Bell {...props} />;
      }}
    />
  );
};

export const PrepareIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Rocket {...props} />;
      }}
    />
  );
};

export const SendIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Send {...props} />;
      }}
    />
  );
};

export const MailIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Mail {...props} />;
      }}
    />
  );
};

export const PlusIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Plus {...props} />;
      }}
    />
  );
};

export const MinusIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Minus {...props} />;
      }}
    />
  );
};

export const DarkModeIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <MoonStar {...props} />;
      }}
    />
  );
};

export const LightModeIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Sun {...props} />;
      }}
    />
  );
};

export const ViewIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Eye {...props} />;
      }}
    />
  );
};

export const RSSIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Rss {...props} />;
      }}
    />
  );
};

export const HistoryIcon: FC<Partial<IconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <History {...props} />;
      }}
    />
  );
};

export const ListIcon: FC<Partial<IconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <List {...props} />;
      }}
    />
  );
};
