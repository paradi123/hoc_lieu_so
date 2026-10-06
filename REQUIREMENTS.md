# CHEMLAB - Requirements and Setup

## Runtime requirements

- Node.js 20 or newer
- pnpm 9 or newer
- A modern browser with JavaScript enabled
- Windows PowerShell, macOS Terminal, or Linux shell

The project is a React 19 + Vite 8 application. Dependencies are declared in `package.json` and locked in `pnpm-lock.yaml`.

thử chạy 2 cái này trước nhé
pnpm.cmd install
pnpm.cmd run dev

## Install

From the project root:

```bash
pnpm install
```

On Windows PowerShell, if script execution blocks the pnpm shim, use:

```powershell
pnpm.cmd install
```

## Run locally

```bash
pnpm run dev
```

On Windows PowerShell:

```powershell
pnpm.cmd run dev
```

Open the URL printed by Vite, usually `http://localhost:8443/`.

## Build and preview

Create a production build:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

The generated files are written to `dist/`.

## Application roles

- **Học sinh:** enter a name, study the interactive materials, answer questions, and view the result.
- **Giáo viên:** choose the teacher role and enter the local access code `0000` to open the dashboard.

The teacher dashboard can edit practice questions, configure video question timestamps and types, and select a video file.

## Data storage

This local version stores question settings, video settings, and progress records in the browser's `localStorage`. Data is therefore limited to the current browser and device. A shared classroom deployment needs a backend or a hosted storage service.

Uploaded videos are stored as browser data. Use small test files locally; production video uploads should use object storage or a server.

## Project structure

- `src/App.tsx` - main layout, role selection, knowledge tabs, teacher dashboard, and practice flow
- `src/InteractiveVideoLesson.tsx` - interactive video player and timed questions
- `src/HISimulation.tsx` - H2 + I2 equilibrium simulation
- `src/index.css` - global styles and responsive layout
- `public/videos/` - bundled video assets
- `src/main.tsx` - React entry point

## Formatting

Format the project with:

```bash
pnpm run format
```
