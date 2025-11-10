export interface Keyword {
  readonly id: number;
  readonly text: string;
}

export interface TrendKeywordProps {
  readonly keywords?: readonly Keyword[];
  readonly characterImage?: string;
}

export interface KeywordBoxProps {
  readonly text?: string;
  readonly colorClass: string;
  readonly isLarge?: boolean;
  readonly onClick?: () => void;
}

export interface User {
  id: string;
  name: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  isPrivate: boolean;
  collaborators: User[];
  thumbnail?: string;
}
