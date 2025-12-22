import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { phenoml, PhenoMLClient } from "phenoml";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";
import { ResourceType } from "./types";

export const readyToSend = query({
    handler: async (_ctx) => {
        const username = process.env.PHENOML_USERNAME;
        const password = process.env.PHENOML_PASSWORD;
        const baseUrl = process.env.PHENOML_BASE_URL;
        const fhirProviderId = process.env.PHENOML_FHIR_PROVIDER_ID;
        if (!username || !password || !baseUrl || !fhirProviderId) {
            return false;
        }
        return true;
    },
});

export const sendCaseToEmrThroughPhenoML = action({
    args: {
        caseId: v.id("cases"),
        patient: v.object({
            name: v.string(),
            gender: v.string(),
            dateOfBirth: v.string(),
        }),
        encounter: v.object({
            date: v.string(),
        }),
        chiefComplaint: v.string(),
        hpi: v.string(),
        allergies: v.array(v.string()),
        medications: v.array(v.string()),
        conditions: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const {
            caseId,
            patient,
            encounter,
            chiefComplaint,
            hpi,
            allergies,
            medications,
            conditions,
        } = args;
        const username = process.env.PHENOML_USERNAME;
        const password = process.env.PHENOML_PASSWORD;
        const baseUrl = process.env.PHENOML_BASE_URL;
        const fhirProviderId = process.env.PHENOML_FHIR_PROVIDER_ID;
        if (!username || !password || !baseUrl || !fhirProviderId) {
            throw new Error(
                "PhenoML not configured. Please set PHENOML_USERNAME, PHENOML_PASSWORD, PHENOML_BASE_URL, and PHENOML_FHIR_PROVIDER_ID environment variables."
            );
        }

        const client = new PhenoMLClient({
            username,
            password,
            baseUrl,
        });

        const fhirResources: Omit<
            WithoutSystemFields<Doc<"fhirResources">>,
            "caseId"
        >[] = [];

        // Patient
        const patientFhirId = await createResourcePhenoml({
            client,
            resource: "patient",
            fhirProviderId,
            naturalLanguage: `${patient.name} is a ${patient.gender} born on ${patient.dateOfBirth}`,
            fhirResources,
        });

        // Encounter
        const encounterFhirId = await createResourcePhenoml({
            client,
            resource: "encounter",
            fhirProviderId,
            naturalLanguage: `${encounter.date} is the date of the encounter. It was an ambulatory encounter with patient ${patient.name} with FHIR ID ${patientFhirId}`,
            fhirResources,
        });

        // Condition (for chief complaint)
        if (chiefComplaint && chiefComplaint.trim()) {
            await createResourcePhenoml({
                client,
                resource: "condition-encounter-diagnosis",
                fhirProviderId,
                naturalLanguage: `${chiefComplaint} is the chief complaint`,
                fhirResources,
            });
        }

        // Observation (for HPI)
        if (hpi && hpi.trim()) {
            await createResourcePhenoml({
                client,
                resource: "simple-observation",
                fhirProviderId,
                naturalLanguage: `${hpi} is the History of Present Illness. This was documented during encounter with FHIR ID ${encounterFhirId}`,
                fhirResources,
            });
        }

        // Conditions (for allergies)
        for (const allergy of allergies) {
            await createResourcePhenoml({
                client,
                resource: "condition-problems-health-concerns",
                fhirProviderId,
                naturalLanguage: `The patient has the following allergy: ${allergy}. This was documented during the encounter with FHIR ID ${encounterFhirId}`,
                fhirResources,
            });
        }

        // MedicationRequests
        for (const medication of medications) {
            await createResourcePhenoml({
                client,
                resource: "medicationrequest",
                fhirProviderId,
                naturalLanguage: `The patient is taking the following medication: ${medication}. This was documented during the encounter with FHIR ID ${encounterFhirId}`,
                fhirResources,
            });
        }

        // Conditions
        for (const condition of conditions) {
            await createResourcePhenoml({
                client,
                resource: "condition-problems-health-concerns",
                fhirProviderId,
                naturalLanguage: `The patient has the following condition: ${condition}. This was documented during the encounter with FHIR ID ${encounterFhirId}`,
                fhirResources,
            });
        }

        await ctx.runMutation(internal.fhir.storeFhirResources, {
            fhirResources,
            caseId,
        });

        return {
            success: true,
            message: "Successfully sent case to EMR",
        };
    },
});

export const storeFhirResources = internalMutation({
    args: {
        fhirResources: v.array(
            v.object({
                resourceType: v.union(
                    v.literal("patient"),
                    v.literal("encounter"),
                    v.literal("condition"),
                    v.literal("observation"),
                    v.literal("medication-request")
                ),
                fhirId: v.string(),
            })
        ),
        caseId: v.id("cases"),
    },
    handler: async (ctx, args) => {
        const { fhirResources, caseId } = args;
        for (const fhirResource of fhirResources) {
            await ctx.db.insert("fhirResources", {
                ...fhirResource,
                caseId,
            });
        }
    },
});

type PhenomlResource = phenoml.tools.Lang2FhirAndCreateRequest["resource"];

const createResourcePhenoml = async ({
    client,
    resource,
    fhirProviderId,
    naturalLanguage,
    fhirResources,
}: {
    client: PhenoMLClient;
    resource: PhenomlResource;
    fhirProviderId: string;
    naturalLanguage: string;
    fhirResources: Omit<WithoutSystemFields<Doc<"fhirResources">>, "caseId">[];
}): Promise<string> => {
    const result = await client.tools.createFhirResource({
        provider: fhirProviderId,
        resource,
        text: naturalLanguage,
    });

    if (!result.success) {
        throw new Error(
            `Failed to create ${resource} resource: ${result.message}`
        );
    }

    const fhirId = result.fhir_id!;

    fhirResources.push({
        resourceType: mapPhenomlResourceToResourceType(resource),
        fhirId,
    });

    return fhirId;
};

const mapPhenomlResourceToResourceType = (
    resource: PhenomlResource
): ResourceType => {
    switch (resource) {
        case "patient":
            return "patient";
        case "encounter":
            return "encounter";
        case "condition-encounter-diagnosis":
            return "condition";
        case "condition-problems-health-concerns":
            return "condition";
        case "simple-observation":
            return "observation";
        case "medicationrequest":
            return "medication-request";
        case "observation-clinical-result":
            return "observation";
        case "observation-lab":
            return "observation";
        case "appointment":
        case "auto":
        case "careplan":
        case "coverage":
        case "procedure":
        case "questionnaire":
        case "questionnaireresponse":
        case "vital-signs":
        default:
            throw new Error(`Resource type not implemented: ${resource}`);
    }
};
