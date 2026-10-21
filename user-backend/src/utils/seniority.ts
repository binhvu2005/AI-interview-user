export type Seniority = 'junior' | 'mid' | 'senior';

const SENIOR_PATTERN = /senior|lead|staff|principal|architect|chuyên gia|trưởng nhóm|quản lý|manager/i;
const JUNIOR_PATTERN = /junior|entry|intern|fresher|thực tập|mới ra trường/i;

// Level is the source of truth; position is only consulted when level says nothing.
// Position alone must not promote: "Product Manager" with level "Junior" stays junior.
export const getSeniority = (level: string = '', position: string = ''): Seniority => {
  if (SENIOR_PATTERN.test(level)) return 'senior';
  if (JUNIOR_PATTERN.test(level)) return 'junior';
  if (level.trim()) return 'mid';
  if (JUNIOR_PATTERN.test(position)) return 'junior';
  if (SENIOR_PATTERN.test(position)) return 'senior';
  return 'mid';
};
