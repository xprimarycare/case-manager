import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PhenoMLClient } from "phenoml";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";

export const sendToMedplum = action({
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
        const patientNaturalLanguage = `${patient.name} is a ${patient.gender} born on ${patient.dateOfBirth}`;
        const patientResult = await client.tools.createFhirResource({
            provider: fhirProviderId,
            resource: "patient",
            text: patientNaturalLanguage,
        });

        if (!patientResult.success) {
            throw new Error("Failed to create patient");
        }

        const patientFhirId = patientResult.fhir_id!;

        fhirResources.push({
            resourceType: "patient",
            fhirId: patientFhirId,
        });

        // Encounter
        const encounterNaturalLanguage = `${encounter.date} is the date of the encounter. It was an ambulatory encounter with patient ${patient.name} with FHIR ID ${patientFhirId}`;
        const encounterResult = await client.tools.createFhirResource({
            provider: fhirProviderId,
            resource: "encounter",
            text: encounterNaturalLanguage,
        });

        if (!encounterResult.success) {
            throw new Error("Failed to create encounter");
        }

        const encounterFhirId = encounterResult.fhir_id!;

        fhirResources.push({
            resourceType: "encounter",
            fhirId: encounterFhirId,
        });

        // Condition (for chief complaint)
        const conditionNaturalLanguage = `${chiefComplaint} is the chief complaint`;
        const conditionResult = await client.tools.createFhirResource({
            provider: fhirProviderId,
            resource: "condition-encounter-diagnosis",
            text: conditionNaturalLanguage,
        });

        if (!conditionResult.success) {
            throw new Error("Failed to create condition");
        }

        fhirResources.push({
            resourceType: "condition",
            fhirId: conditionResult.fhir_id!,
        });

        // Observation (for HPI)
        const hpiObservationNaturalLanguage = `${hpi} is the History of Present Illness. This was documented during encounter with FHIR ID ${encounterFhirId}`;
        const hpiObservationResult = await client.tools.createFhirResource({
            provider: fhirProviderId,
            resource: "simple-observation",
            text: hpiObservationNaturalLanguage,
        });

        if (!hpiObservationResult.success) {
            throw new Error("Failed to create HPI observation");
        }

        fhirResources.push({
            resourceType: "observation",
            fhirId: hpiObservationResult.fhir_id!,
        });

        // Conditions (for allergies)
        for (const allergy of allergies) {
            const allergyNaturalLanguage = `The patient has the following allergy: ${allergy}. This was documented during the encounter with FHIR ID ${encounterFhirId}`;
            const allergyResult = await client.tools.createFhirResource({
                provider: fhirProviderId,
                resource: "condition-problems-health-concerns",
                text: allergyNaturalLanguage,
            });

            if (!allergyResult.success) {
                throw new Error("Failed to create allergy");
            }

            fhirResources.push({
                resourceType: "condition",
                fhirId: allergyResult.fhir_id!,
            });
        }

        // MedicationRequests
        for (const medication of medications) {
            const medicationNaturalLanguage = `The patient is taking the following medication: ${medication}. This was documented during the encounter with FHIR ID ${encounterFhirId}`;
            const medicationResult = await client.tools.createFhirResource({
                provider: fhirProviderId,
                resource: "medicationrequest",
                text: medicationNaturalLanguage,
            });
            if (!medicationResult.success) {
                throw new Error("Failed to create medication");
            }

            fhirResources.push({
                resourceType: "medication-request",
                fhirId: medicationResult.fhir_id!,
            });
        }

        // Conditions
        for (const condition of conditions) {
            const conditionNaturalLanguage = `The patient has the following condition: ${condition}. This was documented during the encounter with FHIR ID ${encounterFhirId}`;
            const conditionResult = await client.tools.createFhirResource({
                provider: fhirProviderId,
                resource: "condition-problems-health-concerns",
                text: conditionNaturalLanguage,
            });

            if (!conditionResult.success) {
                throw new Error("Failed to create condition");
            }

            fhirResources.push({
                resourceType: "condition",
                fhirId: conditionResult.fhir_id!,
            });
        }

        await ctx.runMutation(internal.fhir.storeFhirResources, {
            fhirResources,
            caseId,
        });

        return {
            success: true,
            message: "Successfully sent case to Medplum",
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
