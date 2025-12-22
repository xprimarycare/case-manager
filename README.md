# XPC Case Management

This app uses [Vite](https://vite.dev) for the frontend [Convex](https://convex.dev) for the backend. It integrates with EMRs using [PhenoML](https://www.phenoml.com/).

## Run the app locally

1. Clone the repo
2. Install dependencies with `npm install`
3. Start Convex with `npx convex dev`. This will install the Convex backend locally.
4. In another terminal, run the Vite dev server with `npm run dev`

## Integration with EMR via PhenoML

1. In PhenoML, create a FHIR provider ID to integrate with your EMR.
2. With `npx convex dev` still running, open a new terminal in the project directory.
3. Set the PhenoML-related variables.

```
npx convex env set PHENOML_USERNAME "your-username"
npx convex env set PHENOML_PASSWORD "your-password"
npx convex env set PHENOML_BASE_URL "your-base-url"
npx convex env set PHENOML_FHIR_PROVIDER_ID "your-fhir-provider-id"
```
