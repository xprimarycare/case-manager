import { useEffect, useState } from "react";
import {
    TextInput,
    Textarea,
    Button,
    Stack,
    Title,
    Group,
    Text,
    Loader,
    Select,
    Divider,
    Checkbox,
    TagsInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { useNavigate, useParams } from "react-router-dom";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { WithoutSystemFields } from "convex/server";

type FormValues = {
    title: string;
    patient: {
        name: string;
        gender: string;
        dateOfBirth: string;
    };
    encounterDate: string;
    chiefComplaint: string;
    hpi: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
};

// Helper: Map caseData to form values
const mapCaseDataToFormValues = (caseData: Doc<"cases">) => {
    return {
        title: caseData.title,
        patient: {
            name: caseData.patient.name || "",
            gender: caseData.patient.gender || "",
            dateOfBirth: caseData.patient.dateOfBirth || "",
        },
        encounterDate: caseData.encounter?.date || "",
        chiefComplaint: caseData.chiefComplaint || "",
        hpi: caseData.hpi || "",
        allergies: caseData.allergies ?? [],
        medications: caseData.medications ?? [],
        conditions: caseData.conditions ?? [],
    };
};

// Helper: Build case payload for mutations
const buildCasePayload = (
    formValues: FormValues
): WithoutSystemFields<Omit<Doc<"cases">, "updatedAt">> => {
    return {
        title: formValues.title,
        patient: {
            name: formValues.patient.name,
            gender: formValues.patient.gender || undefined,
            dateOfBirth: formValues.patient.dateOfBirth || undefined,
        },
        encounter: {
            date: formValues.encounterDate || undefined,
        },
        chiefComplaint: formValues.chiefComplaint || undefined,
        hpi: formValues.hpi || undefined,
        allergies: formValues.allergies,
        medications: formValues.medications,
        conditions: formValues.conditions,
    };
};

const CaseCreator = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [sendToEmr, setSendToEmr] = useState(() => !isEditMode);
    const createCase = useMutation(api.cases.createCase);
    const updateCase = useMutation(api.cases.updateCase);
    const sendToEmrAction = useAction(api.fhir.sendCaseToEmrThroughPhenoML);
    const caseData: Doc<"cases"> | null | undefined = useQuery(
        api.cases.getCase,
        {
            id: id as Id<"cases">,
        }
    );
    const isQueryLoading = isEditMode && caseData === undefined;
    const isFormDisabled = isLoading || isQueryLoading;

    const form = useForm<FormValues>({
        initialValues: {
            title: "",
            patient: {
                name: "",
                gender: "",
                dateOfBirth: "",
            },
            encounterDate: new Date().toISOString().split("T")[0],
            chiefComplaint: "",
            hpi: "",
            allergies: [],
            medications: [],
            conditions: [],
        },
        validate: (values) => {
            const errors: Record<string, any> = {};

            if (!values.title.trim()) {
                errors.title = "Title is required";
            }

            if (!values.patient.name.trim()) {
                errors["patient.name"] = "Patient name is required";
            }

            return errors;
        },
    });

    useEffect(() => {
        if (isEditMode && caseData) {
            form.setValues(mapCaseDataToFormValues(caseData));
        }
    }, [caseData, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.validate().hasErrors) {
            return;
        }
        setIsLoading(true);
        try {
            const title = form.values.title;
            const payload = buildCasePayload(form.values);

            let caseId: Id<"cases">;
            if (isEditMode && id) {
                await updateCase({
                    id: id as Id<"cases">,
                    ...payload,
                });
                caseId = id as Id<"cases">;
            } else {
                caseId = await createCase(payload);
            }

            // Send to the EMR if checkbox is checked
            if (sendToEmr) {
                try {
                    // Convert encounter date to ISO string
                    const encounterDateISO = form.values.encounterDate
                        ? new Date(form.values.encounterDate).toISOString()
                        : new Date().toISOString();

                    const fhirResult = await sendToEmrAction({
                        caseId,
                        patient: {
                            name: form.values.patient.name,
                            gender: form.values.patient.gender,
                            dateOfBirth: form.values.patient.dateOfBirth,
                        },
                        encounter: {
                            date: encounterDateISO,
                        },
                        chiefComplaint: form.values.chiefComplaint,
                        hpi: form.values.hpi,
                        allergies: form.values.allergies,
                        medications: form.values.medications,
                        conditions: form.values.conditions,
                    });

                    if (fhirResult.success) {
                        notifications.show({
                            message: (
                                <Text>
                                    Case "{title}" successfully{" "}
                                    {isEditMode ? "updated" : "created"} and
                                    sent to EMR.
                                </Text>
                            ),
                            title: "Success",
                            color: "green",
                            icon: <IconCheck />,
                            withBorder: true,
                        });
                    } else {
                        notifications.show({
                            message: (
                                <Text>
                                    Case "{title}" saved, but failed to send to
                                    EMR: {fhirResult.message}
                                </Text>
                            ),
                            title: "Warning",
                            color: "yellow",
                            withBorder: true,
                        });
                    }
                } catch (error) {
                    console.error("Error sending to EMR:", error);
                    notifications.show({
                        message: (
                            <Text>
                                Case "{title}" saved, but error sending to EMR:{" "}
                                {error instanceof Error
                                    ? error.message
                                    : "Unknown error"}
                            </Text>
                        ),
                        title: "Warning",
                        color: "yellow",
                        withBorder: true,
                    });
                }
            } else {
                notifications.show({
                    message: (
                        <Text>
                            Case "{title}" successfully{" "}
                            {isEditMode ? "updated" : "created"}
                        </Text>
                    ),
                    title: "Success",
                    color: "green",
                    icon: <IconCheck />,
                    withBorder: true,
                });
            }

            form.reset();
            navigate("/");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackClick = () => {
        modals.openConfirmModal({
            title: "Leave page?",
            children:
                "Are you sure you want to go back to the case list? Any unsaved changes will be lost.",
            labels: { confirm: "Discard unsaved changes", cancel: "Stay here" },
            onConfirm: () => navigate("/"),
            confirmProps: { color: "red" },
        });
    };

    return (
        <>
            <Group align="center">
                <Button
                    leftSection={<IconArrowLeft />}
                    onClick={handleBackClick}
                    disabled={isFormDisabled}
                    variant="outline"
                >
                    Back to case list
                </Button>
                <Title order={2}>
                    {isEditMode ? "Edit case" : "Create case"}
                </Title>
            </Group>
            <form onSubmit={handleSubmit}>
                <Stack gap="md" style={{ position: "relative" }}>
                    {/* Title */}
                    <TextInput
                        label="Title"
                        placeholder="Enter case title"
                        disabled={isFormDisabled}
                        {...form.getInputProps("title")}
                        maw={600}
                    />

                    <Divider />
                    {/* Patient Information */}
                    <Stack>
                        <Title order={5}>Patient Information</Title>
                        <Stack>
                            <TextInput
                                label="Patient Name"
                                placeholder="Enter patient name"
                                disabled={isFormDisabled}
                                {...form.getInputProps("patient.name")}
                                maw={300}
                            />
                            <Select
                                label="Gender"
                                placeholder="Select gender"
                                data={[
                                    "Male",
                                    "Female",
                                    "Other",
                                    "Prefer not to say",
                                ]}
                                disabled={isFormDisabled}
                                {...form.getInputProps("patient.gender")}
                                clearable
                                searchable
                                maw={175}
                            />
                            <TextInput
                                label="Date of Birth"
                                type="date"
                                disabled={isFormDisabled}
                                {...form.getInputProps("patient.dateOfBirth")}
                                maw={175}
                            />
                        </Stack>
                    </Stack>
                    <Divider />

                    {/* Encounter Information */}
                    <Stack>
                        <Title order={5}>Encounter Information</Title>
                        <Stack>
                            <TextInput
                                label="Encounter Date"
                                type="date"
                                disabled={isFormDisabled}
                                {...form.getInputProps("encounterDate")}
                                maw={175}
                            />
                            <Textarea
                                label="Chief Complaint"
                                placeholder="Enter chief complaint"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("chiefComplaint")}
                                maw={500}
                            />
                            <Textarea
                                label="History of Present Illness (HPI)"
                                placeholder="Enter HPI"
                                minRows={3}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("hpi")}
                                maw={500}
                            />
                            <TagsInput
                                label="Allergies (press enter to add)"
                                disabled={isFormDisabled}
                                {...form.getInputProps("allergies")}
                                maw={500}
                            />
                            <TagsInput
                                label="Medications (press enter to add)"
                                disabled={isFormDisabled}
                                {...form.getInputProps("medications")}
                                maw={500}
                            />
                            <TagsInput
                                label="Conditions (press enter to add)"
                                disabled={isFormDisabled}
                                {...form.getInputProps("conditions")}
                                maw={500}
                            />
                        </Stack>
                    </Stack>

                    <Divider />

                    <Checkbox
                        label="Create in EMR"
                        checked={sendToEmr}
                        onChange={(e) => setSendToEmr(e.currentTarget.checked)}
                        disabled={isFormDisabled}
                        description={`If checked, the ${isEditMode ? "Update" : "Create"} case button will also create a copy of the case in the EMR`}
                    />

                    <Group>
                        <Button type="submit" loading={isLoading}>
                            {isEditMode ? "Update case" : "Create case"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleBackClick}
                            disabled={isFormDisabled}
                        >
                            Cancel
                        </Button>
                    </Group>
                    {isQueryLoading && (
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                zIndex: 1000,
                            }}
                        >
                            <Loader size="lg" />
                        </div>
                    )}
                </Stack>
            </form>
        </>
    );
};

export default CaseCreator;
