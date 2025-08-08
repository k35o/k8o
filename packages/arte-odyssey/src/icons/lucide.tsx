import type { Direction, Status } from '@k8o/helpers';
import {
  AlignRight,
  Angry,
  Annoyed,
  Bell,
  Blend,
  Bookmark,
  BookText,
  Bot,
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
import type { FC } from 'react';
import { BaseIcon, type BaseIconProps } from './base';

type IconProps = Partial<BaseIconProps>;

export const ChevronIcon: FC<IconProps & { direction: Direction }> = ({
  direction,
  size = 'md',
}) => {
  return (
    <BaseIcon
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
      size={size}
    />
  );
};

export const CloseIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <X {...props} />;
      }}
      size={size}
    />
  );
};

export const CheckIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Check {...props} />;
      }}
      size={size}
    />
  );
};

export const AlertIcon: FC<IconProps & { status: Status }> = ({
  status,
  size = 'md',
}) => {
  return (
    <BaseIcon
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
      size={size}
    />
  );
};

export const LinkIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Link {...props} />;
      }}
      size={size}
    />
  );
};

export const ExternalLinkIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <ExternalLink {...props} />;
      }}
      size={size}
    />
  );
};

export const BlogIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <BookText {...props} />;
      }}
      size={size}
    />
  );
};

export const SlideIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Presentation {...props} />;
      }}
      size={size}
    />
  );
};

export const TagIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Tag {...props} />;
      }}
      size={size}
    />
  );
};

export const LocationIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <MapPin {...props} />;
      }}
      size={size}
    />
  );
};

export const FormIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <ListMinus {...props} />;
      }}
      size={size}
    />
  );
};

export const TableIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Table2 {...props} />;
      }}
      size={size}
    />
  );
};

export const CopyIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <ClipboardPenLine {...props} />;
      }}
      size={size}
    />
  );
};

export const PublishDateIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Calendar {...props} />;
      }}
      size={size}
    />
  );
};

export const UpdateDateIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Clock {...props} />;
      }}
      size={size}
    />
  );
};

export const MixedColorIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Blend {...props} />;
      }}
      size={size}
    />
  );
};

export const ColorInfoIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <PaintBucket {...props} />;
      }}
      size={size}
    />
  );
};

export const ColorContrastIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Contrast {...props} />;
      }}
      size={size}
    />
  );
};

export const NewsIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Bell {...props} />;
      }}
      size={size}
    />
  );
};

export const SubscribeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Bookmark {...props} />;
      }}
      size={size}
    />
  );
};

export const PrepareIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Rocket {...props} />;
      }}
      size={size}
    />
  );
};

export const SendIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Send {...props} />;
      }}
      size={size}
    />
  );
};

export const MailIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Mail {...props} />;
      }}
      size={size}
    />
  );
};

export const PlusIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Plus {...props} />;
      }}
      size={size}
    />
  );
};

export const MinusIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Minus {...props} />;
      }}
      size={size}
    />
  );
};

export const DarkModeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <MoonStar {...props} />;
      }}
      size={size}
    />
  );
};

export const LightModeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Sun {...props} />;
      }}
      size={size}
    />
  );
};

export const ViewIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Eye {...props} />;
      }}
      size={size}
    />
  );
};

export const AIIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Bot {...props} />;
      }}
      size={size}
    />
  );
};

export const RSSIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Rss {...props} />;
      }}
      size={size}
    />
  );
};

export const HistoryIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <History {...props} />;
      }}
      size={size}
    />
  );
};

export const ListIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <List {...props} />;
      }}
      size={size}
    />
  );
};

export const NavigationMenuIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <AlignRight {...props} />;
      }}
      size={size}
    />
  );
};

export const GoodIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <ThumbsUp {...props} />;
      }}
      size={size}
    />
  );
};

export const BadIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <ThumbsDown {...props} />;
      }}
      size={size}
    />
  );
};

export const InterestingIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Smile {...props} />;
      }}
      size={size}
    />
  );
};

export const BoringIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Annoyed {...props} />;
      }}
      size={size}
    />
  );
};

export const InformativeIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Lightbulb {...props} />;
      }}
      size={size}
    />
  );
};

export const ShallowIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Droplets {...props} />;
      }}
      size={size}
    />
  );
};

export const EasyIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Laugh {...props} />;
      }}
      size={size}
    />
  );
};

export const DifficultIcon: FC<IconProps> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Angry {...props} />;
      }}
      size={size}
    />
  );
};
