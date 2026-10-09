# Load test instructions

The specification requires at least 10 concurrent users for 60 seconds. This result must be collected on the actual target deployment; no load test was run from this workspace.

## Apache JMeter quick plan

1. Install Apache JMeter.
2. Create a Thread Group with 10 threads, ramp-up 5 seconds, loop forever, and a 60-second duration.
3. Add HTTP Request defaults for the deployed host/context.
4. Add scenarios for `GET /api/v1/health` and `GET /api/v1/products`.
5. For session-protected paths, create separate login requests with test accounts and preserve cookies using an HTTP Cookie Manager. Avoid sharing one buyer account across concurrent order creation.
6. Add Summary Report and Aggregate Report listeners; run headless if possible and save the `.jtl` result.
7. Record throughput, average/90th-percentile latency, error rate and server CPU/memory. Attach the report to the final review evidence.
