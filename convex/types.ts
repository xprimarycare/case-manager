import { Infer, v } from "convex/values";

export const resourceTypeValidator = v.union(
    v.literal("patient"),
    v.literal("encounter"),
    v.literal("condition"),
    v.literal("observation"),
    v.literal("medication-request")
);

export type ResourceType = Infer<typeof resourceTypeValidator>;
