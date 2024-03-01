import { Injectable } from '@nestjs/common';

@Injectable()
export class LevenshteinDistance {
  async calculate(s1: string, s2: string): Promise<number> {
    const m = s1.length;
    const n = s2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0) {
          dp[i][j] = j;
        } else if (j === 0) {
          dp[i][j] = i;
        } else {
          const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + cost, // substitution
          );
        }
      }
    }

    return dp[m][n];
  }
}
