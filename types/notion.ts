import type { NotionSourceType } from "./analysis";

export type NormalizedBlockType =
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "paragraph"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "to_do"
  | "toggle"
  | "quote"
  | "callout"
  | "code"
  | "unsupported";

export type NormalizedNotionBlock = {
  id: string;
  type: NormalizedBlockType;
  text: string;
  children: NormalizedNotionBlock[];
};

export type NormalizedNotionPage = {
  sourceType: "page";
  pageId: string;
  pageTitle: string;
  url: string;
  blocks: NormalizedNotionBlock[];
};

export type NormalizedNotionDataSourceItem = {
  pageId: string;
  title: string;
  url: string;
  properties: Record<string, string | number | boolean | string[]>;
  blocks: NormalizedNotionBlock[];
};

export type NormalizedNotionDataSource = {
  sourceType: "data_source";
  dataSourceId: string;
  dataSourceTitle: string;
  items: NormalizedNotionDataSourceItem[];
};

export type NormalizedNotionData =
  | NormalizedNotionPage
  | NormalizedNotionDataSource;

export type NotionSourceInput = {
  sourceType: NotionSourceType;
  id: string;
};
