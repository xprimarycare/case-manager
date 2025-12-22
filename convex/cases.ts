import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const createCase = mutation({
    args: {
        title: v.string(),
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("cases", {
            title: args.title,
            patient: args.patient,
            encounter: args.encounter,
            chiefComplaint: args.chiefComplaint,
            hpi: args.hpi,
            allergies: args.allergies,
            medications: args.medications,
            conditions: args.conditions,
            updatedAt: Date.now(),
        });
    },
});

export const updateCase = mutation({
    args: {
        id: v.id("cases"),
        title: v.string(),
        patient: v.optional(
            v.object({
                name: v.string(),
                gender: v.string(),
                dateOfBirth: v.string(),
            })
        ),
        encounter: v.optional(
            v.object({
                date: v.optional(v.string()),
            })
        ),
        chiefComplaint: v.optional(v.string()),
        hpi: v.optional(v.string()),
        allergies: v.optional(v.array(v.string())),
        medications: v.optional(v.array(v.string())),
        conditions: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const updateData: any = {
            title: args.title,
            updatedAt: Date.now(),
            patient: args.patient,
            encounter: args.encounter,
            chiefComplaint: args.chiefComplaint,
            hpi: args.hpi,
            allergies: args.allergies,
            medications: args.medications,
            conditions: args.conditions,
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
