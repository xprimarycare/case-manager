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
    SegmentedControl,
    NumberInput,
    Select,
    Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { useNavigate, useParams } from "react-router-dom";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { WithoutSystemFields } from "convex/server";

type Mode = "ai" | "detailed";

type FormValues = {
    title: string;
    summary: string;
    patient: {
        name: string;
        gender: string;
        dateOfBirth: string;
    };
    note: {
        hpi: string;
        reasonForVisit: string;
        assessment: string;
        plan: string;
    };
    vitals: {
        height: number | undefined;
        weightLbs: number | undefined;
        weightOz: number | undefined;
        waistCircumference: number | undefined;
        temperature: number | undefined;
        temperatureSite: string;
        bloodPressureSystolic: number | undefined;
        bloodPressureDiastolic: number | undefined;
        bloodPressureSite: string;
        pulseRate: number | undefined;
        pulseRhythm: string;
        respirationRate: number | undefined;
        oxygenSaturation: number | undefined;
        notes: string;
    };
    physicalExam: {
        constitutional: string;
        cardiovascular: string;
        pulmonary: string;
        other: string;
    };
};

// Helper: Convert lbs/oz to decimal pounds
const convertLbsOzToDecimal = (
    lbs: number | undefined,
    oz: number | undefined
): number | undefined => {
    if (lbs === undefined) return undefined;
    return lbs + (oz || 0) / 16;
};

// Helper: Convert decimal pounds to lbs/oz
const convertDecimalToLbsOz = (
    weight: number | undefined
): { lbs: number | undefined; oz: number | undefined } => {
    if (weight === undefined) return { lbs: undefined, oz: undefined };
    const lbs = Math.floor(weight);
    const decimalPart = weight - lbs;
    const ounces = Math.round(decimalPart * 16);
    return {
        lbs,
        oz: ounces > 0 ? ounces : undefined,
    };
};

// Helper: Map caseData to form values
const mapCaseDataToFormValues = (caseData: Doc<"cases">) => {
    const { lbs, oz } = convertDecimalToLbsOz(caseData.vitals?.weight);
    return {
        title: caseData.title,
        summary: caseData.summary || "",
        patient: {
            name: caseData.patient.name || "",
            gender: caseData.patient.gender || "",
            dateOfBirth: caseData.patient.dateOfBirth || "",
        },
        note: {
            hpi: caseData.note?.hpi || "",
            reasonForVisit: caseData.note?.reasonForVisit || "",
            assessment: caseData.note?.assessment || "",
            plan: caseData.note?.plan || "",
        },
        vitals: {
            height: caseData.vitals?.height,
            weightLbs: lbs,
            weightOz: oz,
            waistCircumference: caseData.vitals?.waistCircumference,
            temperature: caseData.vitals?.temperature,
            temperatureSite: caseData.vitals?.temperatureSite || "",
            bloodPressureSystolic: caseData.vitals?.bloodPressureSystolic,
            bloodPressureDiastolic: caseData.vitals?.bloodPressureDiastolic,
            bloodPressureSite: caseData.vitals?.bloodPressureSite || "",
            pulseRate: caseData.vitals?.pulseRate,
            pulseRhythm: caseData.vitals?.pulseRhythm || "",
            respirationRate: caseData.vitals?.respirationRate,
            oxygenSaturation: caseData.vitals?.oxygenSaturation,
            notes: caseData.vitals?.notes || "",
        },
        physicalExam: {
            constitutional: caseData.physicalExam?.constitutional || "",
            cardiovascular: caseData.physicalExam?.cardiovascular || "",
            pulmonary: caseData.physicalExam?.pulmonary || "",
            other: caseData.physicalExam?.other || "",
        },
    };
};

// Helper: Build case payload for mutations
const buildCasePayload = (
    formValues: FormValues
): WithoutSystemFields<Omit<Doc<"cases">, "updatedAt">> => {
    return {
        title: formValues.title,
        summary: formValues.summary || undefined,
        patient: {
            name: formValues.patient.name,
            gender: formValues.patient.gender || undefined,
            dateOfBirth: formValues.patient.dateOfBirth || undefined,
        },
        note: {
            hpi: formValues.note.hpi || undefined,
            reasonForVisit: formValues.note.reasonForVisit || undefined,
            assessment: formValues.note.assessment || undefined,
            plan: formValues.note.plan || undefined,
        },
        vitals: {
            height: formValues.vitals.height,
            weight: convertLbsOzToDecimal(
                formValues.vitals.weightLbs,
                formValues.vitals.weightOz
            ),
            waistCircumference: formValues.vitals.waistCircumference,
            temperature: formValues.vitals.temperature,
            temperatureSite: formValues.vitals.temperatureSite || undefined,
            bloodPressureSystolic: formValues.vitals.bloodPressureSystolic,
            bloodPressureDiastolic: formValues.vitals.bloodPressureDiastolic,
            bloodPressureSite: formValues.vitals.bloodPressureSite || undefined,
            pulseRate: formValues.vitals.pulseRate,
            pulseRhythm: formValues.vitals.pulseRhythm || undefined,
            respirationRate: formValues.vitals.respirationRate,
            oxygenSaturation: formValues.vitals.oxygenSaturation,
            notes: formValues.vitals.notes || undefined,
        },
        physicalExam: {
            constitutional: formValues.physicalExam.constitutional || undefined,
            cardiovascular: formValues.physicalExam.cardiovascular || undefined,
            pulmonary: formValues.physicalExam.pulmonary || undefined,
            other: formValues.physicalExam.other || undefined,
        },
    };
};

