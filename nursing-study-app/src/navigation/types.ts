export type SharedStackParamList = {
  PageReader: { pageId: number };
  Quiz: { pageId: number };
};

export type HomeStackParamList = SharedStackParamList & {
  HomeRoot: undefined;
  Stats: undefined;
};

export type BrowseStackParamList = SharedStackParamList & {
  DomainList: undefined;
  DomainPages: { domainId: number; domainName: string; domainColor: string };
};

export type ReviewStackParamList = SharedStackParamList & {
  ReviewList: undefined;
};

export type ExamStackParamList = {
  ExamSetup: undefined;
  ExamRun: { domainFilter: 'all' | number[] };
};

export type SettingsStackParamList = {
  SettingsRoot: undefined;
};
