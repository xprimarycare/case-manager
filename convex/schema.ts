import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { resourceTypeValidator } from "./types";

export default defineSchema({
    cases: defineTable({
        title: v.string(),
        updatedAt: v.number(),
        patient: v.object({
            name: v.string(),
            gender: v.string(),
            dateOfBirth: v.string(),
        }),
        encounter: v.object({
            date: v.optional(v.string()),
        }),
        chiefComplaint: v.optional(v.string()),
        hpi: v.optional(v.string()),
        allergies: v.optional(v.array(v.string())),
        medications: v.optional(v.array(v.string())),
        conditions: v.optional(v.array(v.string())),
    })
        .index("by_updatedAt", ["updatedAt"])
        .searchIndex("title", { searchField: "title" }),
    fhirResources: defineTable({
        resourceType: resourceTypeValidator,
        fhirId: v.string(),
        caseId: v.id("cases"),
    }),
});
