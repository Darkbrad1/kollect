export const tabs = ["reading", "planned", "hiatus", "archived"] as const;
export type TabStatus = typeof tabs[number];
// => "reading" | "planned" | "haitus" | "archived"

const appSettings = {
  defaultView: "card",
  defaultStatus: tabs[0],
  scrollThreshold: 0,
  cardSize: 144, // this value is in pixel good sizes are 144, 182
};

export default appSettings
