# Demo sandbox

- URL: `https://private-caption-export.sociobot.in/demo` or local `/demo`.
- Sample: a five-span accessibility review with three agreed selections, one uncertain speaker, and confirmed consent.
- Storage: demo edits use `sessionStorage` key `demo:pce:project`. Real work uses `localStorage` key `pce:project`.
- Reset: choose **Reset demo**. Choose **Start for real** to discard demo edits and open an empty local workspace.
- Verification: `npm run test:e2e` starts from fresh browser contexts and uses only this sample.
