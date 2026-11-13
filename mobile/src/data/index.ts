import raw from "./plans.json";
import { Plan } from "../types/plans";

export const PLANS = raw as unknown as Plan[];
export const getPlan = (id: string) => PLANS.find((p) => p.id === id);
