import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const createCase = mutation({
    args: {
        title: v.string(),
        // AI mode fields
        summary: v.optional(v.string()),
        // Detailed mode fields
        patient: v.object({
            name: v.string(),
            gender: v.optional(v.string()),
            dateOfBirth: v.optional(v.string()),
        }),
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("cases", {
            title: args.title,
            patient: args.patient,
            summary: args.summary,
            note: args.note,
            vitals: args.vitals,
            physicalExam: args.physicalExam,
            updatedAt: Date.now(),
        });
    },
});

export const updateCase = mutation({
    args: {
        id: v.id("cases"),
        title: v.string(),
        // AI mode fields
        summary: v.optional(v.string()),
        // Detailed mode fields
        patient: v.optional(
            v.object({
                name: v.string(),
                gender: v.optional(v.string()),
                dateOfBirth: v.optional(v.string()),
            })
        ),
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
    },
    handler: async (ctx, args) => {
        const updateData: any = {
            title: args.title,
            updatedAt: Date.now(),
            patient: args.patient,
            note: args.note,
            vitals: args.vitals,
            physicalExam: args.physicalExam,
        };

        return await ctx.db.patch(args.id, updateData);
    },
});

export const getCaseList = query({
    args: {
        paginationOpts: paginationOptsValidator,
        searchTerm: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.searchTerm !== "") {
            return await ctx.db
                .query("cases")
                .withSearchIndex("title", (q) =>
                    q.search("title", args.searchTerm!)
                )
                .paginate(args.paginationOpts);
        } else {
            return await ctx.db
                .query("cases")
                .withIndex("by_updatedAt")
                .order("desc")
                .paginate(args.paginationOpts);
        }
    },
});

export const getCase = query({
    args: { id: v.optional(v.id("cases")) },
    handler: async (ctx, args) => {
        if (!args.id) {
            return null;
        }
        return await ctx.db.get(args.id);
    },
});
