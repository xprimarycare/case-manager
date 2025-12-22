import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider, Stack } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import CaseCreator from "./CaseCreator";
import CaseList from "./CaseList";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export default function App() {
    return (
        <ConvexProvider client={convex}>
            <MantineProvider theme={theme} defaultColorScheme="auto">
                <Notifications autoClose={5000} />
                <ModalsProvider>
                    <BrowserRouter>
                        <Stack m="xl">
                            <Routes>
                                <Route path="/" element={<CaseList />} />
                                <Route
                                    path="/create"
                                    element={<CaseCreator />}
                                />
                                <Route
                                    path="/edit/:id"
                                    element={<CaseCreator />}
                                />
                            </Routes>
                        </Stack>
                    </BrowserRouter>
                </ModalsProvider>
            </MantineProvider>
        </ConvexProvider>
    );
}