const CaseCreator = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const createCase = useMutation(api.cases.createCase);
    const updateCase = useMutation(api.cases.updateCase);
    const caseData: Doc<"cases"> | null | undefined = useQuery(
        api.cases.getCase,
        {
            id: id as Id<"cases">,
        }
    );
    const isQueryLoading = isEditMode && caseData === undefined;
    const isFormDisabled = isLoading || isQueryLoading;

    const [mode, setMode] = useState<Mode>("detailed");

    // Update mode when caseData loads in edit mode
    useEffect(() => {
        if (isEditMode && caseData) {
            setMode(caseData.summary ? "ai" : "detailed");
        }
    }, [caseData, isEditMode]);

    const form = useForm<FormValues>({
        initialValues: {
            title: "",
            summary: "",
            patient: {
                name: "",
                gender: "",
                dateOfBirth: "",
            },
            note: {
                hpi: "",
                reasonForVisit: "",
                assessment: "",
                plan: "",
            },
            vitals: {
                height: undefined as number | undefined,
                weightLbs: undefined as number | undefined,
                weightOz: undefined as number | undefined,
                waistCircumference: undefined as number | undefined,
                temperature: undefined as number | undefined,
                temperatureSite: "",
                bloodPressureSystolic: undefined as number | undefined,
                bloodPressureDiastolic: undefined as number | undefined,
                bloodPressureSite: "",
                pulseRate: undefined as number | undefined,
                pulseRhythm: "",
                respirationRate: undefined as number | undefined,
                oxygenSaturation: undefined as number | undefined,
                notes: "",
            },
            physicalExam: {
                constitutional: "",
                cardiovascular: "",
                pulmonary: "",
                other: "",
            },
        },
        validate: (values) => {
            const errors: Record<string, any> = {};

            if (!values.title.trim()) {
                errors.title = "Title is required";
            }

            if (!values.patient.name.trim()) {
                errors["patient.name"] = "Patient name is required";
            }

            if (mode === "ai") {
                if (!values.summary.trim()) {
                    errors.summary = "Summary is required";
                }
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

            if (isEditMode && id) {
                await updateCase({
                    id: id as Id<"cases">,
                    ...payload,
                });
            } else {
                await createCase(payload);
            }
            form.reset();
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
                    {/* Mode toggle - only show in create mode */}
                    {!isEditMode && (
                        <Group>
                            <Text size="sm" fw={500}>
                                Entry mode:
                            </Text>
                            <SegmentedControl
                                value={mode}
                                onChange={(value) => setMode(value as Mode)}
                                data={[
                                    { label: "AI", value: "ai" },
                                    {
                                        label: "Detailed",
                                        value: "detailed",
                                    },
                                ]}
                                disabled={isFormDisabled}
                            />
                        </Group>
                    )}

                    {/* Title - always shown */}
                    <TextInput
                        label="Title"
                        placeholder="Enter case title"
                        disabled={isFormDisabled}
                        {...form.getInputProps("title")}
                    />

                    {/* AI Mode Fields */}
                    {mode === "ai" && (
                        <>
                            <TextInput
                                label="Patient Name"
                                placeholder="Enter patient name"
                                disabled={isFormDisabled}
                                {...form.getInputProps("patient.name")}
                            />
                            <Textarea
                                label="Summary"
                                placeholder="Enter case summary"
                                minRows={5}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("summary")}
                            />
                        </>
                    )}

                    {/* Detailed Mode Fields */}
                    {mode === "detailed" && (
                        <Stack gap="md">
                            {/* Patient Information */}
                            <Divider
                                label="Patient Information"
                                labelPosition="left"
                            />
                            <TextInput
                                label="Patient Name"
                                placeholder="Enter patient name"
                                disabled={isFormDisabled}
                                {...form.getInputProps("patient.name")}
                            />
                            <Group grow>
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
                                />
                                <TextInput
                                    label="Date of Birth"
                                    placeholder="MM/DD/YYYY"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "patient.dateOfBirth"
                                    )}
                                />
                            </Group>

                            {/* Note */}
                            <Divider label="Note" labelPosition="left" />
                            <Textarea
                                label="History of Present Illness (HPI)"
                                placeholder="Enter HPI"
                                minRows={3}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("note.hpi")}
                            />
                            <Textarea
                                label="Reason for Visit"
                                placeholder="Enter reason for visit"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("note.reasonForVisit")}
                            />
                            <Textarea
                                label="Assessment"
                                placeholder="Enter assessment"
                                minRows={3}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("note.assessment")}
                            />
                            <Textarea
                                label="Plan"
                                placeholder="Enter plan"
                                minRows={3}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("note.plan")}
                            />

                            {/* Vitals */}
                            <Divider label="Vitals" labelPosition="left" />
                            <Group grow>
                                <NumberInput
                                    label="Height (in)"
                                    placeholder="Enter height in inches"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps("vitals.height")}
                                    allowDecimal
                                />
                                <NumberInput
                                    label="Waist Circumference (in)"
                                    placeholder="Enter waist circumference in inches"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.waistCircumference"
                                    )}
                                    allowDecimal
                                />
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label="Weight (lbs)"
                                    placeholder="Enter pounds"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps("vitals.weightLbs")}
                                    decimalScale={0}
                                />
                                <NumberInput
                                    label="Weight (oz)"
                                    placeholder="Enter ounces"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps("vitals.weightOz")}
                                    min={0}
                                    max={15}
                                />
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label="Temperature"
                                    placeholder="Enter temperature"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.temperature"
                                    )}
                                    allowDecimal
                                />
                                <Select
                                    label="Temperature Site"
                                    placeholder="Select site"
                                    data={[
                                        "Oral",
                                        "Rectal",
                                        "Axillary",
                                        "Tympanic",
                                        "Temporal",
                                    ]}
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.temperatureSite"
                                    )}
                                    clearable
                                />
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label="Blood Pressure Systolic"
                                    placeholder="Enter systolic"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.bloodPressureSystolic"
                                    )}
                                />
                                <NumberInput
                                    label="Blood Pressure Diastolic"
                                    placeholder="Enter diastolic"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.bloodPressureDiastolic"
                                    )}
                                />
                                <Select
                                    label="Blood Pressure Site"
                                    placeholder="Select site"
                                    data={[
                                        "Left Arm",
                                        "Right Arm",
                                        "Left Leg",
                                        "Right Leg",
                                    ]}
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.bloodPressureSite"
                                    )}
                                    clearable
                                />
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label="Pulse Rate (bpm)"
                                    placeholder="Enter pulse rate"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps("vitals.pulseRate")}
                                />
                                <Select
                                    label="Pulse Rhythm"
                                    placeholder="Select rhythm"
                                    data={["Regular", "Irregular"]}
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.pulseRhythm"
                                    )}
                                    clearable
                                />
                                <NumberInput
                                    label="Respiration Rate"
                                    placeholder="Enter respiration rate"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.respirationRate"
                                    )}
                                />
                                <NumberInput
                                    label="Oxygen Saturation (%)"
                                    placeholder="Enter oxygen saturation"
                                    disabled={isFormDisabled}
                                    {...form.getInputProps(
                                        "vitals.oxygenSaturation"
                                    )}
                                    allowDecimal
                                    min={0}
                                    max={100}
                                />
                            </Group>
                            <Textarea
                                label="Vitals Notes"
                                placeholder="Enter additional vitals notes"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("vitals.notes")}
                            />

                            {/* Physical Exam */}
                            <Divider
                                label="Physical Exam"
                                labelPosition="left"
                            />
                            <Textarea
                                label="Constitutional"
                                placeholder="Enter constitutional findings"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps(
                                    "physicalExam.constitutional"
                                )}
                            />
                            <Textarea
                                label="Cardiovascular"
                                placeholder="Enter cardiovascular findings"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps(
                                    "physicalExam.cardiovascular"
                                )}
                            />
                            <Textarea
                                label="Pulmonary"
                                placeholder="Enter pulmonary findings"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps(
                                    "physicalExam.pulmonary"
                                )}
                            />
                            <Textarea
                                label="Other"
                                placeholder="Enter other findings"
                                minRows={2}
                                autosize
                                disabled={isFormDisabled}
                                {...form.getInputProps("physicalExam.other")}
                            />
                        </Stack>
                    )}

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
