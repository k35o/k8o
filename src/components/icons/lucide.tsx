import { BaseIcon, BaseIconProps } from './base';
import { Direction, Status } from '@/types';
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
import { FC } from 'react';

type IconProps = Partial<BaseIconProps>;

export const ChevronIcon: FC<
  IconProps & { direction: Direction }
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

export const CloseIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <X {...props} />;
      }}
    />
  );
};

export const CheckIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Check {...props} />;
      }}
    />
  );
};

export const AlertIcon: FC<IconProps & { status: Status }> = ({
  status,
  size = 'md',
}) => {
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

export const LinkIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Link {...props} />;
      }}
    />
  );
};

export const FormIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ListMinus {...props} />;
      }}
    />
  );
};

export const TableIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Table2 {...props} />;
      }}
    />
  );
};

export const CopyIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ClipboardPenLine {...props} />;
      }}
    />
  );
};

export const PublishDateIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Calendar {...props} />;
      }}
    />
  );
};

export const UpdateDateIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Clock {...props} />;
      }}
    />
  );
};

export const MixedColorIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Blend {...props} />;
      }}
    />
  );
};

export const ColorInfoIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <PaintBucket {...props} />;
      }}
    />
  );
};

export const ColorContrastIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Contrast {...props} />;
      }}
    />
  );
};

export const NewsIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Bell {...props} />;
      }}
    />
  );
};

export const PrepareIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Rocket {...props} />;
      }}
    />
  );
};

export const SendIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Send {...props} />;
      }}
    />
  );
};

export const MailIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Mail {...props} />;
      }}
    />
  );
};

export const PlusIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Plus {...props} />;
      }}
    />
  );
};

export const MinusIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Minus {...props} />;
      }}
    />
  );
};

export const DarkModeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <MoonStar {...props} />;
      }}
    />
  );
};

export const LightModeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Sun {...props} />;
      }}
    />
  );
};

export const ViewIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Eye {...props} />;
      }}
    />
  );
};

export const RSSIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Rss {...props} />;
      }}
    />
  );
};

export const HistoryIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <History {...props} />;
      }}
    />
  );
};

export const ListIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <List {...props} />;
      }}
    />
  );
};
