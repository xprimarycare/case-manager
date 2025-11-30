import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Paper,
  Title,
  Alert,
} from '@mantine/core';
import axios from 'axios';
import { CreateCaseDto } from '@case-manager/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set');
}

const CaseForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<CreateCaseDto>({
    initialValues: {
      title: '',
      patientName: '',
      summary: '',
    },
    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title is required';
        }
        if (value.trim().length < 3) {
          return 'Title must be at least 3 characters';
        }
        return null;
      },
      patientName: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Patient name is required';
        }
        return null;
      },
      summary: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Summary is required';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: CreateCaseDto) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(`${API_BASE_URL}/cases`, values);
      form.reset();
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'An error occurred while saving the case'
        );
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Title order={2}>Create Case</Title>

        {success && (
          <Alert
            color="green"
            onClose={() => setSuccess(false)}
            withCloseButton
          >
            Case created successfully!
          </Alert>
        )}

        {error && (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="Enter case title"
              {...form.getInputProps('title')}
            />

            <TextInput
              label="Patient Name"
              placeholder="Enter patient name"
              {...form.getInputProps('patientName')}
            />

            <Textarea
              label="Summary"
              placeholder="Enter case summary"
              minRows={5}
              autosize
              {...form.getInputProps('summary')}
            />

            <Button type="submit" loading={loading} fullWidth>
              Create Case
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};

export default CaseForm;
