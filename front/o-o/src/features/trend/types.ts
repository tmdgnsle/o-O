export interface Keyword {
  id: number;
  text: string;
}

export interface TrendKeywordProps {
  readonly keywords?: Keyword[];
  readonly characterImage?: string;
}

export interface KeywordBoxProps {
  readonly text?: string;
  readonly colorClass: string;
  readonly isLarge?: boolean;
}
