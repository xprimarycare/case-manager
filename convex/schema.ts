import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    cases: defineTable({
        title: v.string(),
        updatedAt: v.number(),
        patient: v.object({
            name: v.string(),
            gender: v.optional(v.string()),
            dateOfBirth: v.optional(v.string()),
        }),
        summary: v.optional(v.string()),
        note: v.optional(
            v.object({
                hpi: v.optional(v.string()),
                reasonForVisit: v.optional(v.string()),
                assessment: v.optional(v.string()),
                plan: v.optional(v.string()),
            })
        ),
        vitals: v.optional(
            v.object({
                height: v.optional(v.number()),
                weight: v.optional(v.number()),
                waistCircumference: v.optional(v.number()),
                temperature: v.optional(v.number()),
                temperatureSite: v.optional(v.string()),
                bloodPressureSystolic: v.optional(v.number()),
                bloodPressureDiastolic: v.optional(v.number()),
                bloodPressureSite: v.optional(v.string()),
                pulseRate: v.optional(v.number()),
                pulseRhythm: v.optional(v.string()),
                respirationRate: v.optional(v.number()),
                oxygenSaturation: v.optional(v.number()),
                notes: v.optional(v.string()),
            })
        ),
        physicalExam: v.optional(
            v.object({
                constitutional: v.optional(v.string()),
                cardiovascular: v.optional(v.string()),
                pulmonary: v.optional(v.string()),
                other: v.optional(v.string()),
            })
        ),
    })
        .index("by_updatedAt", ["updatedAt"])
        .searchIndex("title", { searchField: "title" }),
});
