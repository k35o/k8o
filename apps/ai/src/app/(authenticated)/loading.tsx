import { StudioSkeleton } from './_components/studio';

// スタジオへの遷移中（サインイン後など）に即座にシェルの骨組みを描画する。
export default function Loading() {
  return <StudioSkeleton />;
}
