import { readFileSync } from 'node:fs';
import path from 'node:path';

export type BenchmarkReview = {
  origin: 'synthetic';
  practitionerReviewed: boolean;
  reviewer?: string;
  reviewedAt?: string;
  caseReviews: Record<string, 'approved' | 'corrected' | 'unreviewed'>;
};

export function benchmarkReview(): BenchmarkReview {
  return JSON.parse(readFileSync(path.join(process.cwd(), 'bench', 'fixtures', 'review.json'), 'utf8')) as BenchmarkReview;
}
