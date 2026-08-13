type Space = {
  spaceId: string;
  name: string;
};

export interface getSpaceResponse {
  content: Space[];
}
