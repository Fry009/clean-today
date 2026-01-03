import { Evidence } from '../entities/types';

export function canCheckout(evidence: Evidence | undefined): boolean {
  if (!evidence) return false;
  const hasAfterPhoto = evidence.afterPhotos.length > 0;
  const checklistDone = evidence.checklist.every((item) => item.done || !item.required);
  return hasAfterPhoto || checklistDone;
}
