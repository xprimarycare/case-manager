import {
    Title,
    Stack,
    Button,
    Table,
    Group,
    Tooltip,
    TextInput,
} from "@mantine/core";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format, isThisYear, isToday } from "date-fns";
import { useState } from "react";
import { useStablePaginatedQuery } from "./helpers";

const formatSmartDate = (date: Date): string => {
    if (isToday(date)) {
        return `Today, ${format(date, "h:mm a")}`;
    }
    const formatString = isThisYear(date)
        ? "MMM d, h:mm a"
        : "MMM d, yyyy h:mm a";
    return format(date, formatString);
};

const CaseList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const { results, status, loadMore } = useStablePaginatedQuery(
        api.cases.getCaseList,
        { searchTerm },
        { initialNumItems: 10 }
    );
    const typedResults: Doc<"cases">[] = results;

    return (
        <Stack gap="md">
            <Group>
                <Title order={2}>Cases</Title>
                <Button onClick={() => navigate("/create")}>
                    + Create new case
                </Button>
            </Group>
            <TextInput
                placeholder="Search cases by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
            />
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Patient name</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Last updated</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {typedResults.map((caseItem) => (
                        <Table.Tr
                            key={caseItem._id}
                            onClick={() => navigate(`/edit/${caseItem._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <Table.Td>{caseItem.title}</Table.Td>
                            <Table.Td>{caseItem.patient.name}</Table.Td>
                            <Table.Td>
                                {formatSmartDate(
                                    new Date(caseItem._creationTime)
                                )}{" "}
                                (
                                {formatDistanceToNow(
                                    new Date(caseItem._creationTime),
                                    { addSuffix: true }
                                )}
                                )
                            </Table.Td>
                            <Table.Td>
                                {formatSmartDate(new Date(caseItem.updatedAt))}{" "}
                                (
                                {formatDistanceToNow(
                                    new Date(caseItem.updatedAt),
                                    { addSuffix: true }
                                )}
                                )
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            {status === "CanLoadMore" ? (
                <Button onClick={() => loadMore(10)}>Load more</Button>
            ) : (
                <Tooltip label="No more cases to load">
                    <Button data-disabled onClick={(e) => e.preventDefault()}>
                        Load more
                    </Button>
                </Tooltip>
            )}
        </Stack>
    );
};

export default CaseList;
