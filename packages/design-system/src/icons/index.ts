/**
 * Icon re-exports.
 *
 * Wraps Lucide React with the project's naming convention. Callers should import from
 * this module rather than `lucide-react` directly so future icon swaps are a single-file
 * change. Two domain-specific icons that are not in Lucide live alongside:
 * `DriftArrowIcon` for drift direction on the Trace view, and `CascadeNodeIcon` for
 * the Cascade view legend.
 */
export {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Info,
  Loader2,
  Minus,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';

export { DriftArrowIcon } from './DriftArrowIcon';
export { CascadeNodeIcon } from './CascadeNodeIcon';
