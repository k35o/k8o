import { BaseIcon, BaseIconProps } from './base';
import { Direction, Status } from '@/types';
import {
  AlignRight,
  Angry,
  Annoyed,
  Bell,
  Blend,
  BookText,
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
  Droplets,
  ExternalLink,
  Eye,
  History,
  Info,
  Laugh,
  Lightbulb,
  Link,
  List,
  ListMinus,
  Mail,
  MapPin,
  Minus,
  MoonStar,
  PaintBucket,
  Plus,
  Presentation,
  Rocket,
  Rss,
  Send,
  Smile,
  Sun,
  Table2,
  Tag,
  ThumbsDown,
  ThumbsUp,
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

export const ExternalLinkIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ExternalLink {...props} />;
      }}
    />
  );
};

export const BlogIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <BookText {...props} />;
      }}
    />
  );
};

export const SlideIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Presentation {...props} />;
      }}
    />
  );
};

export const TagIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Tag {...props} />;
      }}
    />
  );
};

export const LocationIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <MapPin {...props} />;
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

export const NavigationMenuIcon: FC<IconProps> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <AlignRight {...props} />;
      }}
    />
  );
};

export const GoodIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ThumbsUp {...props} />;
      }}
    />
  );
};

export const BadIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <ThumbsDown {...props} />;
      }}
    />
  );
};

export const InterestingIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Smile {...props} />;
      }}
    />
  );
};

export const BoringIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Annoyed {...props} />;
      }}
    />
  );
};

export const InformativeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Lightbulb {...props} />;
      }}
    />
  );
};

export const ShallowIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Droplets {...props} />;
      }}
    />
  );
};

export const EasyIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Laugh {...props} />;
      }}
    />
  );
};

export const DifficultIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => {
        return <Angry {...props} />;
      }}
    />
  );
};
