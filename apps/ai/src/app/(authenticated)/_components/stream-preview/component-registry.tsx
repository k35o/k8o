import {
  AIIcon,
  Alert,
  AlertIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  Code,
  CopyIcon,
  ExternalLinkIcon,
  GitHubIcon,
  Grid,
  Heading,
  IconButton,
  InformativeIcon,
  LinkIcon,
  MailIcon,
  MinusIcon,
  PlusIcon,
  Progress,
  SendIcon,
  Separator,
  Skeleton,
  SparklesIcon,
  Spinner,
  Stack,
  ViewIcon,
} from '@k8o/arte-odyssey';
import type { ComponentType } from 'react';

// 描画側は任意の props を spread するため、arte-odyssey の厳密な型を緩い型に寄せる。
type AnyComponent = ComponentType<Record<string, unknown>>;

const asAny = (component: ComponentType<never>): AnyComponent =>
  component as unknown as AnyComponent;

// 登録対象は「宣言的に確実に描けるサブセット」のみ。
// 複合コンポーネント（Dialog / Tabs / FormControl 等）は未登録のままにして、
// 匿名プレースホルダ（UnknownPlaceholder）に差し替えて描く。
const registry: Record<string, AnyComponent> = {
  Alert: asAny(Alert),
  Anchor: asAny(Anchor),
  Avatar: asAny(Avatar),
  Badge: asAny(Badge),
  Button: asAny(Button),
  Card: asAny(Card),
  Code: asAny(Code),
  Grid: asAny(Grid),
  Heading: asAny(Heading),
  IconButton: asAny(IconButton),
  Progress: asAny(Progress),
  Separator: asAny(Separator),
  Skeleton: asAny(Skeleton),
  Spinner: asAny(Spinner),
  Stack: asAny(Stack),
  // よく使われるアイコンの代表セット。未登録アイコンはアイコンサイズのプレースホルダになる。
  AIIcon: asAny(AIIcon),
  AlertIcon: asAny(AlertIcon),
  CheckIcon: asAny(CheckIcon),
  ChevronIcon: asAny(ChevronIcon),
  CloseIcon: asAny(CloseIcon),
  CopyIcon: asAny(CopyIcon),
  ExternalLinkIcon: asAny(ExternalLinkIcon),
  GitHubIcon: asAny(GitHubIcon),
  InformativeIcon: asAny(InformativeIcon),
  LinkIcon: asAny(LinkIcon),
  MailIcon: asAny(MailIcon),
  MinusIcon: asAny(MinusIcon),
  PlusIcon: asAny(PlusIcon),
  SendIcon: asAny(SendIcon),
  SparklesIcon: asAny(SparklesIcon),
  ViewIcon: asAny(ViewIcon),
};

export const resolveComponent = (name: string): AnyComponent | null =>
  registry[name] ?? null;
