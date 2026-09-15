export type CatalogDescriptionKeyword = {
  id: number;
  slug: string;
  name: string;
  targetTerms: string[];
  semanticEnabled: boolean;
  similarityThreshold: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CatalogDescriptionKeywordPayload = {
  name: string;
  targetTerms: string[];
  semanticEnabled: boolean;
  similarityThreshold: number | null;
  isActive: boolean;
};

export type CatalogDescriptionKeywordProgress = {
  totalKeywords: number;
  activeKeywords: number;
  dictionaryUpdatedAt: string | null;
  descriptionsWithFullDescription: number;
  keywordCheckedDescriptions: number;
  keywordPendingDescriptions: number;
  descriptionsWithMatchedKeywords: number;
  lastKeywordCheckedAt: string | null;
  embeddingModelName: string;
  embeddedDescriptions: number;
  embeddingPendingDescriptions: number;
  lastEmbeddingUpdatedAt: string | null;
};

export type CatalogDescriptionKeywordRequeueResult = {
  resetDescriptions: number;
  dictionaryUpdatedAt: string | null;
};
